// src/view/pages/_composite.js
// Wrapper untuk menggabungkan beberapa halaman menjadi 1 halaman dengan tab pills.
// Tab awal bisa dipilih lewat query string `?tab=<id>` di hash URL,
// mis. `#/orders?tab=invoice` → langsung membuka tab Invoice.

import { h } from '../h.js';

function readActiveTabFromHash() {
  try {
    const hash = location.hash || '';
    const q = hash.split('?')[1];
    if (!q) return null;
    const params = new URLSearchParams(q);
    return params.get('tab');
  } catch { return null; }
}

export function compose(cfg) {
  return function (app) {
    const root = h('div', { class: 'col gap-4 composite-page' });
    const initial = readActiveTabFromHash();
    let active = (initial && cfg.tabs.find(t => t.id === initial))
      ? initial : cfg.tabs[0].id;

    function setHashTab(tabId) {
      try {
        const [base] = (location.hash || '').split('?');
        const next = base + (tabId ? `?tab=${tabId}` : '');
        if (location.hash !== next) {
          history.replaceState(null, '', next);
        }
      } catch {}
    }

    function render() {
      while (root.firstChild) root.firstChild.remove();

      // Header kompak — quick actions di kanan jika ada.
      const headerRight = h('div', { class: 'row gap-2' });
      if (cfg.actions) {
        for (const act of cfg.actions) {
          headerRight.append(h('button', {
            class: 'btn ' + (act.variant || 'primary') + ' sm',
            onclick: () => act.onClick(app, { setActive }),
          }, act.label));
        }
      }
      root.append(h('div', { class: 'page-header' },
        h('div', null,
          h('div', { class: 'page-title' }, cfg.title),
          cfg.subtitle ? h('div', { class: 'page-sub' }, cfg.subtitle) : null,
        ),
        headerRight,
      ));

      root.append(h('div', { class: 'tabs-pill' },
        ...cfg.tabs.map(t => h('button', {
          class: active === t.id ? 'active' : '',
          onclick: () => setActive(t.id),
        }, t.label))
      ));

      const tab = cfg.tabs.find(t => t.id === active) || cfg.tabs[0];
      let content;
      try { content = tab.build(app); }
      catch (e) {
        content = h('div', { class: 'card' },
          h('div', { class: 'card-body text-muted' }, 'Modul tidak tersedia.'));
        console.warn('[compose]', tab.id, e);
      }

      // Tandai inner page-header agar di-hide via CSS (lebih aman daripada remove)
      try {
        content.querySelectorAll?.('.page-header').forEach(n => n.classList.add('is-nested'));
      } catch {}

      root.append(content);
    }

    function setActive(id) {
      active = id;
      setHashTab(id);
      render();
    }

    render();
    return root;
  };
}
