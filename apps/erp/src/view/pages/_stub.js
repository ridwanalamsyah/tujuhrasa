// src/view/pages/_stub.js — halaman pendukung yang melengkapi modul utama.
import { h, fmt } from '../h.js';
import { Card, Empty, Table, Badge, Input, Field, Select, KPI, openModal, QuickPills, DATE_RANGE_OPTIONS, filterByRange } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';
import { exportCSV } from '../csv.js';

// ─── Customers ────────────────────────────────────────────────────────
export function customersPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let q = '';

  function openAdd() {
    const f = { name: '', wa: '', city: '' };
    const m = openModal({
      title: 'Tambah Pelanggan',
      body: h('div', { class: 'col gap-3' },
        Input({ placeholder: 'Nama lengkap', oninput: e => f.name = e.target.value }),
        Input({ placeholder: 'WhatsApp', oninput: e => f.wa = e.target.value }),
        Input({ placeholder: 'Kota', oninput: e => f.city = e.target.value }),
      ),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: () => {
          try {
            if (!f.name) throw new Error('Nama wajib');
            app.repos.customers.create({ id: '', name: f.name, wa: f.wa, city: f.city, orders: 0, totalSpend: 0 });
            bus.emit('toast', { severity: 'success', message: 'Pelanggan ditambahkan.' });
            m.close();
          } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
        } }, 'Simpan'),
      ],
    });
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const list = app.repos.customers.list().slice().reverse();
    const filtered = q ? list.filter(c => `${c.name} ${c.wa || ''} ${c.city || ''}`.toLowerCase().includes(q.toLowerCase())) : list;
    const top = list.slice().sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0)).slice(0, 5);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Pelanggan'),
        h('div', { class: 'page-sub' }, `${list.length} pelanggan`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/analytics' }, 'Analytics'),
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/points' }, 'Bagi Hasil'),
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/subscriptions' }, 'Subscription'),
        h('button', { class: 'btn ghost sm', onclick: () => exportCSV('customers.csv', list, [
          { key: 'name', label: 'Nama' }, { key: 'wa', label: 'WA' }, { key: 'city', label: 'Kota' },
          { key: 'orders', label: 'Order' }, { key: 'totalSpend', label: 'Total Belanja' },
        ]) }, Icon.download(), 'CSV'),
        h('button', { class: 'btn primary', onclick: openAdd }, Icon.plus(), 'Tambah'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total Pelanggan', value: list.length }),
      KPI({ label: 'Aktif (≥1 order)', value: list.filter(c => (c.orders || 0) > 0).length }),
      KPI({ label: 'VIP (≥5 order)', value: list.filter(c => (c.orders || 0) >= 5).length }),
      KPI({ label: 'Total Belanja', value: fmt.rp(list.reduce((s, c) => s + (c.totalSpend || 0), 0)) }),
    ));

    if (top.length > 0) {
      root.append(Card({
        title: 'Top 5 Pelanggan',
        body: Table({
          columns: [
            { key: 'rank', label: '#', render: (_, i) => i + 1 },
            { key: 'name', label: 'Nama', render: c => h('strong', null, c.name) },
            { key: 'orders', label: 'Order', align: 'right' },
            { key: 'totalSpend', label: 'Total Belanja', align: 'right', render: c => h('span', { class: 'num' }, fmt.rp(c.totalSpend || 0)) },
          ],
          rows: top,
        }),
      }));
    }

    root.append(Card({
      body: h('div', { class: 'col gap-2' },
        Input({ placeholder: 'Cari nama / WA / kota…', oninput: e => { q = e.target.value; render(); } }),
        Table({
          columns: [
            { key: 'name', label: 'Nama' },
            { key: 'wa', label: 'WhatsApp' },
            { key: 'city', label: 'Kota' },
            { key: 'orders', label: 'Order', align: 'right' },
            { key: 'totalSpend', label: 'Total Belanja', align: 'right', render: c => h('span', { class: 'num' }, fmt.rp(c.totalSpend || 0)) },
            { key: 'tag', label: '', render: c => (c.orders || 0) >= 5 ? Badge('VIP', 'success') : (c.orders || 0) > 0 ? Badge('Aktif', 'info') : Badge('Baru', 'default') },
          ],
          rows: filtered,
          empty: Empty({ icon: '👥', title: 'Belum ada pelanggan', detail: 'Pelanggan otomatis terdaftar dari order POS.' }),
        }),
      ),
    }));
  }
  render();
  app.store.subscribe(s => s.customers, () => render(), (a, b) => a === b);
  return root;
}

