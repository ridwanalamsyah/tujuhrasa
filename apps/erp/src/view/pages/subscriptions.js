// src/view/pages/subscriptions.js
// Subscription / membership: paket berkala otomatis menjadi Order pending.

import { h, fmt } from '../h.js';
import { Card, Empty, Table, Badge, Input, Select, openModal } from '../components.js';
import { bus } from '../../core/eventBus.js';

const FREQ_LABEL = { weekly: 'Mingguan', biweekly: '2 Minggu', monthly: 'Bulanan' };

export function subscriptionsPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function openAdd() {
    const f = { customerName: '', wa: '', productId: '', qty: 1, frequency: 'weekly', startDate: new Date().toISOString().slice(0, 10) };
    const products = app.repos.products.list();
    const m = openModal({
      title: 'Subscription Baru',
      body: h('div', { class: 'col gap-3' },
        Input({ placeholder: 'Nama pelanggan', oninput: e => f.customerName = e.target.value }),
        Input({ placeholder: 'WhatsApp (62xxx)', oninput: e => f.wa = e.target.value }),
        Select({
          options: [{ value: '', label: '— pilih produk —' }, ...products.map(p => ({ value: p.id, label: `${p.name} (${fmt.rp(p.sell)})` }))],
          onchange: e => f.productId = e.target.value,
        }),
        h('div', { class: 'row gap-2' },
          Input({ type: 'number', placeholder: 'Qty', value: 1, oninput: e => f.qty = Number(e.target.value) }),
          Select({
            options: [
              { value: 'weekly', label: 'Mingguan' },
              { value: 'biweekly', label: '2 Mingguan' },
              { value: 'monthly', label: 'Bulanan' },
            ],
            onchange: e => f.frequency = e.target.value,
          }),
        ),
        Input({ type: 'date', value: f.startDate, oninput: e => f.startDate = e.target.value }),
      ),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: () => {
          try {
            if (!f.customerName) throw new Error('Nama pelanggan wajib');
            if (!f.productId) throw new Error('Pilih produk');
            app.services.subscription.create(f);
            bus.emit('toast', { severity: 'success', message: 'Subscription dibuat.' });
            m.close();
          } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
        } }, 'Simpan'),
      ],
    });
  }

  function render() {
    root.innerHTML = '';
    const list = app.services.subscription.list();
    const today = new Date().toISOString().slice(0, 10);
    const dueCount = list.filter(s => s.active && s.nextDueDate <= today).length;

    root.append(
      h('div', { class: 'row between' },
        h('div', { class: 'col gap-1' },
          h('div', { class: 'page-title' }, 'Subscription'),
          h('div', { class: 'page-sub' }, 'Paket berlangganan otomatis (mingguan / 2 minggu / bulanan)'),
        ),
        h('div', { class: 'row gap-2' },
          dueCount > 0 ? h('button', { class: 'btn', onclick: () => {
            try {
              const created = app.services.subscription.runDueToday();
              bus.emit('toast', { severity: 'success', message: `${created.length} order dibuat dari subscription.` });
            } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
          } }, `▶ Jalankan ${dueCount} due hari ini`) : null,
          h('button', { class: 'btn primary', onclick: openAdd }, '+ Subscription'),
        ),
      ),
    );

    root.append(Card({
      title: 'Daftar Subscription',
      body: list.length === 0
        ? Empty({ icon: '🔁', title: 'Belum ada subscription', detail: 'Buat paket berlangganan untuk pelanggan reguler.' })
        : Table({
          columns: [
            { key: 'customerName', label: 'Pelanggan' },
            { key: 'productName', label: 'Produk' },
            { key: 'qty', label: 'Qty', align: 'right' },
            { key: 'frequency', label: 'Frekuensi', render: s => Badge(FREQ_LABEL[s.frequency] || s.frequency, 'info') },
            { key: 'nextDueDate', label: 'Jadwal Berikut', render: s => {
              const due = new Date(s.nextDueDate);
              const today = new Date(); today.setHours(0, 0, 0, 0);
              const overdue = s.active && due <= today;
              return h('span', { style: { color: overdue ? 'var(--danger)' : 'inherit', fontWeight: overdue ? '600' : '400' } }, s.nextDueDate);
            } },
            { key: 'orderHistory', label: 'Total Order', align: 'right', render: s => (s.orderHistory || []).length },
            { key: 'active', label: 'Status', render: s => s.active ? Badge('Aktif', 'success') : Badge('Pause', 'warning') },
            { key: 'actions', label: '', render: s => h('div', { class: 'row gap-2' },
              s.active
                ? h('button', { class: 'btn sm ghost', onclick: () => { app.services.subscription.pause(s.id); bus.emit('toast', { message: 'Pause' }); } }, 'Pause')
                : h('button', { class: 'btn sm ghost', onclick: () => { app.services.subscription.resume(s.id); bus.emit('toast', { message: 'Resume' }); } }, 'Aktifkan'),
              h('button', { class: 'btn sm ghost', style: { color: 'var(--danger)' }, onclick: () => {
                if (confirm('Hapus subscription ini?')) {
                  app.services.subscription.delete(s.id);
                  bus.emit('toast', { severity: 'warning', message: 'Subscription dihapus.' });
                }
              } }, '✕'),
            ) },
          ],
          rows: list,
        }),
    }));
  }

  render();
  app.store.subscribe(s => s.subscriptions, () => render(), (a, b) => a === b);
  return root;
}
