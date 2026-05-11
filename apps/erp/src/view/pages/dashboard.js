// src/view/pages/dashboard.js
import { h, fmt } from '../h.js';
import { Card, KPI, Sparkline, Empty, Badge, StatusBadge, openModal } from '../components.js';
import { Icon } from '../icons.js';

function showDailyDigest(app) {
  const digest = app.services.aiInsight.dailyDigest();
  const actions = app.services.aiInsight.actionItems();
  openModal({
    title: '🤖 Ringkasan Harian',
    body: h('div', { class: 'col gap-3' },
      h('pre', {
        style: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '14px',
                 background: 'var(--bg-soft, #f8fafc)', padding: '12px 16px',
                 borderRadius: '10px', margin: 0, lineHeight: '1.6' },
      }, digest),
      actions.length > 0
        ? h('div', { class: 'col gap-2' },
            h('div', { style: { fontWeight: '600', fontSize: '13px' } }, 'Saran tindakan:'),
            ...actions.map(a => h('div', {
              style: { padding: '10px 12px', borderLeft: `3px solid ${a.priority === 'high' ? '#ef4444' : '#f59e0b'}`,
                       background: 'var(--bg-soft, #f8fafc)', borderRadius: '0 8px 8px 0', fontSize: '13px' },
            },
              h('div', { style: { fontWeight: '600' } }, a.action),
              h('div', { style: { color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' } }, a.detail),
            )),
          )
        : null,
    ),
    footer: [
      h('button', { class: 'btn ghost', onclick: () => {
        navigator.clipboard?.writeText(digest);
      } }, 'Salin teks'),
    ],
  });
}

// Quick-action shortcut per role: arahkan ke halaman utama job masing-masing.
const ROLE_QUICK = {
  barista:     [{ label: 'Buka Kasir', icon: 'pos', go: '#/pos', primary: true }, { label: 'Produksi', icon: 'products', go: '#/production' }, { label: 'Order', icon: 'orders', go: '#/orders' }],
  produksi:    [{ label: 'Produksi', icon: 'products', go: '#/production', primary: true }, { label: 'Produk', icon: 'inventory', go: '#/products' }, { label: 'Supplier', icon: 'suppliers', go: '#/suppliers' }],
  sales:       [{ label: 'Buka Kasir', icon: 'pos', go: '#/pos', primary: true }, { label: 'Order', icon: 'orders', go: '#/orders' }, { label: 'Pelanggan', icon: 'customers', go: '#/customers' }],
  marketing:   [{ label: 'Promo', icon: 'reports', go: '#/promo', primary: true }, { label: 'Pelanggan', icon: 'customers', go: '#/customers' }, { label: 'Keuangan', icon: 'finance', go: '#/finance' }],
  koordinator: [{ label: 'Order', icon: 'orders', go: '#/orders', primary: true }, { label: 'Produksi', icon: 'products', go: '#/production' }, { label: 'Keuangan', icon: 'finance', go: '#/finance' }],
  admin:       [{ label: 'Kasir', icon: 'pos', go: '#/pos', primary: true }, { label: 'Keuangan', icon: 'finance', go: '#/finance' }, { label: 'Pengguna', icon: 'users', go: '#/users' }],
};

export function dashboardPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const u = app.services.auth.getCurrentUser();
    const role = u?.role || 'admin';
    const stats = app.services.finance.stats();
    const ins   = app.services.finance.insights();
    const trend = app.services.finance.monthlyTrend(new Date().getFullYear());
    const orders = app.repos.orders.list().slice(-5).reverse();

    const quick = ROLE_QUICK[role] || ROLE_QUICK.admin;
    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, u ? u.name.split(' ')[0] : 'Selamat datang'),
        h('div', { class: 'page-sub' }, roleGreeting(role)),
      ),
      h('div', { class: 'page-actions' },
        h('button', {
          class: 'btn ghost sm',
          title: 'Lihat ringkasan harian',
          onclick: () => showDailyDigest(app),
        }, '🤖 AI Digest'),
        ...quick.map(q => h('button', {
          class: 'btn ' + (q.primary ? 'primary' : 'ghost') + ' sm',
          onclick: () => { location.hash = q.go; }
        }, Icon[q.icon] ? Icon[q.icon]() : null, q.label)),
      ),
    ));

    // KPI cards — disesuaikan dengan role.
    root.append(h('div', { class: 'kpi-grid' }, ...kpisFor(role, app, stats)));

    // Insights + Tren
    const tren = trend.map(t => t.omz);
    root.append(h('div', { class: 'grid-2 mt-4' },
      Card({
        title: 'Tren Omzet — ' + new Date().getFullYear(),
        sub: 'Per bulan',
        body: h('div', { class: 'col gap-2' },
          Sparkline(tren),
          h('div', { class: 'row between text-xs text-muted' },
            h('span', null, 'Jan'), h('span', null, 'Mar'), h('span', null, 'Jun'),
            h('span', null, 'Sep'), h('span', null, 'Des'),
          ),
        ),
      }),
      Card({
        title: 'Insight Otomatis',
        sub: ins.length ? `${ins.length} sinyal terdeteksi` : 'Sistem dalam kondisi baik',
        body: ins.length === 0
          ? h('div', { class: 'empty' }, h('div', { class: 'ico' }, '✓'), h('div', { class: 'title' }, 'Tidak ada peringatan.'))
          : h('div', { class: 'col gap-2' }, ...ins.map(i => h('div', { class: 'insight ' + i.severity },
              h('div', { class: 'col grow' },
                h('div', { class: 'title' }, i.title),
                h('div', { class: 'detail' }, i.detail),
                i.action ? h('div', { class: 'action' }, '→ ' + i.action) : null,
              ),
            ))),
      }),
    ));

    // Order terbaru
    root.append(Card({
      title: 'Order Terbaru',
      actions: h('a', { class: 'btn ghost sm', href: '#/orders' }, 'Lihat semua', Icon.arrow_right()),
      body: orders.length === 0
        ? Empty({ title: 'Belum ada order', detail: 'Order baru akan muncul di sini.' })
        : h('div', { class: 'col gap-2' }, ...orders.map(o => h('div', { class: 'row between', style: { padding: '8px 0', borderBottom: '1px solid var(--border-soft)' } },
            h('div', { class: 'col grow' },
              h('div', { class: 'row gap-2' },
                h('strong', null, o.id),
                StatusBadge(o.status),
              ),
              h('div', { class: 'text-xs text-muted' }, `${o.buyer} • ${o.pname} × ${o.qty} • ${fmt.rel(o.ts)}`),
            ),
            h('div', { class: 'num', style: { fontWeight: 600 } }, fmt.rp((o.total || 0) + (o.ongkir || 0))),
          ))),
    }));
  }

  render();
  app.store.subscribe(
    s => [s.orders, s.products, s.notifications],
    () => render(),
    (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
  );
  return root;
}

