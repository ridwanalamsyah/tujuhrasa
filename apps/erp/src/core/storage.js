// src/core/storage.js
// StorageAdapter — abstraksi tingkat rendah untuk persistence.
// Tidak ada bagian aplikasi lain yang boleh menyentuh localStorage / IndexedDB
// secara langsung; semua harus melewati layer ini.

import { StorageError } from './errorHandler.js';

/** Interface kontrak (didokumentasikan via JSDoc):
 *  - getRaw(key): Promise<string|null>
 *  - setRaw(key, value): Promise<void>
 *  - removeRaw(key): Promise<void>
 *  - keys(): Promise<string[]>
 */

export class MemoryStorageAdapter {
  constructor() { this._map = new Map(); }
  async getRaw(k) { return this._map.has(k) ? this._map.get(k) : null; }
  async setRaw(k, v) { this._map.set(k, String(v)); }
  async removeRaw(k) { this._map.delete(k); }
  async keys() { return [...this._map.keys()]; }
}

export class LocalStorageAdapter {
  constructor({ ls = (typeof localStorage !== 'undefined' ? localStorage : null) } = {}) {
    if (!ls) throw new StorageError('localStorage tidak tersedia di environment ini');
    this.ls = ls;
  }
  async getRaw(k) {
    try { return this.ls.getItem(k); }
    catch (e) { throw new StorageError('Gagal membaca localStorage', e); }
  }
  async setRaw(k, v) {
    try { this.ls.setItem(k, v); }
    catch (e) { throw new StorageError('Gagal menulis localStorage (kuota penuh?)', e); }
  }
  async removeRaw(k) {
    try { this.ls.removeItem(k); }
    catch (e) { throw new StorageError('Gagal menghapus item localStorage', e); }
  }
  async keys() {
    const out = [];
    for (let i = 0; i < this.ls.length; i++) out.push(this.ls.key(i));
    return out;
  }
}

/**
 * IndexedDBStorageAdapter — siap pakai untuk dataset besar.
 * Dibangun atas single object store key/value sederhana.
 */
export class IndexedDBStorageAdapter {
  constructor({ dbName = 'app_db', storeName = 'kv', version = 1 } = {}) {
    this.dbName = dbName; this.storeName = storeName; this.version = version;
    this._dbPromise = null;
  }
  _open() {
    if (this._dbPromise) return this._dbPromise;
    if (typeof indexedDB === 'undefined') throw new StorageError('IndexedDB tidak tersedia');
    this._dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(new StorageError('Gagal membuka IndexedDB', req.error));
    });
    return this._dbPromise;
  }
  async _tx(mode, fn) {
    const db = await this._open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const store = tx.objectStore(this.storeName);
      let result;
      try { result = fn(store); } catch (e) { reject(new StorageError('IDB tx gagal', e)); return; }
      tx.oncomplete = () => resolve(result instanceof IDBRequest ? result.result : result);
      tx.onerror = () => reject(new StorageError('IDB tx error', tx.error));
    });
  }
  async getRaw(k) { return this._tx('readonly', s => s.get(k)); }
  async setRaw(k, v) { return this._tx('readwrite', s => s.put(v, k)); }
  async removeRaw(k) { return this._tx('readwrite', s => s.delete(k)); }
  async keys() { return this._tx('readonly', s => s.getAllKeys()); }
}

/**
 * SupabaseStorageAdapter — sinkron state ke Supabase Postgres via REST.
 *
 * Skema yang diharapkan di Supabase:
 *   create table kv_store (
 *     key text primary key,
 *     value jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 *   alter table kv_store enable row level security;
 *   create policy "owner_rw" on kv_store
 *     for all using (auth.uid() is not null);
 *
 * Pakai anon key + login user (Supabase Auth) untuk authorization.
 * Untuk realtime sync, panggil `subscribeRealtime(onChange)` setelah init.
 */
