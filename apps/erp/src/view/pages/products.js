// src/view/pages/products.js — daftar produk + tambah/edit/hapus.
import { h, fmt } from '../h.js';
import { Card, Table, Badge, Empty, Input, Select, openModal } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';
import { ProductCalc } from '../../services/product.service.js';

const CATEGORIES = ['Kopi', 'Matcha', 'Susu', 'Seasonal', 'Lainnya'];
const UNITS = ['botol', 'cup', 'pack', 'box'];

function emptyDraft() {
  return {
    id: '', name: '', cat: 'Kopi', sku: '', sell: 0, gros: 0,
    sat: 'botol', stock: 0, minStk: 0,
  };
}

function openProductForm(app, existing) {
  const d = existing ? { ...existing } : emptyDraft();
  const isEdit = !!existing;

  const m = openModal({
    title: isEdit ? `Edit ${existing.name}` : 'Tambah Menu Baru',
    body: h('div', { class: 'col gap-3' },
      h('div', { class: 'col gap-1' },
        h('label', { class: 'text-xs text-muted' }, 'Nama menu'),
        Input({ placeholder: 'mis. Kopi Susu Gula Aren', value: d.name, oninput: e => d.name = e.target.value }),
      ),
      h('div', { class: 'row gap-3' },
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Kategori'),
          Select(CATEGORIES.map(c => ({ value: c, label: c })), { value: d.cat, onchange: e => d.cat = e.target.value }),
        ),
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'SKU (opsional)'),
          Input({ placeholder: 'TR-XXX-001', value: d.sku, oninput: e => d.sku = e.target.value }),
        ),
      ),
      h('div', { class: 'row gap-3' },
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Harga Jual (Rp)'),
          Input({ type: 'number', value: d.sell || '', oninput: e => d.sell = +e.target.value || 0 }),
        ),
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Harga Reseller (Rp)'),
          Input({ type: 'number', value: d.gros || '', oninput: e => d.gros = +e.target.value || 0 }),
        ),
      ),
      h('div', { class: 'row gap-3' },
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Satuan'),
          Select(UNITS.map(u => ({ value: u, label: u })), { value: d.sat, onchange: e => d.sat = e.target.value }),
        ),
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Stok awal'),
          Input({ type: 'number', value: d.stock || '', oninput: e => d.stock = +e.target.value || 0 }),
        ),
        h('div', { class: 'col gap-1', style: { flex: '1' } },
          h('label', { class: 'text-xs text-muted' }, 'Stok minimum'),
          Input({ type: 'number', value: d.minStk || '', oninput: e => d.minStk = +e.target.value || 0 }),
        ),
      ),
    ),
    footer: [
      h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
      h('button', { class: 'btn primary', onclick: () => {
        try {
          if (!d.name?.trim()) throw new Error('Nama menu wajib diisi.');
          if (isEdit) {
            app.repos.products.update(d.id, d);
            bus.emit('toast', { severity: 'success', message: 'Menu diperbarui.' });
          } else {
            const nextSeq = (app.repos.products.list().length || 0) + 1;
            const id = 'P' + String(nextSeq).padStart(3, '0');
            app.repos.products.create({
              ...d, id,
              sku: d.sku || `TR-${(d.name || '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 12)}-${String(nextSeq).padStart(3, '0')}`,
            });
            bus.emit('toast', { severity: 'success', message: 'Menu baru ditambahkan.' });
          }
          m.close();
        } catch (er) {
          bus.emit('toast', { severity: 'error', message: er.message });
        }
      }}, isEdit ? 'Simpan' : 'Tambah Menu'),
    ],
  });
}

function confirmDelete(app, p) {
  const m = openModal({
    title: 'Hapus menu?',
    body: h('div', { class: 'col gap-2' },
      h('div', null, `Yakin ingin menghapus menu ${p.name}? Tindakan ini tidak bisa dibatalkan.`),
    ),
    footer: [
      h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
      h('button', { class: 'btn danger', onclick: () => {
        try {
          app.repos.products.delete(p.id);
          bus.emit('toast', { severity: 'success', message: 'Menu dihapus.' });
        } catch (er) {
          bus.emit('toast', { severity: 'error', message: er.message });
        }
        m.close();
      }}, 'Hapus'),
    ],
  });
}

export function productsPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const products = app.repos.products.list();

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Daftar Menu'),
        h('div', { class: 'page-sub' }, `${products.length} menu aktif`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn primary', onclick: () => openProductForm(app) },
          Icon.plus(), 'Tambah Menu'),
      ),
    ));

    root.append(Card({
      body: Table({
        columns: [
          { key: 'name', label: 'Nama', render: p => h('div', { class: 'col' },
            h('strong', null, p.name),
            h('div', { class: 'text-xs text-muted' }, `${p.cat} • SKU: ${p.sku || '—'}`),
          )},
          { key: 'hpp', label: 'HPP', align: 'right', render: p => h('span', { class: 'num' }, fmt.rp(ProductCalc.hpp(p))) },
          { key: 'sell', label: 'Harga Jual', align: 'right', render: p => h('span', { class: 'num' }, fmt.rp(p.sell)) },
          { key: 'gros', label: 'Reseller', align: 'right', render: p => h('span', { class: 'num' }, fmt.rp(p.gros)) },
          { key: 'margin', label: 'Margin', align: 'right', render: p => {
            const m = ProductCalc.margin(p);
            return Badge(fmt.pct(m), m >= 30 ? 'success' : (m >= 15 ? 'info' : 'danger'));
          }},
          { key: 'stock', label: 'Stok', align: 'right', render: p => {
            const t = ProductCalc.totalStock(p);
            return Badge(`${t} ${p.sat}`, t <= p.minStk ? 'danger' : 'default');
          }},
          { key: 'actions', label: '', render: p => h('div', { class: 'row gap-1' },
            h('button', { class: 'btn ghost sm', title: 'Edit', onclick: () => openProductForm(app, p) }, 'Edit'),
            h('button', { class: 'btn ghost sm', title: 'Hapus', onclick: () => confirmDelete(app, p) }, Icon.trash()),
          )},
        ],
        rows: products,
        empty: Empty({ title: 'Belum ada menu', sub: 'Klik "Tambah Menu" untuk mulai.' }),
      }),
    }));
  }

  render();
  app.store.subscribe(s => s.products, () => render(), (a, b) => a === b);
  return root;
}
