// src/view/h.js
// Hyperscript helper minimal — tanpa virtual DOM, tanpa framework.
// Membuat element dari JS, support nested children, attribute, event, data-*.
// Dipakai oleh seluruh page renderer untuk menggantikan template-string +
// inline `onclick=` dari versi lama.

export function h(tag, attrs = {}, ...children) {
  // Overload: h(tag, ...children) tanpa attrs.
  if (attrs && (typeof attrs !== 'object' || attrs.nodeType || Array.isArray(attrs))) {
    children = [attrs, ...children];
    attrs = {};
  }
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class' || k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k.startsWith('data-') || k.startsWith('aria-')) el.setAttribute(k, v);
    else if (k in el && typeof v !== 'object') {
      try { el[k] = v; } catch { el.setAttribute(k, v); }
    } else el.setAttribute(k, v);
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function frag(...children) {
  const f = document.createDocumentFragment();
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    f.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return f;
}

export function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

export function mount(root, node) { clear(root); root.append(node); }

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

export const fmt = {
  rp:   n => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID'),
  num:  n => Math.round(n || 0).toLocaleString('id-ID'),
  pct:  n => (Math.round((n || 0) * 10) / 10).toFixed(1) + '%',
  date: d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  dt:   d => d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—',
  rel:  d => relTime(d),
};

function relTime(d) {
  if (!d) return '—';
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const dd = Math.round(h / 24);
  if (dd < 30) return `${dd} hari lalu`;
  return new Date(d).toLocaleDateString('id-ID');
}