export class SupabaseStorageAdapter {
  constructor({ url, anonKey, table = 'kv_store', accessToken = null } = {}) {
    if (!url || !anonKey) throw new StorageError('SupabaseStorageAdapter butuh url & anonKey');
    this.url = url.replace(/\/$/, '');
    this.anonKey = anonKey;
    this.accessToken = accessToken;
    this.table = table;
  }
  setAccessToken(t) { this.accessToken = t; }
  _headers(extra = {}) {
    return {
      apikey: this.anonKey,
      Authorization: 'Bearer ' + (this.accessToken || this.anonKey),
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...extra,
    };
  }
  async getRaw(k) {
    const r = await fetch(`${this.url}/rest/v1/${this.table}?key=eq.${encodeURIComponent(k)}&select=value`, { headers: this._headers() });
    if (!r.ok) throw new StorageError(`Supabase GET ${r.status}`);
    const rows = await r.json();
    return rows[0]?.value ? JSON.stringify(rows[0].value) : null;
  }
  async setRaw(k, v) {
    let parsed;
    try { parsed = JSON.parse(v); } catch { parsed = v; }
    const r = await fetch(`${this.url}/rest/v1/${this.table}?on_conflict=key`, {
      method: 'POST',
      headers: this._headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ key: k, value: parsed }),
    });
    if (!r.ok) throw new StorageError(`Supabase UPSERT ${r.status}`);
  }
  async removeRaw(k) {
    const r = await fetch(`${this.url}/rest/v1/${this.table}?key=eq.${encodeURIComponent(k)}`, {
      method: 'DELETE', headers: this._headers(),
    });
    if (!r.ok) throw new StorageError(`Supabase DELETE ${r.status}`);
  }
  async keys() {
    const r = await fetch(`${this.url}/rest/v1/${this.table}?select=key`, { headers: this._headers() });
    if (!r.ok) throw new StorageError(`Supabase LIST ${r.status}`);
    return (await r.json()).map(x => x.key);
  }
  /** Subscribe realtime: butuh @supabase/supabase-js client (load via CDN). */
  subscribeRealtime(onChange) {
    if (typeof window === 'undefined' || !window.supabase) {
      console.warn('[SupabaseAdapter] supabase-js tidak ditemukan; realtime nonaktif. Load via CDN.');
      return () => {};
    }
    const client = window.supabase.createClient(this.url, this.anonKey, {
      global: { headers: this.accessToken ? { Authorization: 'Bearer ' + this.accessToken } : {} },
    });
    const ch = client.channel('kv-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: this.table }, (payload) => {
        try { onChange(payload); } catch (e) { console.error('[SupabaseAdapter] realtime cb', e); }
      })
      .subscribe();
    return () => client.removeChannel(ch);
  }
}

/**
 * KVStore: API tingkat-aplikasi yang JSON-aware, error-safe, dan punya
 * default value. Komponen domain berinteraksi dengan kelas ini, bukan adapter.
 */
export class KVStore {
  constructor(adapter, { namespace = 'app' } = {}) {
    this.adapter = adapter;
    this.ns = namespace;
  }
  _key(k) { return `${this.ns}:${k}`; }

  async get(key, defaultValue = null) {
    const raw = await this.adapter.getRaw(this._key(key));
    if (raw == null) return defaultValue;
    try { return JSON.parse(raw); }
    catch (e) {
      // Data korup — jangan crash, kembalikan default & log via caller.
      throw new StorageError(`Data terkorupsi pada key "${key}"`, e);
    }
  }

  async set(key, value) {
    let raw;
    try { raw = JSON.stringify(value); }
    catch (e) { throw new StorageError(`Tidak dapat serialize nilai untuk key "${key}"`, e); }
    await this.adapter.setRaw(this._key(key), raw);
  }

  async update(key, mutator, defaultValue = null) {
    const cur = await this.get(key, defaultValue);
    const next = mutator(cur);
    await this.set(key, next);
    return next;
  }

  async remove(key) { await this.adapter.removeRaw(this._key(key)); }

  async keys() {
    const all = await this.adapter.keys();
    const prefix = this.ns + ':';
    return all.filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length));
  }
}
