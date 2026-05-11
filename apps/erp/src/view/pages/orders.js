// src/view/pages/orders.js
import { h, fmt } from '../h.js';
import { Card, Table, StatusBadge, Empty, Input, Select, QuickPills, DATE_RANGE_OPTIONS, filterByRange } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';
import { debounce } from '../../core/perf.js';
import { exportCSV } from '../csv.js';

export function ordersPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let filter = { q: '', status: 'all', range: 'month' };

  function render() {
    while (root.firstChild) root.firstChild.remove();

    const q = filter.q.toLowerCase();
    let orders = app.repos.orders.list().slice().reverse();
    orders = filterByRange(orders, o => o.ts, filter.range);
    if (filter.status !== 'all') orders = orders.filter(o => o.status === filter.status);
    if (q) orders = orders.filter(o => `${o.id} ${o.buyer} ${o.pname} ${o.wa || ''}`.toLowerCase().includes(q));

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Order'),
        h('div', { class: 'page-sub' }, `${orders.length} order`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/shifts' }, 'Shift Kasir'),
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/invoice' }, 'Invoice'),
        h('button', { class: 'btn ghost sm', onclick: () => exportCSV('orders.csv', orders, [
          { key: 'id', label: 'ID' }, { key: 'buyer', label: 'Pembeli' }, { key: 'pname', label: 'Produk' },
          { key: 'qty', label: 'Qty' }, { key: 'total', label: 'Total' },
          { key: 'status', label: 'Status' }, { key: 'ts', label: 'Tanggal' },
        ]) }, Icon.download(), 'CSV'),
        h('button', { class: 'btn primary', onclick: () => location.hash = '#/pos' }, Icon.plus(), 'Order Baru'),
      ),
    ));

    const search = Input({
      placeholder: 'Cari ID / pembeli / produk…',
      value: filter.q,
      style: { maxWidth: '320px' },
      oninput: debounce(e => { filter.q = e.target.value; render(); }, 200),
    });
    const statusSel = Select(
      [{ value: 'all', label: 'Semua status' },
       ...['pending','partial','paid','packing','shipped','cancel'].map(s => ({ value: s, label: s }))],
      { value: filter.status, onchange: e => { filter.status = e.target.value; render(); }, style: { maxWidth: '180px' } },
    );

    root.append(Card({
      body: h('div', { class: 'col gap-3' },
        QuickPills({ active: filter.range, options: DATE_RANGE_OPTIONS, onChange: r => { filter.range = r; render(); } }),
        h('div', { class: 'row gap-2', style: { flexWrap: 'wrap' } }, search, statusSel),
        Table({
          columns: [
            { key: 'id', label: 'ID', render: o => h('strong', null, o.id) },
            { key: 'buyer', label: 'Pembeli', render: o => h('div', { class: 'col' },
              h('div', null, o.buyer),
              h('div', { class: 'text-xs text-muted' }, o.wa || '—')) },
            { key: 'pname', label: 'Produk', render: o => `${o.pname} × ${o.qty}` },
            { key: 'total', label: 'Total', align: 'right', render: o => h('span', { class: 'num' }, fmt.rp((o.total || 0) + (o.ongkir || 0))) },
            { key: 'sisa', label: 'Sisa', align: 'right', render: o => {
              const due  = (o.total || 0) + (o.ongkir || 0);
              const paid = app.services.payment.totalPaid(o.id);
              return h('span', { class: 'num' }, fmt.rp(Math.max(0, due - paid)));
            } },
            { key: 'status', label: 'Status', render: o => StatusBadge(o.status) },
            { key: 'ts', label: 'Tanggal', render: o => fmt.rel(o.ts) },
            { key: 'actions', label: '', render: o => h('div', { class: 'row gap-1' },
                h('button', { class: 'btn sm ghost', 'data-action': 'order:invoice', 'data-id': o.id, title: 'Cetak Invoice' }, Icon.reports()),
                h('button', { class: 'btn sm ghost', 'data-action': 'order:receipt', 'data-id': o.id, title: 'Cetak Struk' }, Icon.download()),
                ...(['pending', 'partial'].includes(o.status) && o.wa
                  ? [h('button', { class: 'btn sm ghost', 'data-action': 'order:wa', 'data-id': o.id, title: 'Kirim reminder WA' }, '💬')]
                  : []),
                ...(o.status === 'cancel' || o.status === 'shipped' ? [] : [
                  h('button', { class: 'btn sm', 'data-action': 'order:advance', 'data-id': o.id }, 'Lanjut'),
                  h('button', { class: 'btn sm', 'data-action': 'order:cancel', 'data-id': o.id, style: { color: 'var(--danger)' } }, 'Batal'),
                ]),
              ),
            },
          ],
          rows: orders,
          empty: Empty({ title: 'Belum ada order', detail: 'Buat order pertama dari halaman Kasir.' }),
        }),
      ),
    }));
  }

  // Delegated handlers
  root.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-action]');
    if (!t || !root.contains(t)) return;
    const id = t.dataset.id;
    try {
      if (t.dataset.action === 'order:advance')      app.services.order.advance(id);
      else if (t.dataset.action === 'order:cancel')  { app.services.order.cancel(id); bus.emit('toast', { severity: 'warning', message: `Order ${id} dibatalkan.` }); }
      else if (t.dataset.action === 'order:invoice') { app.services.pdf.printInvoice(app.repos.orders.requireById(id)); }
      else if (t.dataset.action === 'order:receipt') { app.services.pdf.printReceipt(app.repos.orders.requireById(id)); }
      else if (t.dataset.action === 'order:wa') {
        const url = app.services.notification.buildPaymentReminderUrl(id);
        window.open(url, '_blank', 'noopener');
      }
    } catch (e) { app.errors.handle(e); }
  });

  render();
  app.store.subscribe(s => s.orders, () => render(), (a, b) => a === b);
  return root;
}
