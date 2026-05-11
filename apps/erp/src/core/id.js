// src/core/id.js
// Generator ID yang stabil, deterministik secukupnya, dan portable.
// Tidak bergantung pada Date.now() saja agar collision-resistant pada loop cepat.

let _counter = 0;

export function uid(prefix = 'id') {
  _counter = (_counter + 1) % 0xffff;
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  const c = _counter.toString(36).padStart(3, '0');
  return `${prefix}_${t}${c}${r}`;
}

export function shortCode(prefix, sequence, width = 4) {
  return `${prefix}-${String(sequence).padStart(width, '0')}`;
}
