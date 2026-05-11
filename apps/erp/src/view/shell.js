// src/view/shell.js
// Shell SPA: topbar + sidebar + main content + drawer notifikasi + command palette.
// Subscribe ke Store untuk badge notif & current user.

import { h, mount, clear } from './h.js';
import { Icon } from './icons.js';
import { bus } from '../core/eventBus.js';

// Sidebar dua-level: section → menu utama (parent) → sub-menu (tab di dalam
// halaman komposit). Sub-menu tampil sebagai child indented; klik akan
// navigasi ke `#/<parent>?tab=<sub.tab>`.
const NAV = [
  { section: 'Operasional' },
  { id: 'dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { id: 'pos',        label: 'Kasir',      icon: 'pos' },
  { id: 'orders',     label: 'Order',      icon: 'orders', children: [
    { tab: 'list',    label: 'Daftar Order' },
    { tab: 'shifts',  label: 'Shift Kasir' },
    { tab: 'invoice', label: 'Invoice' },
  ]},

  { section: 'Menu & Produksi' },
  { id: 'products',   label: 'Meracik Menu', icon: 'products', children: [
    { tab: 'list',    label: 'Daftar Produk' },
    { tab: 'inv',     label: 'Inventory' },
  ]},
  { id: 'production', label: 'Produksi',   icon: 'production', children: [
    { tab: 'plan',    label: 'Rencana Produksi' },
    { tab: 'recipe',  label: 'Resep' },
    { tab: 'wastage', label: 'Wastage' },
    { tab: 'sched',   label: 'Jadwal' },
  ]},

  { section: 'Pelanggan & Marketing' },
  { id: 'customers',  label: 'Pelanggan',  icon: 'customers', children: [
    { tab: 'list',         label: 'Daftar Pelanggan' },
    { tab: 'analytics',    label: 'Analytics' },
    { tab: 'loyalty',      label: 'Bagi Hasil' },
    { tab: 'subscription', label: 'Subscription' },
  ]},
  { id: 'promo',      label: 'Promo',      icon: 'reports' },

  { section: 'Pembelian' },
  { id: 'suppliers',  label: 'Supplier',   icon: 'suppliers', children: [
    { tab: 'list',    label: 'Daftar Supplier' },
    { tab: 'po',      label: 'Purchase Order' },
  ]},

  { section: 'Keuangan' },
  { id: 'finance',    label: 'Keuangan',   icon: 'finance', children: [
    { tab: 'cash',    label: 'Arus Kas' },
    { tab: 'acc',     label: 'Akuntansi' },
    { tab: 'rep',     label: 'Laporan' },
  ]},

  { section: 'Tim & Sistem' },
  { id: 'users',      label: 'Tenaga Kerja', icon: 'users' },
  { id: 'settings',   label: 'Pengaturan',   icon: 'settings', children: [
    { tab: 'main',    label: 'Pengaturan' },
    { tab: 'audit',   label: 'Riwayat Aktivitas' },
  ]},
];

export function buildShell({ root, app, router, pages, theme }) {
  // Topbar — minimalis: brand · spacer · theme · bell · user
  const themeBtn = h('button', { class: 'icon-btn', 'aria-label': 'Toggle theme', 'data-action': 'theme:toggle' });
  const bellBtn  = h('button', { class: 'icon-btn', 'aria-label': 'Notifikasi', 'data-action': 'drawer:open' }, Icon.bell());
  const userBtn  = h('button', { class: 'icon-btn', 'aria-label': 'Akun', 'data-action': 'auth:logout', title: 'Keluar' });
  const renderUserAvatar = () => {
    while (userBtn.firstChild) userBtn.firstChild.remove();
    const me = app.services.auth.getCurrentUser();
    if (me?.photo) {
      userBtn.append(h('div', { class: 'topbar-avatar', style: { backgroundImage: `url(${me.photo})` } }));
    } else if (me?.name) {
      userBtn.append(h('div', { class: 'topbar-avatar' }, me.name[0].toUpperCase()));
    } else {
      userBtn.append(Icon.users());
    }
  };

  const topbar = h('header', { class: 'topbar' },
    h('div', { class: 'brand' },
      h('div', { class: 'brand-mark' }, '7R'),
      h('div', { class: 'brand-name' }, 'Tujuh Rasa'),
    ),
    h('div', { class: 'topbar-spacer' }),
    h('div', { class: 'topbar-actions' }, themeBtn, bellBtn, userBtn),
  );

  // Sidebar
  const navEl = h('nav', { class: 'sidebar', 'aria-label': 'Menu utama' });
  function getActiveTab() {
    try {
      const q = (location.hash || '').split('?')[1];
      if (!q) return null;
      return new URLSearchParams(q).get('tab');
    } catch { return null; }
  }
  function renderNav() {
    clear(navEl);
    const u = app.services.auth.getCurrentUser();
    const role = u?.role;
    const activePath = router.current;
    const activeTab = getActiveTab();
    for (const it of NAV) {
      if (it.section) { navEl.append(h('div', { class: 'nav-section' }, it.section)); continue; }
      if (u && !app.services.rbac.can(role, it.id)) continue;
      const isParentActive = activePath === '/' + it.id;
      const item = h('a', {
        class: 'nav-item' + (isParentActive ? ' active' : ''),
        href: '#/' + it.id,
        'data-page': it.id,
      },
        Icon[it.icon] ? Icon[it.icon]() : Icon.dashboard(),
        h('span', null, it.label),
      );
      navEl.append(item);
      // Sub-items hanya ditampilkan jika parent sedang aktif (mengurangi noise).
      if (isParentActive && Array.isArray(it.children) && it.children.length) {
        const subWrap = h('div', { class: 'nav-sub' });
        const firstTab = it.children[0]?.tab;
        for (const ch of it.children) {
          const subActive = (activeTab === ch.tab) || (!activeTab && ch.tab === firstTab);
          subWrap.append(h('a', {
            class: 'nav-sub-item' + (subActive ? ' active' : ''),
            href: '#/' + it.id + '?tab=' + ch.tab,
          }, h('span', { class: 'dot' }), h('span', null, ch.label)));
        }
        navEl.append(subWrap);
      }
    }
  }

  // Main
  const main = h('main', { class: 'main', id: 'main-content' });

  // Drawer notifikasi
  const drawer = buildDrawer(app);
  // Toast stack
  const toastStack = h('div', { class: 'toast-stack' });

  const shell = h('div', { class: 'app-shell' },
    topbar,
    h('div', { class: 'body-wrap' }, navEl, main),
    drawer.backdrop, drawer.el,
    toastStack,
  );

  // Wire events
  shell.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-action]');
    if (!t || !shell.contains(t)) return;
    const a = t.dataset.action;
    if (a === 'drawer:open')    drawer.open();
    if (a === 'drawer:close')   drawer.close();
    if (a === 'theme:toggle')   theme.toggle();
    if (a === 'auth:logout')    { app.services.auth.logout(); location.reload(); }
  });

  // Keyboard shortcuts ringkas: Esc = tutup drawer
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') drawer.close();
  });

  // Toast subscriber
  bus.on('toast', ({ severity = 'info', message }) => {
    const t = h('div', { class: 'toast ' + severity }, h('span', null, message));
    toastStack.append(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; }, 2600);
    setTimeout(() => t.remove(), 3000);
  });
  bus.on('error', ({ userMessage }) => {
    bus.emit('toast', { severity: 'error', message: userMessage });
  });

  // Theme button icon
  const renderThemeIcon = () => {
    clear(themeBtn);
    themeBtn.append(theme.current() === 'dark' ? Icon.sun() : Icon.moon());
  };
  renderThemeIcon();
  theme.onChange(renderThemeIcon);

  // Bell badge
  const renderBellBadge = () => {
    const ns = app.store.getState().notifications || [];
    const unseen = ns.filter(n => !n.dismissed).length;
    bellBtn.querySelector('.dot')?.remove();
    if (unseen > 0) bellBtn.append(h('span', { class: 'dot' }));
  };
  app.store.subscribe(s => s.notifications, () => { renderBellBadge(); drawer.refresh(); });
  renderBellBadge();

  // Re-render nav on route change & login.
  router.onChange(renderNav);
  bus.on('auth:login', renderNav);
  renderNav();
  renderUserAvatar();
  app.store.subscribe(s => s.users, renderUserAvatar);

  // Page render dispatch.
  router.onChange((path) => {
    const id = path.replace(/^\//, '');
    const fn = pages[id] || pages.dashboard;
    clear(main);
    try { main.append(fn(app, router)); }
    catch (e) {
      app.errors.handle(e, { page: id });
      main.append(h('div', { class: 'card card-pad' }, 'Terjadi kesalahan saat memuat halaman: ', String(e.message)));
    }
  });

  mount(root, shell);

  // Scroll-shrink topbar (Apple-style floating pill)
  let lastY = 0;
  const onScroll = () => {
    const y = main.scrollTop || window.scrollY || 0;
    if (y > 12 && !topbar.classList.contains('compact')) topbar.classList.add('compact');
    else if (y <= 4 && topbar.classList.contains('compact')) topbar.classList.remove('compact');
    document.body.classList.toggle('scrolled', y > 12);
    lastY = y;
  };
  main.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  return { shell, main, drawer, renderNav };
}

