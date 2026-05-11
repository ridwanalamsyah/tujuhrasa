// src/view/icons.js
// Inline SVG icons (Heroicons-inspired). Mengembalikan node SVG.

const NS = 'http://www.w3.org/2000/svg';
function svg(d, { size = 18, stroke = 1.6 } = {}) {
  const el = document.createElementNS(NS, 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('width', size); el.setAttribute('height', size);
  el.setAttribute('fill', 'none');
  el.setAttribute('stroke', 'currentColor');
  el.setAttribute('stroke-width', stroke);
  el.setAttribute('stroke-linecap', 'round');
  el.setAttribute('stroke-linejoin', 'round');
  el.classList.add('ico');
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  el.appendChild(path);
  return el;
}

export const Icon = {
  dashboard: () => svg('M3 12L12 4l9 8M5 10v10h14V10'),
  pos:       () => svg('M3 7h18l-2 12H5L3 7zm3-2a3 3 0 0 1 12 0'),
  orders:    () => svg('M9 5h6l3 5v9H6v-9l3-5zm0 8h6'),
  products:  () => svg('M3 7l9-4 9 4-9 4-9-4zm0 0v10l9 4 9-4V7'),
  inventory: () => svg('M4 7h16v13H4zM4 7l2-3h12l2 3M9 11h6'),
  customers: () => svg('M16 14a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0'),
  suppliers: () => svg('M3 7l9-4 9 4M5 9v12h14V9M9 12h6'),
  finance:   () => svg('M4 19V5m16 14V9M9 19v-7m6 7v-3'),
  reports:   () => svg('M4 4h12l4 4v12H4zM14 4v6h6'),
  production: () => svg('M3 21h18M5 21V11l7-5 7 5v10M9 21v-6h6v6'),
  schedule:  () => svg('M4 7h16v13H4zM4 7V4h16v3M8 11h8M8 15h5'),
  audit:     () => svg('M12 3l9 4v5c0 5-4 9-9 9s-9-4-9-9V7l9-4z'),
  users:     () => svg('M16 14a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0M19 8a3 3 0 1 0-3-3'),
  settings:  () => svg('M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12c0 .7-.1 1.3-.2 2l2 1.6-2 3.4-2.4-1a7 7 0 0 1-3.4 2L13 22h-2l-.5-2a7 7 0 0 1-3.4-2l-2.4 1-2-3.4 2-1.6c-.1-.7-.2-1.3-.2-2s.1-1.3.2-2l-2-1.6 2-3.4 2.4 1a7 7 0 0 1 3.4-2L11 2h2l.5 2a7 7 0 0 1 3.4 2l2.4-1 2 3.4-2 1.6c.1.7.2 1.3.2 2z'),
  bell:      () => svg('M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0'),
  search:    () => svg('M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm5-3l5 5'),
  sun:       () => svg('M12 4V2m0 20v-2m8-8h2M2 12h2m13.7-6.7l1.5-1.5M4.3 19.7l1.5-1.5m0-12.4L4.3 4.3m15.4 15.4l-1.5-1.5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'),
  moon:      () => svg('M21 13A8 8 0 0 1 11 3a8 8 0 1 0 10 10z'),
  plus:      () => svg('M12 5v14M5 12h14'),
  trash:     () => svg('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'),
  check:     () => svg('M5 12l5 5 9-12'),
  x:         () => svg('M6 6l12 12M6 18L18 6'),
  arrow_right: () => svg('M5 12h14M13 6l6 6-6 6'),
  download:  () => svg('M12 4v12m0 0l-4-4m4 4l4-4M4 20h16'),
  upload:    () => svg('M12 20V8m0 0l-4 4m4-4l4 4M4 4h16'),
  alert:     () => svg('M12 9v4m0 4h.01M10.3 3.7L2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z'),
  eye:       () => svg('M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'),
  menu:      () => svg('M4 7h16M4 12h16M4 17h16'),
};
