// src/view/pages/wastage.js
// Log wastage / shrinkage. Auto-journal kerugian (via listener).
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Select, Field, Table, Badge, KPI } from '../components.js';
import { bus } from '../../core/eventBus.js';

export function wastagePage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const list = app.repos.wastages.list().slice().reverse();
    const totalCost = list.reduce((s, w) => s + (w.totalCost || 0), 0);
    const byReason = {};
    list.forEach(w => { byReason[w.reason] = (byReason[w.reason] || 0) + (w.totalCost || 0); });
    const top = Object.entries(byReason).sort((a, b) => b[1] - a[1])[0];

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Wastage / Shrinkage'),
        h('div', { class: 'page-sub' }, 'Catat barang rusak / tumpah / kedaluwarsa. Otomatis ter-jurnal sebagai beban kerugian.'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total Wastage', value: list.length }),
      KPI({ label: 'Nilai Kerugian', value: fmt.rp(totalCost), deltaDir: 'down' }),
      KPI({ label: 'Penyebab Utama', value: top ? top[0] : '—', delta: top ? fmt.rp(top[1]) : '' }),
    ));

    // Form
    const form = { refType: 'ingredient', refId: '', qty: 0, reason: 'expired', note: '' };
    const formCard = Card({
      title: 'Catat Wastage Baru',
      body: h('form', { class: 'col gap-3', onsubmit: async (e) => {
        e.preventDefault();
        try {
          app.services.wastage.record({
            refType: form.refType, refId: form.refId, qty: +form.qty,
            reason: form.reason, note: form.note,
            reportedBy: app.services.auth.getCurrentUser()?.id || '',
          });
          bus.emit('toast', { severity: 'success', message: 'Wastage tercatat.' });
          render();
        } catch (er) {
          bus.emit('toast', { severity: 'error', message: er.message });
        }
      }},
        h('div', { class: 'form-grid' },
          Field({ label: 'Tipe', children: Select(
            [{ value: 'ingredient', label: 'Bahan Baku' }, { value: 'product', label: 'Produk Jadi' }],
            { value: form.refType, onchange: e => { form.refType = e.target.value; form.refId = ''; render(); } }
          )}),
          Field({ label: 'Item', children: Select(
            [{ value: '', label: '— Pilih —' }].concat(
              form.refType === 'ingredient'
                ? app.repos.ingredients.list().map(i => ({ value: i.id, label: `${i.nama} (stok ${i.stok} ${i.satuan})` }))
                : app.repos.products.list().map(p => ({ value: p.id, label: `${p.name} (stok ${p.stock})` }))
            ),
            { value: form.refId, onchange: e => form.refId = e.target.value }
          )}),
        ),
        h('div', { class: 'form-grid' },
          Field({ label: 'Kuantitas', children: Input({ type: 'number', min: 0, step: 'any', oninput: e => form.qty = +e.target.value }) }),
          Field({ label: 'Alasan', children: Select(
            ['expired','damaged','spilled','sample','other'].map(r => ({ value: r, label: r })),
            { value: form.reason, onchange: e => form.reason = e.target.value }
          )}),
        ),
        Field({ label: 'Catatan', children: Input({ oninput: e => form.note = e.target.value, placeholder: 'Opsional' }) }),
        h('button', { class: 'btn primary', type: 'submit' }, 'Catat Wastage'),
      ),
    });
    root.append(formCard);

    root.append(Card({
      title: 'Riwayat Wastage',
      body: list.length === 0 ? Empty({ icon: '🗑️', title: 'Belum ada wastage', detail: 'Bagus! Belum ada barang yang terbuang.' }) : Table({
        columns: [
          { key: 'ts', label: 'Waktu', render: w => fmt.rel(w.ts) },
          { key: 'refType', label: 'Tipe', render: w => Badge(w.refType, 'info') },
          { key: 'refId',  label: 'Item', render: w => {
            const it = w.refType === 'ingredient' ? app.repos.ingredients.findById(w.refId) : app.repos.products.findById(w.refId);
            return it ? (it.nama || it.name) : w.refId;
          }},
          { key: 'qty', label: 'Qty', align: 'right', render: w => h('span', { class: 'num' }, w.qty) },
          { key: 'totalCost', label: 'Kerugian', align: 'right', render: w => h('span', { class: 'num' }, fmt.rp(w.totalCost)) },
          { key: 'reason', label: 'Alasan', render: w => Badge(w.reason, 'warning') },
          { key: 'note', label: 'Catatan' },
        ],
        rows: list,
      }),
    }));
  }

  render();
  app.store.subscribe(s => s.wastages, () => render(), (a, b) => a === b);
  return root;
}