// ─── Suppliers ────────────────────────────────────────────────────────
export function suppliersPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function openAdd() {
    const f = { name: '', pic: '', wa: '', cat: '', term: 'NET 30' };
    const m = openModal({
      title: 'Tambah Supplier',
      body: h('div', { class: 'col gap-3' },
        Input({ placeholder: 'Nama', oninput: e => f.name = e.target.value }),
        Input({ placeholder: 'PIC', oninput: e => f.pic = e.target.value }),
        Input({ placeholder: 'WhatsApp', oninput: e => f.wa = e.target.value }),
        Input({ placeholder: 'Kategori (kopi / susu / kemasan)', oninput: e => f.cat = e.target.value }),
        Input({ placeholder: 'Term pembayaran', value: f.term, oninput: e => f.term = e.target.value }),
      ),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: () => {
          try {
            if (!f.name) throw new Error('Nama wajib');
            app.repos.suppliers.create({ id: '', ...f });
            bus.emit('toast', { severity: 'success', message: 'Supplier ditambahkan.' });
            m.close();
          } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
        } }, 'Simpan'),
      ],
    });
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const list = app.repos.suppliers.list();

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Supplier'),
        h('div', { class: 'page-sub' }, `${list.length} supplier`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => exportCSV('suppliers.csv', list, [
          { key: 'name', label: 'Nama' }, { key: 'pic', label: 'PIC' }, { key: 'wa', label: 'WA' },
          { key: 'cat', label: 'Kategori' }, { key: 'term', label: 'Term' },
        ]) }, Icon.download(), 'CSV'),
        h('button', { class: 'btn primary', onclick: openAdd }, Icon.plus(), 'Tambah'),
      ),
    ));

    root.append(Card({
      body: list.length === 0 ? Empty({ icon: '🏭', title: 'Belum ada supplier' }) : Table({
        columns: [
          { key: 'name', label: 'Nama', render: s => h('strong', null, s.name) },
          { key: 'pic', label: 'PIC' },
          { key: 'wa', label: 'WhatsApp' },
          { key: 'cat', label: 'Kategori' },
          { key: 'term', label: 'Term', render: s => Badge(s.term, 'info') },
        ],
        rows: list,
      }),
    }));
  }
  render();
  app.store.subscribe(s => s.suppliers, () => render(), (a, b) => a === b);
  return root;
}

