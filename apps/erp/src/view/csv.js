// src/view/csv.js — minimal CSV exporter (RFC 4180-ish, Excel-compatible).
function escape(v) {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCSV(rows, columns) {
  const head = columns.map(c => escape(c.label || c.key)).join(',');
  const body = rows.map(r => columns.map(c => {
    const raw = c.render ? c.render(r) : r[c.key];
    if (raw && typeof raw === 'object' && raw.textContent != null) return escape(raw.textContent);
    return escape(raw);
  }).join(',')).join('\n');
  return '\ufeff' + head + '\n' + body; // BOM untuk Excel UTF-8
}

export function exportCSV(filename, rows, columns) {
  const csv = toCSV(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
