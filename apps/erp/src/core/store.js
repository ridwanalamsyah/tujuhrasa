// src/core/store.js
// Centralized state — Single Source of Truth.
// - Immutable update via reducer-like setter (return state baru, bukan mutasi langsung).
// - Subscriber dengan selector & equality check (anti re-render tidak perlu).
// - Batch notifikasi via microtask scheduler.
// - Persistence opsional via KVStore (data abstraction layer).

import { createScheduler, shallowEqual } from './perf.js';
import { bus } from './eventBus.js';
import { logger } from './logger.js';

export class Store {
  /**
   * @param {object} initialState
   * @param {object} [opts]
   * @param {KVStore} [opts.kv] adapter persistence
   * @param {string} [opts.persistKey] kunci untuk persist
   * @param {Set<string>} [opts.transientKeys] field yang TIDAK di-persist
   * @param {(s:object)=>object} [opts.migrate] hook migrasi saat load
   */
  constructor(initialState, opts = {}) {
    this._state = freezeShallow({ ...initialState });
    this._subs  = new Set();
    this._kv    = opts.kv || null;
    this._key   = opts.persistKey || 'state';
    this._transient = opts.transientKeys || new Set(['posCart', 'financeChartInst', 'salesChartInst']);
    this._migrate   = opts.migrate || ((s) => s);
    this._schedule  = createScheduler();
    this._dirty     = false;
    this._loaded    = false;
  }

  getState() { return this._state; }

  /**
   * Update menerima fungsi (state) => patch | null. Patch akan di-shallow-merge.
   * Mengembalikan boolean apakah ada perubahan.
   */
  update(name, mutator) {
    const prev = this._state;
    let patch;
    try { patch = mutator(prev); }
    catch (e) {
      logger.error('Store.update mutator error', { name, error: e });
      throw e;
    }
    if (patch == null) return false;
    const next = { ...prev, ...patch };
    if (shallowEqual(prev, next)) return false;
    this._state = freezeShallow(next);
    this._dirty = true;
    bus.emit('store:change', { name, prev, next, patch });
    this._scheduleNotify();
    this._schedulePersist();
    return true;
  }

  /**
   * Helper untuk update entity dalam koleksi (array of {id}).
   * action: 'create' | 'update' | 'delete'
   */
  updateCollection(collectionKey, action, entity) {
    return this.update(`${collectionKey}.${action}`, (s) => {
      const list = Array.isArray(s[collectionKey]) ? s[collectionKey] : [];
      let next;
      if (action === 'create') {
        if (list.some(x => x.id === entity.id)) return null;
        next = [...list, entity];
      } else if (action === 'update') {
        const idx = list.findIndex(x => x.id === entity.id);
        if (idx === -1) return null;
        next = list.slice(); next[idx] = { ...list[idx], ...entity };
      } else if (action === 'delete') {
        next = list.filter(x => x.id !== entity.id);
        if (next.length === list.length) return null;
      } else return null;
      return { [collectionKey]: next };
    });
  }

  /**
   * subscribe(selector, listener, equalityFn?)
   * listener(currentSelected, previousSelected) hanya dipanggil saat hasil
   * selector berubah menurut equalityFn.
   */
  subscribe(selector, listener, equalityFn = Object.is) {
    const sub = { selector, listener, equalityFn, last: selector(this._state) };
    this._subs.add(sub);
    return () => this._subs.delete(sub);
  }

  _scheduleNotify() {
    this._schedule(() => {
      const s = this._state;
      for (const sub of [...this._subs]) {
        let cur;
        try { cur = sub.selector(s); }
        catch (e) { logger.error('Store selector error', { error: e }); continue; }
        if (!sub.equalityFn(cur, sub.last)) {
          const prev = sub.last; sub.last = cur;
          try { sub.listener(cur, prev); }
          catch (e) { logger.error('Store listener error', { error: e }); }
        }
      }
    });
  }

  _schedulePersist() {
    if (!this._kv) return;
    this._schedule(async () => {
      if (!this._dirty) return;
      this._dirty = false;
      const snapshot = this._serializable();
      try {
        await this._kv.set(this._key, snapshot);
        bus.emit('store:persisted', { key: this._key });
      } catch (e) {
        logger.error('Store persist failed', { error: e });
        bus.emit('store:persist-failed', { error: e });
      }
    });
  }

  /**
   * Tunggu sampai pending persist selesai. Penting saat caller perlu memastikan
   * data masuk ke backend sebelum melakukan reload/bootstrap berikutnya.
   * Bila tidak ada perubahan dirty, resolves immediate.
   */
  async flush() {
    if (!this._kv) return;
    if (!this._dirty) return;
    this._dirty = false;
    const snapshot = this._serializable();
    try {
      await this._kv.set(this._key, snapshot);
      bus.emit('store:persisted', { key: this._key });
    } catch (e) {
      logger.error('Store flush failed', { error: e });
      bus.emit('store:persist-failed', { error: e });
      throw e;
    }
  }

  _serializable() {
    const out = {};
    for (const k of Object.keys(this._state)) {
      if (this._transient.has(k)) continue;
      out[k] = this._state[k];
    }
    return out;
  }

  async load() {
    if (!this._kv || this._loaded) return;
    try {
      const raw = await this._kv.get(this._key, null);
      if (raw && typeof raw === 'object') {
        const migrated = this._migrate(raw);
        this._state = freezeShallow({ ...this._state, ...migrated });
        bus.emit('store:loaded', { key: this._key });
      }
      this._loaded = true;
    } catch (e) {
      logger.error('Store load failed', { error: e });
      bus.emit('store:load-failed', { error: e });
    }
  }

  async reset(initialState) {
    this._state = freezeShallow({ ...initialState });
    this._dirty = true;
    if (this._kv) await this._kv.remove(this._key);
    bus.emit('store:reset', {});
    this._scheduleNotify();
  }
}

function freezeShallow(obj) {
  // Object.freeze top-level memberi sinyal bahwa state immutable.
  // Tidak dilakukan deep-freeze untuk performa; konvensi tim: jangan mutasi
  // sub-object — selalu return objek baru di mutator.
  if (typeof Object.freeze === 'function') Object.freeze(obj);
  return obj;
}