// ─── Purchases (PO) ───────────────────────────────────────────────────
export function purchasesPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let form = { supId: '', items: [{ ingId: '', qty: 0, harga: 0 }] };

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const list = app.repos.purchaseOrders.list().slice().reverse();
    const ings = app.repos.ingredients.list();

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Purchase Order'),
        h('div', { class: 'page-sub' }, `${list.length} PO • Klik "Terima" untuk update inventory + auto-jurnal.`),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total PO', value: list.length }),
      KPI({ label: 'Outstanding', value: list.filter(p => p.status !== 'diterima' && p.status !== 'cancel').length }),
      KPI({ label: 'Diterima', value: list.filter(p => p.status === 'diterima').length }),
    ));

    root.append(Card({
      title: 'Buat PO Baru',
      body: h('form', { class: 'col gap-3', onsubmit: (e) => {
        e.preventDefault();
        try {
          if (!form.supId) throw new Error('Pilih supplier');
          const items = form.items
            .filter(i => i.ingId && i.qty > 0)
            .map(i => {
              const ing = ings.find(x => x.id === i.ingId);
              return { ingId: i.ingId, name: ing?.nama || i.ingId, sat: ing?.sat || '', qty: +i.qty, harga: +i.harga || ing?.harga || 0 };
            });
          if (!items.length) throw new Error('Tambah minimal 1 item');
          app.repos.purchaseOrders.create({
            id: '', supId: form.supId, items,
            status: 'dipesan',
            ts: new Date().toISOString(),
            expectedAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
            term: 'NET 30',
          });
          form = { supId: '', items: [{ ingId: '', qty: 0, harga: 0 }] };
          bus.emit('toast', { severity: 'success', message: 'PO dibuat.' });
        } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
      }},
        Field({ label: 'Supplier', children: h('select', {
          class: 'input', value: form.supId, onchange: e => { form.supId = e.target.value; render(); },
        }, [
          h('option', { value: '' }, '— Pilih —'),
          ...app.repos.suppliers.list().map(s => h('option', { value: s.id }, s.name)),
        ])}),
        h('div', { class: 'col gap-2' },
          ...form.items.map((it, i) => h('div', { class: 'form-grid', key: i },
            Field({ label: 'Bahan', children: h('select', {
              class: 'input', value: it.ingId, onchange: e => { it.ingId = e.target.value; const ing = ings.find(x => x.id === it.ingId); if (ing) it.harga = ing.harga || 0; render(); },
            }, [
              h('option', { value: '' }, '— Pilih —'),
              ...ings.map(ing => h('option', { value: ing.id }, ing.nama)),
            ])}),
            Field({ label: 'Qty', children: Input({ type: 'number', min: 0, value: it.qty, oninput: e => it.qty = +e.target.value }) }),
            Field({ label: 'Harga / unit', children: Input({ type: 'number', min: 0, value: it.harga, oninput: e => it.harga = +e.target.value }) }),
          )),
          h('button', { class: 'btn ghost sm', type: 'button', onclick: () => { form.items.push({ ingId: '', qty: 0, harga: 0 }); render(); } }, '+ Tambah Item'),
        ),
        h('button', { class: 'btn primary', type: 'submit' }, 'Buat PO'),
      ),
    }));

    root.append(Card({
      title: 'Daftar Purchase Order',
      body: list.length === 0 ? Empty({ icon: '📦', title: 'Belum ada PO' }) : Table({
        columns: [
          { key: 'id', label: 'ID', render: p => h('strong', null, p.id) },
          { key: 'supId', label: 'Supplier', render: p => app.repos.suppliers.findById(p.supId)?.name || p.supId },
          { key: 'items', label: 'Item', render: p => `${(p.items || []).length} jenis` },
          { key: 'total', label: 'Total', align: 'right', render: p => h('span', { class: 'num' },
            fmt.rp((p.items || []).reduce((s, it) => s + (it.qty * (it.harga || 0)), 0))) },
          { key: 'status', label: 'Status', render: p => {
            if (app.services.approval.needsApproval(p)) return Badge('Perlu Approval', 'warning');
            return Badge(p.status, p.status === 'diterima' ? 'success' : 'warning');
          } },
          { key: 'ts', label: 'Tanggal', render: p => fmt.rel(p.ts) },
          { key: 'actions', label: '', render: p => {
            const total = (p.items || []).reduce((s, it) => s + (it.qty * (it.harga || 0)), 0);
            const threshold = app.services.approval.threshold();
            const needsApproval = total >= threshold && !p.approvedBy && p.status !== 'cancel';
            const me = app.services.auth.getCurrentUser();
            const canApprove = me && ['admin', 'koordinator'].includes(me.role);
            return h('div', { class: 'row gap-2' },
              h('button', { class: 'btn sm ghost', onclick: () => app.services.pdf.printPurchaseOrder(p), title: 'Cetak PO' }, '🖨️'),
              needsApproval && canApprove ? h('button', { class: 'btn sm', style: { background: 'var(--brand)', color: '#fff' }, onclick: () => {
                try {
                  app.services.approval.approve(p.id, { byUserId: me.id, role: me.role });
                  bus.emit('toast', { severity: 'success', message: `PO ${p.id} disetujui.` });
                } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
              } }, '✓ Setujui') : null,
              !needsApproval && p.status !== 'diterima' && p.status !== 'cancel' ? h('button', { class: 'btn primary sm', onclick: () => {
                try {
                  for (const it of p.items) {
                    app.services.inventory.receivePurchase({ ingredientId: it.ingId, qty: it.qty, unitCost: it.harga, supplierId: p.supId, note: `PO ${p.id}` });
                  }
                  app.repos.purchaseOrders.update(p.id, { status: 'diterima', receivedAt: new Date().toISOString() });
                  bus.emit('toast', { severity: 'success', message: 'PO diterima, inventory terupdate.' });
                } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
              } }, 'Terima') : null,
            );
          }},
        ],
        rows: list,
      }),
    }));
  }
  render();
  app.store.subscribe(s => [s.purchaseOrders, s.ingredients], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1]);
  return root;
}