function buildDrawer(app) {
  const list = h('div', { class: 'drawer-body' });
  const el = h('aside', { class: 'drawer', 'aria-label': 'Notifikasi' },
    h('div', { class: 'drawer-head' },
      h('div', { class: 'col' },
        h('div', { class: 'card-title' }, 'Notifikasi'),
        h('div', { class: 'card-sub' }, 'Insight & reminder otomatis'),
      ),
      h('button', { class: 'icon-btn', 'data-action': 'drawer:close' }, Icon.x()),
    ),
    list,
  );
  const backdrop = h('div', { class: 'drawer-backdrop', 'data-action': 'drawer:close' });

  function refresh() {
    clear(list);
    const ns = (app.store.getState().notifications || []).filter(n => !n.dismissed)
      .sort((a, b) => b.ts.localeCompare(a.ts));
    if (ns.length === 0) {
      list.append(h('div', { class: 'empty' },
        h('div', { class: 'ico' }, '✓'),
        h('div', { class: 'title' }, 'Tidak ada notifikasi'),
        h('div', null, 'Sistem sedang sehat.'),
      ));
      return;
    }
    for (const n of ns) {
      const item = h('div', { class: `notif-item ${n.severity}` },
        h('div', { class: `notif-dot ${n.severity}` }),
        h('div', { class: 'col grow' },
          h('div', { class: 'notif-title' }, n.title),
          h('div', { class: 'notif-detail' }, n.detail),
          h('div', { class: 'notif-time' }, new Date(n.ts).toLocaleString('id-ID')),
        ),
        h('button', { class: 'icon-btn', title: 'Dismiss', onclick: () => app.services.reminderEngine.dismiss(n.id) }, Icon.x()),
      );
      list.append(item);
    }
  }

  return {
    el, backdrop, refresh,
    open()  { document.documentElement.classList.add('drawer-open'); refresh(); },
    close() { document.documentElement.classList.remove('drawer-open'); },
  };
}



