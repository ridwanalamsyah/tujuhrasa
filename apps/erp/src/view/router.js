// src/view/router.js
// Hash router minimal: #/orders → handler.

export class Router {
  constructor() {
    this.routes = new Map();
    this.fallback = null;
    this.current = null;
    this._listeners = new Set();
    window.addEventListener('hashchange', () => this._dispatch());
  }
  on(path, handler) { this.routes.set(path, handler); return this; }
  setFallback(fn)   { this.fallback = fn; return this; }
  start(defaultPath = '/dashboard') {
    if (!location.hash) location.hash = '#' + defaultPath;
    this._dispatch();
  }
  go(path) { location.hash = '#' + path; }
  onChange(fn) { this._listeners.add(fn); return () => this._listeners.delete(fn); }
  _dispatch() {
    const fullHash = location.hash.replace(/^#/, '') || '/dashboard';
    const base = fullHash.split('?')[0];
    const handler = this.routes.get(base) || this.fallback;
    this.current = base;
    this.fullHash = fullHash;
    if (handler) handler();
    for (const l of this._listeners) try { l(base); } catch (_) {}
  }
}