// ─── Finance ──────────────────────────────────────────────────────────
export function financePage(app) {
  const root = h('div', { class: 'col gap-4' });
  let range = 'month';
  function render() {
    while (root.firstChild) root.firstChild.remove();
    const orders = filterByRange(app.repos.orders.list(), o => o.ts, range).filter(o => o.status !== 'cancel');
    const stats = app.services.finance.stats();
    const insights = app.services.finance.insights();
    const trend = app.services.finance.monthlyTrend(new Date().getFullYear());
    const cf = app.services.finance.cashflowProjection(30);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Keuangan'),
        h('div', { class: 'page-sub' }, `${orders.length} order pada periode terpilih`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => exportCSV('finance-orders.csv', orders, [
          { key: 'id', label: 'ID' }, { key: 'buyer', label: 'Pembeli' },
          { key: 'total', label: 'Total' }, { key: 'status', label: 'Status' },
          { key: 'ts', label: 'Tanggal' },
        ]) }, Icon.download(), 'CSV'),
        h('button', { class: 'btn primary', onclick: () => app.services.pdf.printFinancialReport({}) }, '🖨️ Cetak'),
      ),
    ));
    root.append(QuickPills({ active: range, options: DATE_RANGE_OPTIONS, onChange: r => { range = r; render(); } }));
    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Omzet', value: fmt.rp(stats.omz), delta: `${stats.orders} order` }),
      KPI({ label: 'HPP', value: fmt.rp(stats.hpp.total) }),
      KPI({ label: 'Biaya Tetap', value: fmt.rp(stats.fixed) }),
      KPI({ label: 'Profit', value: fmt.rp(stats.profit), delta: fmt.pct(stats.margin), deltaDir: stats.margin >= 15 ? 'up' : 'down' }),
      KPI({ label: 'Pembayaran', value: fmt.rp(stats.paid) }),
      KPI({ label: 'Piutang', value: fmt.rp(stats.sisa), deltaDir: stats.sisa > 0 ? 'down' : 'up' }),
      KPI({ label: 'PO Diterima', value: fmt.rp(stats.poCost) }),
    ));

    root.append(h('div', { class: 'grid-2' },
      Card({ title: 'Tren Bulanan', body:
        h('div', { class: 'col gap-2' },
          h('div', { class: 'row gap-2 text-sm' },
            ...trend.map((t, i) => h('div', { class: 'col', style: { flex: 1, textAlign: 'center' } },
              h('div', { class: 'num', style: { fontWeight: 600, fontSize: '11px' } }, fmt.rp(t.omz)),
              h('div', { class: 'text-xs text-muted' }, ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][i]),
            )),
          ),
        ),
      }),
      Card({ title: 'Insight Otomatis', body:
        insights.length === 0
          ? Empty({ icon: '✨', title: 'Tidak ada sinyal khusus' })
          : h('div', { class: 'col gap-2' },
            ...insights.map(ins => h('div', { class: 'callout ' + (ins.severity || 'info') },
              h('strong', null, ins.title || ins.message),
              ins.detail ? h('div', { class: 'text-sm text-muted' }, ins.detail) : null,
            )),
          ),
      }),
    ));

    root.append(Card({
      title: 'Proyeksi Kas 30 Hari',
      sub: 'Berdasarkan piutang outstanding, PO outstanding, dan biaya tetap.',
      body: cfChart(cf),
    }));
  }

  render();
  app.store.subscribe(s => [s.orders, s.products, s.payments, s.purchaseOrders], () => render(),
    (a, b) => a.every((v, i) => v === b[i]));
  return root;
}

