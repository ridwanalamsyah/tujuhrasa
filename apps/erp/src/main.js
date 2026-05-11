// src/main.js — entry SPA.
import { createApp } from './app.js';
import { SupabaseStorageAdapter, LocalStorageAdapter } from './core/storage.js';
import { Router } from './view/router.js';
import { buildShell } from './view/shell.js';
import { authView } from './view/pages/auth.js';
import { dashboardPage } from './view/pages/dashboard.js';
import { ordersPage } from './view/pages/orders.js';
import { posPage } from './view/pages/pos.js';
import { productsPage } from './view/pages/products.js';
import { inventoryPage } from './view/pages/inventory.js';
import { schedulePage } from './view/pages/schedule.js';
import { settingsPage } from './view/pages/settings.js';
import { accountingPage } from './view/pages/accounting.js';
import { wastagePage } from './view/pages/wastage.js';
import { recipePage } from './view/pages/recipe.js';
import { shiftsPage } from './view/pages/shifts.js';
import { pointsPage } from './view/pages/points.js';
import { productionPage } from './view/pages/production.js';
import { promoPage } from './view/pages/promo.js';
import { analyticsPage } from './view/pages/analytics.js';
import { subscriptionsPage } from './view/pages/subscriptions.js';
import {
  customersPage, suppliersPage, purchasesPage,
  financePage, reportsPage, invoicePage,
  auditPage, usersPage,
} from './view/pages/_stub.js';
import { compose } from './view/pages/_composite.js';
import { createTheme } from './view/theme.js';
import { seedDemo } from './view/seed.js';
import { bus } from './core/eventBus.js';

