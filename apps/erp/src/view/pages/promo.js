// src/view/pages/promo.js — promo / voucher engine.
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Table, Badge, KPI, openModal } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';

export function promoPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function openAdd() {
    const f = { code: '', description: '', type: 'percent', value: 0, quota: 0, marketerId: '' };
    const m = openModal({
      title: 'Buat Kode Promo',
      body: h('div', { class: 'col gap-3' },
        Input({ placeholder: 'KODE (uppercase)', oninput: e => f.code = e.target.value.toUpperCase() }),
        Input({ placeholder: 'Deskripsi', oninput: e => f.description = e.target.value }),
        h('div', { class: 'form-grid' },
          h('select', { class: 'input', onchange: e => f.type = e.target.value }, [
            h('option', { value: 'percent' }, 'Persen (%)'),
            h('option', { value: 'amount' }, 'Nominal (Rp)'),
          ]),
          Input({ type: 'number', placeholder: 'Nilai', min: 0, oninput: e => f.value = e.target.value }),
        ),
        Input({ type: 'number', placeholder: 'Kuota (0 = unlimited)', min: 0, oninput: e => f.quota = e.target.value }),
        h('select', { class: 'input', onchange: e => f.marketerId = e.target.value }, [
          h('option', { value: '' }, '— Marketer (poin reward) —'),
          ...app.repos.users.list().map(u => h('option', { value: u.id }, u.name)),
        ]),
      ),
      footer: [
        h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Batal'),
        h('button', { class: 'btn primary', onclick: () => {
          try {
            app.services.promo.create({
              code: f.code, description: f.description,
              type: f.type, value: +f.value || 0, quota: +f.quota || 0,
              marketerId: f.marketerId,
            });
            bus.emit('toast', { severity: 'success', message: 'Promo dibuat.' });
            m.close();
          } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
        } }, 'Simpan'),
      ],
    });
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const promos = app.repos.promos.list().slice().reverse();
    const active = promos.filter(p => p.active).length;

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Promo & Voucher'),
        h('div', { class: 'page-sub' }, `${promos.length} promo`),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn primary', onclick: openAdd }, Icon.plus(), 'Buat Promo'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total Promo', value: promos.length }),
      KPI({ label: 'Aktif', value: active }),
      KPI({ label: 'Redeem', value: promos.reduce((s, p) => s + (p.used || 0), 0) }),
    ));

    root.append(Card({
      body: promos.length === 0 ? Empty({ icon: '🎟️', title: 'Belum ada promo' }) : Table({
        columns: [
          { key: 'code', label: 'Kode', render: p => h('strong', null, p.code) },
          { key: 'description', label: 'Deskripsi' },
          { key: 'type', label: 'Tipe', render: p => Badge(p.type, 'info') },
          { key: 'value', label: 'Nilai', render: p => p.type === 'percent' ? `${p.value}%` : fmt.rp(p.value) },
          { key: 'used', label: 'Redeem', render: p => `${p.used || 0}${p.quota ? ` / ${p.quota}` : ''}` },
          { key: 'marketerId', label: 'Marketer', render: p => app.repos.users.findById(p.marketerId)?.name || '—' },
          { key: 'active', label: 'Status', render: p => Badge(p.active ? 'Aktif' : 'Nonaktif', p.active ? 'success' : 'default') },
        ],
        rows: promos,
      }),
    }));
  }

  render();
  app.store.subscribe(s => [s.promos], () => render(), (a, b) => a[0] === b[0]);
  return root;
}