function cfChart(cf) {
  const series = Array.isArray(cf) ? cf : (cf?.series || []);
  if (!series.length) return h('div', { class: 'text-muted text-sm' }, 'Data proyeksi belum tersedia.');
  const max = Math.max(1, ...series.map(d => Math.abs(d.cumulative)));
  const min = Math.min(0, ...series.map(d => d.cumulative));
  return h('div', { class: 'col gap-2' },
    h('div', { class: 'row', style: { height: '120px', alignItems: 'flex-end', gap: '2px' } },
      ...series.map((d, i) => {
        const ratio = (d.cumulative - min) / (max - min || 1);
        return h('div', {
          title: `Hari ${d.day || i + 1}: ${fmt.rp(d.cumulative)}`,
          style: {
            flex: 1, minWidth: '4px',
            height: Math.max(4, ratio * 120) + 'px',
            background: d.cumulative >= 0 ? 'var(--success)' : 'var(--danger)',
            borderRadius: '2px',
            opacity: 0.7,
          },
        });
      }),
    ),
    h('div', { class: 'row between text-xs text-muted' },
      h('span', null, `Hari 1: ${fmt.rp(cf[0]?.cumulative || 0)}`),
      h('span', null, `Hari ${cf.length}: ${fmt.rp(cf[cf.length-1]?.cumulative || 0)}`),
    ),
  );
}

// ─── Reports ──────────────────────────────────────────────────────────
export function reportsPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let from = new Date(Date.now() - 30 * 86400_000).toISOString().slice(0, 10);
  let to = new Date().toISOString().slice(0, 10);

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const orders = app.repos.orders.list(o => {
      const d = (o.ts || '').slice(0, 10);
      return d >= from && d <= to && o.status !== 'cancel';
    });
    // Sales by product (mendukung skema lama o.pid/qty + skema baru o.items[])
    const byProduct = new Map();
    for (const o of orders) {
      const lines = (o.items && o.items.length) ? o.items : (o.pid ? [{ id: o.pid, qty: o.qty || 1 }] : []);
      for (const it of lines) {
        const p = app.repos.products.findById(it.id);
        const name = p?.name || o.pname || it.id;
        const sell = p?.sell || o.sell || 0;
        const cur = byProduct.get(it.id) || { id: it.id, name, qty: 0, revenue: 0 };
        cur.qty += it.qty || 0;
        cur.revenue += (it.qty || 0) * sell;
        byProduct.set(it.id, cur);
      }
    }
    const productRows = [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);

    // Sales by customer
    const byCust = new Map();
    for (const o of orders) {
      const c = app.repos.customers.findById(o.custId);
      const key = c?.id || 'walkin';
      const name = c?.name || 'Walk-in';
      const cur = byCust.get(key) || { id: key, name, orders: 0, revenue: 0 };
      cur.orders += 1;
      cur.revenue += (o.total || 0) + (o.ongkir || 0);
      byCust.set(key, cur);
    }
    const custRows = [...byCust.values()].sort((a, b) => b.revenue - a.revenue);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Laporan'),
        h('div', { class: 'page-sub' }, `${from} → ${to} • ${orders.length} order`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => exportCSV('reports-products.csv', productRows, [
          { key: 'name', label: 'Produk' }, { key: 'qty', label: 'Qty' }, { key: 'revenue', label: 'Revenue' },
        ]) }, Icon.download(), 'CSV'),
        h('button', { class: 'btn primary', onclick: () => app.services.pdf.printFinancialReport({ from, to }) }, '🖨️ Cetak PDF'),
      ),
    ));

    root.append(Card({ body: h('div', { class: 'form-grid' },
      Field({ label: 'Dari', children: Input({ type: 'date', value: from, onchange: e => { from = e.target.value; render(); } }) }),
      Field({ label: 'Sampai', children: Input({ type: 'date', value: to, onchange: e => { to = e.target.value; render(); } }) }),
    )}));

    root.append(Card({
      title: 'Penjualan per Produk',
      body: productRows.length === 0 ? Empty() : Table({
        columns: [
          { key: 'name', label: 'Produk' },
          { key: 'qty', label: 'Qty', align: 'right' },
          { key: 'revenue', label: 'Revenue', align: 'right', render: r => h('span', { class: 'num' }, fmt.rp(r.revenue)) },
          { key: 'pct', label: 'Share', align: 'right', render: r => fmt.pct(r.revenue / productRows.reduce((s, x) => s + x.revenue, 0) * 100) },
        ],
        rows: productRows,
      }),
    }));

    root.append(Card({
      title: 'Penjualan per Pelanggan',
      body: custRows.length === 0 ? Empty() : Table({
        columns: [
          { key: 'name', label: 'Pelanggan' },
          { key: 'orders', label: 'Order', align: 'right' },
          { key: 'revenue', label: 'Revenue', align: 'right', render: r => h('span', { class: 'num' }, fmt.rp(r.revenue)) },
        ],
        rows: custRows,
      }),
    }));
  }
  render();
  app.store.subscribe(s => [s.orders, s.products, s.customers], () => render(), (a, b) => a.every((v, i) => v === b[i]));
  return root;
}