function roleGreeting(role) {
  return ({
    barista:     'Counter siap. Gas tarik order.',
    produksi:    'Cek bahan & jadwal batch hari ini.',
    sales:       'Konversi pengunjung jadi order.',
    marketing:   'Pantau kampanye & poin reward.',
    koordinator: 'Operasi terkendali. Cek konflik & order.',
    admin:       'Ringkasan operasi & keuangan hari ini.',
  })[role] || 'Selamat bekerja.';
}

function kpisFor(role, app, stats) {
  const today = new Date().toISOString().slice(0, 10);
  if (role === 'barista' || role === 'sales') {
    const todayOrders = app.repos.orders.list(o => (o.ts || '').slice(0,10) === today && o.status !== 'cancel');
    const todayOmz = todayOrders.reduce((s, o) => s + (o.total || 0), 0);
    return [
      KPI({ label: 'Order Hari Ini', value: String(todayOrders.length), delta: 'transaksi' }),
      KPI({ label: 'Omzet Hari Ini', value: fmt.rp(todayOmz), delta: 'sebelum diskon' }),
      KPI({ label: 'Total Order Bulan', value: String(stats.orders), delta: 'periode aktif' }),
      KPI({ label: 'Omzet Bulan', value: fmt.rp(stats.omz), delta: fmt.pct(stats.margin) + ' margin' }),
    ];
  }
  if (role === 'produksi') {
    const ings = app.repos.ingredients?.list?.() || [];
    const low = ings.filter(i => (i.stock || 0) <= (i.minStk || 0)).length;
    const totVal = ings.reduce((s, i) => s + (i.stock || 0) * (i.cost || 0), 0);
    return [
      KPI({ label: 'Bahan Menipis', value: String(low), delta: low > 0 ? 'butuh PO' : 'aman', deltaDir: low > 0 ? 'down' : 'up' }),
      KPI({ label: 'Nilai Persediaan', value: fmt.rp(totVal), delta: ings.length + ' SKU' }),
      KPI({ label: 'Omzet Bulan', value: fmt.rp(stats.omz), delta: stats.orders + ' order' }),
      KPI({ label: 'HPP', value: fmt.rp(stats.hpp || 0), delta: fmt.pct((stats.hpp / stats.omz) * 100 || 0) + ' dari omzet' }),
    ];
  }
  if (role === 'marketing') {
    const customers = app.repos.customers?.list?.() || [];
    const aktif = customers.filter(c => (c.orders || 0) >= 1).length;
    const promos = app.repos.promos?.list?.() || [];
    return [
      KPI({ label: 'Pelanggan', value: String(customers.length), delta: aktif + ' aktif' }),
      KPI({ label: 'Promo Aktif', value: String(promos.filter(p => p.active).length || promos.length), delta: 'kampanye' }),
      KPI({ label: 'Omzet Bulan', value: fmt.rp(stats.omz), delta: stats.orders + ' order' }),
      KPI({ label: 'Profit', value: fmt.rp(stats.profit), delta: fmt.pct(stats.margin) + ' margin' }),
    ];
  }
  // admin / koordinator
  return [
    KPI({ label: 'Omzet', value: fmt.rp(stats.omz), delta: `${stats.orders} order`, deltaDir: 'up' }),
    KPI({ label: 'Profit', value: fmt.rp(stats.profit), delta: fmt.pct(stats.margin), deltaDir: stats.margin >= 15 ? 'up' : 'down' }),
    KPI({ label: 'Pembayaran', value: fmt.rp(stats.paid), delta: 'diterima' }),
    KPI({ label: 'Piutang', value: fmt.rp(stats.sisa), delta: stats.sisa > 0 ? 'belum lunas' : 'lunas', deltaDir: stats.sisa > 0 ? 'down' : 'up' }),
  ];
}
