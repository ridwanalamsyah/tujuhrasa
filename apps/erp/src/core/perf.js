// src/core/perf.js
// Utility performa: debounce, throttle, memoize, batched scheduling, deepEqual murah.

export function debounce(fn, wait = 200, { leading = false, trailing = true } = {}) {
  let t = null, lastArgs = null, lastThis = null, calledLeading = false;
  const invoke = () => {
    t = null;
    if (trailing && lastArgs) {
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }
    calledLeading = false;
  };
  const debounced = function (...args) {
    lastArgs = args; lastThis = this;
    if (leading && !calledLeading) {
      fn.apply(this, args);
      calledLeading = true;
      lastArgs = lastThis = null;
    }
    if (t) clearTimeout(t);
    t = setTimeout(invoke, wait);
  };
  debounced.cancel = () => { if (t) { clearTimeout(t); t = null; } lastArgs = null; calledLeading = false; };
  debounced.flush  = () => { if (t) { clearTimeout(t); invoke(); } };
  return debounced;
}

export function throttle(fn, wait = 200) {
  let last = 0, t = null, lastArgs = null, lastThis = null;
  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    lastArgs = args; lastThis = this;
    if (remaining <= 0) {
      if (t) { clearTimeout(t); t = null; }
      last = now;
      fn.apply(this, args);
    } else if (!t) {
      t = setTimeout(() => {
        last = Date.now();
        t = null;
        fn.apply(lastThis, lastArgs);
      }, remaining);
    }
  };
}

export function memoize(fn, keyFn = (...a) => JSON.stringify(a)) {
  const cache = new Map();
  const memo = function (...args) {
    const k = keyFn(...args);
    if (cache.has(k)) return cache.get(k);
    const v = fn.apply(this, args);
    cache.set(k, v);
    return v;
  };
  memo.cache = cache;
  memo.invalidate = (k) => cache.delete(k);
  memo.clear = () => cache.clear();
  return memo;
}

/**
 * Microtask scheduler: kumpulkan banyak update lalu jalankan callback satu kali.
 * Berguna agar Store tidak menotifikasi subscriber per setiap mutasi kecil.
 */
export function createScheduler() {
  let scheduled = false;
  const tasks = new Set();
  return function schedule(task) {
    tasks.add(task);
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      const snapshot = [...tasks]; tasks.clear();
      for (const t of snapshot) {
        try { t(); } catch (e) {
          // eslint-disable-next-line no-console
          console.error('[scheduler] task error', e);
        }
      }
    });
  };
}

/**
 * Equality dangkal untuk objek/array satu level — cukup untuk memilih apakah
 * subscriber perlu dipanggil ulang.
 */
export function shallowEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}