// ─── Invoice ──────────────────────────────────────────────────────────
export function invoicePage(app) {
  const root = h('div', { class: 'col gap-4' });
  let q = '';
  function render() {
    while (root.firstChild) root.firstChild.remove();
    let orders = app.repos.orders.list().slice().reverse();
    if (q) orders = orders.filter(o => `${o.id} ${o.buyer || ''}`.toLowerCase().includes(q.toLowerCase()));

    root.append(header('Invoice', 'Cetak invoice & struk POS untuk setiap order.'));
    root.append(Card({
      body: h('div', { class: 'col gap-2' },
        Input({ placeholder: 'Cari ID / pembeli…', oninput: e => { q = e.target.value; render(); } }),
        Table({
          columns: [
            { key: 'id', label: 'ID', render: o => h('strong', null, o.id) },
            { key: 'buyer', label: 'Pembeli' },
            { key: 'total', label: 'Total', align: 'right', render: o => h('span', { class: 'num' }, fmt.rp((o.total || 0) + (o.ongkir || 0))) },
            { key: 'paid', label: 'Dibayar', align: 'right', render: o => {
              const paid = app.services.payment.totalPaid(o.id);
              return h('span', { class: 'num' }, fmt.rp(paid));
            } },
            { key: 'status', label: 'Status', render: o => Badge(o.status, o.status === 'paid' ? 'success' : 'warning') },
            { key: 'ts', label: 'Tanggal', render: o => fmt.rel(o.ts) },
            { key: 'actions', label: '', render: o => h('div', { class: 'row gap-2' },
              h('button', { class: 'btn sm primary', onclick: () => app.services.pdf.printInvoice(o) }, '🧾 Invoice'),
              h('button', { class: 'btn sm', onclick: () => app.services.pdf.printReceipt(o) }, '📄 Struk'),
            )},
          ],
          rows: orders,
          empty: Empty({ icon: '🧾', title: 'Belum ada invoice', detail: 'Order otomatis menjadi invoice setelah checkout.' }),
        }),
      ),
    }));
  }
  render();
  app.store.subscribe(s => [s.orders, s.payments], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1]);
  return root;
}

// ─── Audit ────────────────────────────────────────────────────────────
export function auditPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let f = { domain: 'all', action: 'all', q: '' };

  function render() {
    while (root.firstChild) root.firstChild.remove();
    let logs = (app.store.getState().auditLogs || []).slice().reverse();
    if (f.domain !== 'all') logs = logs.filter(l => l.resource === f.domain);
    if (f.action !== 'all') logs = logs.filter(l => l.action === f.action);
    if (f.q) logs = logs.filter(l => JSON.stringify(l).toLowerCase().includes(f.q.toLowerCase()));

    const domains = [...new Set((app.store.getState().auditLogs || []).map(l => l.resource))];
    const actions = [...new Set((app.store.getState().auditLogs || []).map(l => l.action))];

    root.append(header('Audit Log', `${logs.length} entry ditampilkan`));
    root.append(Card({ body: h('div', { class: 'form-grid' },
      Field({ label: 'Resource', children: Select(
        [{ value: 'all', label: 'Semua' }, ...domains.map(d => ({ value: d, label: d }))],
        { value: f.domain, onchange: e => { f.domain = e.target.value; render(); } },
      ) }),
      Field({ label: 'Aksi', children: Select(
        [{ value: 'all', label: 'Semua' }, ...actions.map(a => ({ value: a, label: a }))],
        { value: f.action, onchange: e => { f.action = e.target.value; render(); } },
      ) }),
      Field({ label: 'Cari', children: Input({ value: f.q, oninput: e => { f.q = e.target.value; render(); } }) }),
    )}));

    root.append(Card({ body: Table({
      columns: [
        { key: 'timestamp', label: 'Waktu', render: l => fmt.dt(l.timestamp) },
        { key: 'action', label: 'Aksi', render: l => Badge(l.action, kindForAction(l.action)) },
        { key: 'resource', label: 'Resource' },
        { key: 'resourceId', label: 'ID' },
        { key: 'userName', label: 'User' },
      ],
      rows: logs.slice(0, 500),
      empty: Empty({ icon: '📜', title: 'Belum ada audit log' }),
    }) }));
  }
  render();
  app.store.subscribe(s => s.auditLogs, () => render(), (a, b) => a === b);
  return root;
}

