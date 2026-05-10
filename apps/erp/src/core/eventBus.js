// src/core/eventBus.js
// Pub/Sub minimalis untuk komunikasi lintas modul tanpa coupling.
// Pakai untuk: error global, notifikasi state-change, side-effect (audit, sync).

export class EventBus {
  constructor() {
    this._subs = new Map(); // event -> Set<handler>
  }

  on(event, handler) {
    if (!this._subs.has(event)) this._subs.set(event, new Set());
    this._subs.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (...args) => {
      off();
      handler(...args);
    });
    return off;
  }

  off(event, handler) {
    this._subs.get(event)?.delete(handler);
  }

  emit(event, payload) {
    const subs = this._subs.get(event);
    if (!subs) return;
    // Snapshot agar handler yang melakukan off()/on() saat emit aman.
    for (const h of [...subs]) {
      try { h(payload); } catch (e) {
        // Jangan biarkan handler error menumbangkan emitter.
        // eslint-disable-next-line no-console
        console.error('[EventBus] handler error pada event', event, e);
      }
    }
  }

  clear(event) {
    if (event) this._subs.delete(event);
    else this._subs.clear();
  }
}

export const bus = new EventBus();