async function bootstrap() {
  const root = document.getElementById('root');
  root.innerHTML = '';
  const theme = createTheme();

  // Optional Supabase backend: jika user telah mengisi URL & anon key di
  // localStorage `tr_supabase_cfg`, gunakan SupabaseStorageAdapter; selain itu
  // fallback ke LocalStorage.
  // Escape hatch: tambahkan ?nosupabase pada URL untuk paksa LocalStorage tanpa hapus config.
  const forceLocal = /[?&]nosupabase\b/.test(location.search);
  let storageAdapter;
  let supabaseActive = false;
  // Default Supabase config — anon key adalah public-facing key (dilindungi RLS),
  // jadi aman di-bake ke source. User bisa override via Settings → Integrasi.
  const DEFAULT_SUPABASE = {
    url: 'https://epakwpgryncocqwmslod.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwYWt3cGdyeW5jb2Nxd21zbG9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNTI3OTksImV4cCI6MjA5MzgyODc5OX0.LE6p2YrDr7bQJnbql-pD70Xw2kEUL4fLGY_4SQXSQks',
  };
  // Bootstrap default config kalau user belum set & belum opt-out lewat ?nosupabase.
  if (!forceLocal && !localStorage.getItem('tr_supabase_cfg') && !localStorage.getItem('tr_supabase_optout')) {
    try { localStorage.setItem('tr_supabase_cfg', JSON.stringify(DEFAULT_SUPABASE)); } catch {}
  }

  // Self-heal: deteksi URL salah yg sering di-paste user (URL halaman dashboard,
  // bukan API endpoint), normalisasi ke format `https://<ref>.supabase.co`.
  function normalizeSupabaseUrl(url) {
    if (!url || typeof url !== 'string') return url;
    const m = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9-]+)/i)
           || url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
    if (m && m[1]) return `https://${m[1]}.supabase.co`;
    return url.replace(/\/$/, '');
  }
  try {
    const raw = localStorage.getItem('tr_supabase_cfg');
    if (raw) {
      const cur = JSON.parse(raw);
      if (cur?.url) {
        const fixed = normalizeSupabaseUrl(cur.url);
        if (fixed && fixed !== cur.url) {
          console.warn('[Storage] URL Supabase auto-fixed:', cur.url, '→', fixed);
          cur.url = fixed;
          localStorage.setItem('tr_supabase_cfg', JSON.stringify(cur));
        }
      }
    }
  } catch {}

  if (!forceLocal) {
    try {
      const cfg = JSON.parse(localStorage.getItem('tr_supabase_cfg') || 'null');
      if (cfg?.url && cfg?.anonKey) {
        // Health-check: ping kv_store table sebelum commit. Kalau 404 (tabel belum dibuat),
        // 401 (key salah), atau network error, fallback otomatis agar app tetap bisa dipakai.
        const hc = await fetch(
          `${cfg.url.replace(/\/$/, '')}/rest/v1/kv_store?select=key&limit=1`,
          { headers: { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey } }
        ).catch(() => null);
        if (hc && hc.ok) {
          storageAdapter = new SupabaseStorageAdapter({ url: cfg.url, anonKey: cfg.anonKey });
          supabaseActive = true;
          console.log('[Storage] Supabase adapter aktif');
        } else {
          const status = hc ? hc.status : 'network';
          console.warn(`[Storage] Supabase health-check gagal (${status}). Fallback ke LocalStorage. Cek tabel "kv_store" sudah dibuat? (lihat docs/DEPLOY.md)`);
          // Tampilkan banner agar user tahu (akan muncul setelah app render)
          window.__supabaseError = `Sinkronisasi cloud tidak tersedia. Aplikasi tetap berjalan dengan data lokal.`;
        }
      }
    } catch (e) {
      console.warn('[Storage] Supabase init error', e);
      window.__supabaseError = 'Sinkronisasi cloud tidak tersedia. Aplikasi tetap berjalan dengan data lokal.';
    }
  }
  storageAdapter = storageAdapter || new LocalStorageAdapter();

  const app = createApp({ storageAdapter });
  await app.init();
  app._supabaseActive = supabaseActive;
  if (typeof window !== 'undefined') window.__supabaseActive = supabaseActive;
  if (app.services && app.services.autoBackup) app.services.autoBackup.app = app;

  // Apply brand color from settings as CSS var.
  applyBrand(app);
  bus.on('settings:updated', () => applyBrand(app));

  await seedDemo(app);

  // Restore session per-browser (localStorage) — TIDAK di-share via cloud,
  // jadi tab incognito / device baru wajib login eksplisit.
  app.services.auth.restoreSession();

  // Banner peringatan Supabase (jika init gagal)
  if (window.__supabaseError) {
    setTimeout(() => {
      const banner = document.createElement('div');
      banner.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:9999;background:#fef3c7;color:#78350f;border:1px solid #fcd34d;padding:10px 16px;border-radius:10px;max-width:520px;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,.1);display:flex;gap:12px;align-items:center;';
      banner.innerHTML = `<div>⚠️ ${window.__supabaseError}</div><button style="background:#78350f;color:#fff;border:0;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:12px">Nonaktifkan</button>`;
      banner.querySelector('button').onclick = () => {
        localStorage.removeItem('tr_supabase_cfg');
        localStorage.setItem('tr_supabase_optout', '1');
        location.reload();
      };
      document.body.appendChild(banner);
    }, 100);
  }

  if (!app.services.auth.getCurrentUser()) {
    root.append(authView(app, () => bootstrap()));
    return;
  }

  app.services.reminderEngine.start({ intervalMs: 60_000 });
  app.services.autoBackup.start({ checkEveryMs: 30 * 60 * 1000 });
  // Auto-execute due subscriptions on startup.
  try {
    const created = app.services.subscription.runDueToday();
    if (created.length) {
      console.log(`[Subscription] ${created.length} order auto-dibuat dari subscription`);
    }
  } catch (e) { console.warn('[Subscription]', e); }

  // Halaman komposit: gabungkan beberapa modul terkait menjadi 1 halaman ber-tab,
  // supaya sidebar ringkas (~10 menu utama) dan navigasi lebih intuitif.
  const ordersComposite = compose({
    title: 'Order',
    tabs: [
      { id: 'list',    label: 'Daftar Order', build: ordersPage },
      { id: 'shifts',  label: 'Shift Kasir',  build: shiftsPage },
      { id: 'invoice', label: 'Invoice',      build: invoicePage },
    ],
  });
  const productionComposite = compose({
    title: 'Produksi',
    tabs: [
      { id: 'plan',    label: 'Rencana Produksi', build: productionPage },
      { id: 'recipe',  label: 'Resep',            build: recipePage },
      { id: 'wastage', label: 'Wastage',          build: wastagePage },
      { id: 'sched',   label: 'Jadwal',           build: schedulePage },
    ],
  });
  const productsComposite = compose({
    title: 'Produk & Inventory',
    tabs: [
      { id: 'list', label: 'Produk',    build: productsPage },
      { id: 'inv',  label: 'Inventory', build: inventoryPage },
    ],
  });
  const customersComposite = compose({
    title: 'Pelanggan',
    tabs: [
      { id: 'list',         label: 'Daftar',       build: customersPage },
      { id: 'analytics',    label: 'Analytics',    build: analyticsPage },
      { id: 'loyalty',      label: 'Bagi Hasil',   build: pointsPage },
      { id: 'subscription', label: 'Subscription', build: subscriptionsPage },
    ],
  });
  const suppliersComposite = compose({
    title: 'Supplier & Pembelian',
    tabs: [
      { id: 'list', label: 'Supplier',       build: suppliersPage },
      { id: 'po',   label: 'Purchase Order', build: purchasesPage },
    ],
  });
  const financeComposite = compose({
    title: 'Keuangan',
    tabs: [
      { id: 'cash',  label: 'Arus Kas',  build: financePage },
      { id: 'acc',   label: 'Akuntansi', build: accountingPage },
      { id: 'rep',   label: 'Laporan',   build: reportsPage },
    ],
  });
  const settingsComposite = compose({
    title: 'Pengaturan',
    tabs: [
      { id: 'main',  label: 'Pengaturan', build: settingsPage },
      { id: 'audit', label: 'Riwayat Aktivitas', build: auditPage },
    ],
  });

  const pages = {
    dashboard:  dashboardPage,
    pos:        posPage,
    orders:     ordersComposite,
    products:   productsComposite,
    customers:  customersComposite,
    suppliers:  suppliersComposite,
    production: productionComposite,
    promo:      promoPage,
    finance:    financeComposite,
    users:      usersPage,
    settings:   settingsComposite,
  };

  // Alias: redirect legacy route ke composite parent supaya bookmark/link lama
  // tetap berfungsi tanpa pecah.
  const ALIAS = {
    '/inventory': '/products',
    '/schedule':  '/production',
    '/recipe':    '/production',
    '/wastage':   '/production',
    '/shifts':    '/orders',
    '/invoice':   '/orders',
    '/analytics': '/customers',
    '/points':    '/customers',
    '/subscriptions': '/customers',
    '/purchases': '/suppliers',
    '/accounting': '/finance',
    '/reports':   '/finance',
    '/audit':     '/settings',
  };

  const router = new Router();
  for (const id of Object.keys(pages)) router.on('/' + id, () => {});
  router.setFallback(() => {
    const cur = location.hash.replace(/^#/, '');
    if (ALIAS[cur]) { location.hash = '#' + ALIAS[cur]; return; }
    location.hash = '#/dashboard';
  });

  buildShell({ root, app, router, pages, theme });

  // PWA install prompt — banner halus muncul di bottom kalau eligible.
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const dismissed = localStorage.getItem('tr_pwa_dismissed') === '1';
    if (dismissed) return;
    const banner = document.createElement('div');
    banner.className = 'pwa-banner';
    banner.innerHTML = `
      <div class="pwa-banner-inner">
        <div class="pwa-banner-text">Pasang ke perangkat — akses cepat & bisa offline.</div>
        <button class="btn primary sm" data-install>Pasang</button>
        <button class="icon-btn sm" data-dismiss aria-label="Tutup">×</button>
      </div>`;
    banner.querySelector('[data-install]').onclick = async () => {
      e.prompt();
      const { outcome } = await e.userChoice;
      if (outcome !== 'accepted') localStorage.setItem('tr_pwa_dismissed', '1');
      banner.remove();
    };
    banner.querySelector('[data-dismiss]').onclick = () => {
      localStorage.setItem('tr_pwa_dismissed', '1');
      banner.remove();
    };
    document.body.appendChild(banner);
  });

  // Daily ops digest — popup pagi sekali per hari.
  showDailyDigest(app);

  // Role-based landing: arahkan user ke halaman job utamanya saat boot pertama
  // (kalau hash kosong / hash menuju halaman yang tidak boleh dia akses).
  const u = app.services.auth.getCurrentUser();
  const role = u?.role || 'admin';
  const ROLE_LANDING = {
    barista: '/pos', sales: '/pos', produksi: '/production',
    marketing: '/promo', koordinator: '/orders', admin: '/dashboard',
  };
  const initialHash = (location.hash || '').replace(/^#/, '');
  const wantedPage = initialHash.replace(/^\//, '');
  const allowed = !wantedPage || (app.services.rbac.can(role, wantedPage) || wantedPage === 'dashboard');
  const startPath = allowed && initialHash ? initialHash : (ROLE_LANDING[role] || '/dashboard');
  router.start(startPath);

}

function applyBrand(app) {
  const s = app.repos.settings.get();
  if (!s) return;
  const root = document.documentElement;
  if (s.color) root.style.setProperty('--brand', s.color);
}

function showDailyDigest(app) {
  const today = new Date().toISOString().slice(0, 10);
  const seenKey = 'tr_digest_seen';
  if (localStorage.getItem(seenKey) === today) return;

  const orders = app.repos.orders.list();
  const yKey = new Date(Date.now() - 86400_000).toISOString().slice(0, 10);
  const yOrders = orders.filter(o => (o.ts || '').startsWith(yKey) && o.status !== 'cancel');
  const yOmz = yOrders.reduce((s, o) => s + (o.total || 0) + (o.ongkir || 0), 0);

  const ings = app.repos.ingredients.list();
  const lowIng = ings.filter(i => (i.stock || 0) <= (i.minStk || 0)).length;

  const pendingOrders = orders.filter(o => ['pending','partial','packing'].includes(o.status)).length;

  const card = document.createElement('div');
  card.className = 'modal-overlay';
  card.innerHTML = `
    <div class="modal-card" style="max-width: 380px;">
      <div class="modal-head">
        <h3>Selamat pagi! ☕</h3>
        <button class="icon-btn" data-close aria-label="Tutup">×</button>
      </div>
      <div class="col gap-3">
        <div class="kpi"><div class="kpi-label">Omzet kemarin</div><div class="kpi-value">Rp ${yOmz.toLocaleString('id-ID')}</div><div class="kpi-delta">${yOrders.length} order</div></div>
        <div class="kpi"><div class="kpi-label">Bahan menipis</div><div class="kpi-value">${lowIng}</div><div class="kpi-delta ${lowIng > 0 ? 'down' : 'up'}">${lowIng > 0 ? 'Perlu restock' : 'Aman'}</div></div>
        <div class="kpi"><div class="kpi-label">Order pending</div><div class="kpi-value">${pendingOrders}</div><div class="kpi-delta">menunggu tindak lanjut</div></div>
      </div>
    </div>
  `;
  card.addEventListener('click', (e) => {
    if (e.target === card || e.target.dataset.close !== undefined || e.target.closest('[data-close]')) {
      card.remove();
      localStorage.setItem(seenKey, today);
    }
  });
  document.body.appendChild(card);
}

bootstrap().catch((e) => {
  console.error(e);
  document.body.innerHTML = `<pre style="padding:24px;font:14px monospace;color:#dc2626">Bootstrap gagal: ${e.message}\n${e.stack}</pre>`;
});