// ─── Users ────────────────────────────────────────────────────────────
export function usersPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function openAdd() {
    const f = { name: '', email: '', pos: '', role: 'barista', wa: '', pw: '' };
    const m = openModal({
      title: 'Tambah Pengguna',
      body: h('div', { class: 'col gap-3' },
        Input({ placeholder: 'Nama', oninput: e => f.name = e.target.value }),
        Input({ type: 'email', placeholder: 'Email', oninput: e => f.email = e.target.value }),
        Input({ placeholder: 'Posisi', oninput: e => f.pos = e.target.value }),
        Select(
          [{value:'admin',label:'Admin'},{value:'koordinator',label:'Koordinator'},{value:'produksi',label:'Produksi'},{value:'sales',label:'Sales'},{value:'marketing',label:'Marketing'},{value:'barista',label:'Barista'}],
          { value: f.role, onchange: e => f.role = e.target.value },
        ),
        Input({ placeholder: 'WhatsApp', oninput: e => f.wa = e.target.value }),
        Input({ type: 'password', placeholder: 'Password', oninput: e => f.pw = e.target.value }),
      ),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: async () => {
          try {
            if (!f.name || !f.email || !f.pw) throw new Error('Nama, email, password wajib');
            await app.services.auth.register({ ...f, status: 'active' });
            bus.emit('toast', { severity: 'success', message: 'Pengguna ditambahkan.' });
            m.close();
          } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
        } }, 'Daftarkan'),
      ],
    });
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const list = app.repos.users.list();
    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Pengguna'),
        h('div', { class: 'page-sub' }, `${list.length} pengguna`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn primary', onclick: openAdd }, Icon.plus(), 'Tambah'),
      ),
    ));

    root.append(Card({ body: Table({
      columns: [
        { key: 'name', label: 'Nama', render: u => h('div', { class: 'row gap-2' },
          u.photo ? h('img', { class: 'avatar', src: u.photo }) : h('span', { class: 'avatar' }, (u.name || '?')[0]),
          h('div', { class: 'col' }, h('strong', null, u.name), h('div', { class: 'text-xs text-muted' }, u.pos || '—')),
        )},
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role', render: u => Badge(u.role, 'brand') },
        { key: 'status', label: 'Status', render: u => Badge(u.status, u.status === 'active' ? 'success' : (u.status === 'pending' ? 'warning' : 'default')) },
        { key: 'actions', label: '', render: u => h('div', { class: 'row gap-2' },
          h('select', {
            class: 'input', style: { padding: '4px 8px', fontSize: '12px' },
            value: u.status, onchange: e => app.repos.users.update(u.id, { status: e.target.value }),
          }, ['active','pending','inactive'].map(s => h('option', { value: s }, s))),
        )},
      ],
      rows: list, empty: Empty(),
    }) }));
  }
  render();
  app.store.subscribe(s => s.users, () => render(), (a, b) => a === b);
  return root;
}

function kindForAction(a) {
  return a === 'CREATE' ? 'info'
    : a === 'UPDATE' ? 'warning'
    : a === 'DELETE' ? 'danger'
    : a === 'LOGIN' ? 'success'
    : a === 'LOGOUT' ? 'default'
    : 'brand';
}
function header(title, sub) {
  return h('div', { class: 'page-header' },
    h('div', null,
      h('div', { class: 'page-title' }, title),
      h('div', { class: 'page-sub' }, sub),
    ),
  );
}
