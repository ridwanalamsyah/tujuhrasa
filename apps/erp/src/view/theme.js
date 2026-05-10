// src/view/theme.js — manage light/dark theme dengan persistence ringan.

const KEY = 'tr-theme';
export function createTheme() {
  const listeners = new Set();
  function apply(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch {}
    listeners.forEach(fn => fn(t));
  }
  function current() { return document.documentElement.dataset.theme || 'light'; }
  // Init: pakai persisted, kalau tidak ada → ikuti prefers-color-scheme.
  let initial = 'light';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') initial = saved;
    else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) initial = 'dark';
  } catch {}
  apply(initial);
  return {
    current,
    set: apply,
    toggle() { apply(current() === 'dark' ? 'light' : 'dark'); },
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
