// src/view/components.js
// Komponen reusable: Card, KPI, Badge, Empty, Skeleton, Table, FormField.

import { h, fmt, esc } from './h.js';

export function Card({ title, sub, actions, body, padded = true } = {}) {
  const head = (title || sub || actions) ? h('div', { class: 'card-head' },
    h('div', { class: 'col' },
      title ? h('div', { class: 'card-title' }, title) : null,
      sub   ? h('div', { class: 'card-sub' }, sub) : null,
    ),
    actions ? h('div', { class: 'row gap-2' }, actions) : null,
  ) : null;
  const inner = padded ? h('div', { class: 'card-pad' }, body) : body;
  return h('section', { class: 'card' }, head, inner);
}

export function KPI({ label, value, delta, deltaDir }) {
  return h('div', { class: 'kpi' },
    h('div', { class: 'kpi-label' }, label),
    h('div', { class: 'kpi-value' }, value),
    delta ? h('div', { class: 'kpi-delta ' + (deltaDir || 'up') }, delta) : null,
  );
}

export function Badge(text, kind = 'default') {
  return h('span', { class: `badge ${kind}` }, text);
}

export function Empty({ icon = '∅', title = 'Belum ada data', detail = '', action } = {}) {
  return h('div', { class: 'empty' },
    h('div', { class: 'ico' }, icon),
    h('div', { class: 'title' }, title),
    detail ? h('div', null, detail) : null,
    action || null,
  );
}

export function Skeleton(rows = 3) {
  return h('div', { class: 'col gap-2' },
    Array.from({ length: rows }, () => h('div', { class: 'skeleton', style: { height: '20px' } }))
  );
}

/**
 * Modal({ title, body, onClose, footer }) — universal modal overlay.
 * Click backdrop or Esc to close. Returns { el, close }.
 */
export function openModal({ title, body, footer, onClose }) {
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    if (onClose) onClose();
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  const card = h('div', { class: 'modal-card' },
    h('div', { class: 'modal-head' },
      h('h3', null, title || ''),
      h('button', { class: 'icon-btn', onclick: close, 'aria-label': 'Tutup' }, '×'),
    ),
    body,
    footer ? h('div', { class: 'row gap-2', style: { marginTop: '16px', justifyContent: 'flex-end' } }, footer) : null,
  );
  const overlay = h('div', { class: 'modal-overlay', onclick: (e) => { if (e.target === overlay) close(); } }, card);
  document.body.appendChild(overlay);
  return { el: overlay, close };
}

/**
 * QuickPills({ active, options, onChange }) — date-range filter pill buttons.
 * Options: array of { id, label }.
 */
export function QuickPills({ active, options, onChange }) {
  return h('div', { class: 'quick-pills' },
    options.map(o => h('button', {
      class: active === o.id ? 'active' : '',
      onclick: () => onChange(o.id),
    }, o.label))
  );
}

export const DATE_RANGE_OPTIONS = [
  { id: 'today',  label: 'Hari Ini' },
  { id: 'week',   label: 'Minggu Ini' },
  { id: 'month',  label: 'Bulan Ini' },
  { id: 'year',   label: 'Tahun Ini' },
  { id: 'all',    label: 'Semua' },
];

/** filterByRange(items, getter, range) — filter array by date range on a date string getter. */
export function filterByRange(items, getDate, range) {
  if (range === 'all') return items;
  const now = new Date();
  const start = new Date(now);
  if (range === 'today') start.setHours(0,0,0,0);
  else if (range === 'week') {
    const d = now.getDay() || 7;
    start.setDate(now.getDate() - d + 1); start.setHours(0,0,0,0);
  } else if (range === 'month') { start.setDate(1); start.setHours(0,0,0,0); }
  else if (range === 'year') { start.setMonth(0, 1); start.setHours(0,0,0,0); }
  const startMs = start.getTime();
  return items.filter(it => {
    const ts = getDate(it);
    if (!ts) return false;
    return new Date(ts).getTime() >= startMs;
  });
}


export function Field({ label, hint, error, children }) {
  return h('div', { class: 'field' },
    label ? h('label', null, label) : null,
    children,
    error ? h('div', { class: 'field-error' }, error) : (hint ? h('div', { class: 'text-xs text-muted' }, hint) : null),
  );
}

export function Input(attrs = {}) {
  return h('input', { class: 'input', ...attrs });
}
export function Select(options, attrs = {}) {
  return h('select', { class: 'select', ...attrs },
    options.map(o => h('option', { value: o.value }, o.label))
  );
}
export function Textarea(attrs = {}) {
  return h('textarea', { class: 'input', rows: 3, ...attrs });
}

export function Button(label, attrs = {}) {
  const { variant = 'default', size = '', ...rest } = attrs;
  const cls = ['btn', variant !== 'default' ? variant : '', size].filter(Boolean).join(' ');
  return h('button', { class: cls, type: 'button', ...rest }, label);
}

export function Sparkline(values, { width = 280, height = 60 } = {}) {
  if (!values?.length) values = [0];
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / Math.max(1, values.length - 1);
  let line = '', area = '';
  values.forEach((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    line += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });
  area = line + ` L ${width} ${height} L 0 ${height} Z`;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'spark');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  const pa = document.createElementNS(NS, 'path');
  pa.setAttribute('d', area); pa.setAttribute('class', 'area');
  const pl = document.createElementNS(NS, 'path');
  pl.setAttribute('d', line); pl.setAttribute('class', 'line');
  svg.append(pa, pl);
  return svg;
}

export function StatusBadge(status) {
  const map = {
    pending:  ['Pending', 'default'],
    partial:  ['Partial', 'warning'],
    paid:     ['Lunas', 'success'],
    packing:  ['Dikemas', 'info'],
    shipped:  ['Dikirim', 'purple'],
    cancel:   ['Batal', 'danger'],
    // accounting
    posted:   ['Posted', 'success'],
    open:     ['Open', 'info'],
    closed:   ['Closed', 'default'],
    reconciled:['Reconciled','success'],
    planned:  ['Planned', 'default'],
    in_progress: ['Berjalan', 'warning'],
    done:     ['Selesai', 'success'],
  };
  const [label, kind] = map[status] || [status, 'default'];
  return Badge(label, kind);
}

export function Table({ columns, rows, empty }) {
  if (!rows || rows.length === 0) return empty || Empty();
  const tbl = h('table', { class: 'table' },
    h('thead', null,
      h('tr', null, columns.map(c => h('th', { style: c.align === 'right' ? { textAlign: 'right' } : null }, c.label)))
    ),
    h('tbody', null, rows.map(r =>
      h('tr', null, columns.map(c => {
        const v = typeof c.render === 'function' ? c.render(r) : r[c.key];
        return h('td', { style: c.align === 'right' ? { textAlign: 'right' } : null }, v);
      }))
    ))
  );
  return h('div', { style: { overflowX: 'auto' } }, tbl);
}
