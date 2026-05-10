// src/view/pages/shifts.js — shift kasir + cash reconcile.
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Field, Table, Badge, KPI, StatusBadge } from '../components.js';
import { bus } from '../../core/eventBus.js';

export function shiftsPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const me = app.services.auth.getCurrentUser();
    const all = app.repos.shifts.list().slice().reverse();
    const myOpen = all.find(s => s.cashierId === me.id && s.status === 'open');

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Shift Kasir & Cash Reconcile'),
        h('div', { class: 'page-sub' }, 'Buka & tutup shift, hitung selisih kas drawer.'),
      ),
    ));

    if (myOpen) {
      const summary = app.services.shift.summary(myOpen.id);
      let closingCash = 0; let note = '';
      root.append(Card({
        title: 'Shift Saya — Aktif',
        sub: `Dibuka ${fmt.rel(myOpen.openAt)} • Modal awal ${fmt.rp(myOpen.openingCash)}`,
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'kpi-grid' },
            KPI({ label: 'Modal Awal', value: fmt.rp(myOpen.openingCash) }),
            KPI({ label: 'Pembayaran Cash', value: fmt.rp(summary.cashIn) }),
            KPI({ label: 'Expected', value: fmt.rp(summary.expected), delta: 'modal + cash terima' }),
            KPI({ label: 'Total Order', value: summary.orderCount }),
          ),
          h('h4', { style: { marginTop: '8px' } }, 'Tutup Shift'),
          h('div', { class: 'form-grid' },
            Field({ label: 'Cash Drawer Akhir', children: Input({ type: 'number', oninput: e => closingCash = +e.target.value || 0 }) }),
            Field({ label: 'Catatan / Handover', children: Input({ oninput: e => note = e.target.value, placeholder: 'Opsional' }) }),
          ),
          h('button', { class: 'btn primary', onclick: () => {
            try {
              const r = app.services.shift.close({ shiftId: myOpen.id, closingCash, handoverNote: note });
              bus.emit('toast', {
                severity: r.variance === 0 ? 'success' : 'warning',
                message: `Shift ditutup. Selisih: ${fmt.rp(r.variance)}`
              });
              render();
            } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
          } }, 'Tutup Shift'),
        ),
      }));
    } else {
      let opening = 0;
      root.append(Card({
        title: 'Belum ada shift terbuka',
        body: h('div', { class: 'col gap-3' },
          Field({ label: 'Modal Awal Cash Drawer', children: Input({ type: 'number', oninput: e => opening = +e.target.value || 0 }) }),
          h('button', { class: 'btn primary', onclick: () => {
            try {
              app.services.shift.open({ cashierId: me.id, openingCash: opening });
              bus.emit('toast', { severity: 'success', message: 'Shift dibuka.' });
              render();
            } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
          } }, 'Buka Shift'),
        ),
      }));
    }

    root.append(Card({
      title: 'Riwayat Shift',
      body: all.length === 0 ? Empty({ icon: '⏱️', title: 'Belum ada shift' }) : Table({
        columns: [
          { key: 'cashierId', label: 'Kasir', render: s => app.repos.users.findById(s.cashierId)?.name || s.cashierId },
          { key: 'openAt',    label: 'Buka', render: s => fmt.rel(s.openAt) },
          { key: 'closeAt',   label: 'Tutup', render: s => s.closeAt ? fmt.rel(s.closeAt) : '—' },
          { key: 'openingCash', label: 'Modal', align: 'right', render: s => h('span', { class: 'num' }, fmt.rp(s.openingCash)) },
          { key: 'expected',  label: 'Expected', align: 'right', render: s => h('span', { class: 'num' }, fmt.rp(s.expected || 0)) },
          { key: 'closingCash', label: 'Closing', align: 'right', render: s => h('span', { class: 'num' }, fmt.rp(s.closingCash || 0)) },
          { key: 'variance',  label: 'Variance', align: 'right', render: s => {
            const v = s.variance || 0;
            return h('span', { class: 'num', style: { color: v < 0 ? 'var(--danger)' : v > 0 ? 'var(--success)' : '' } }, fmt.rp(v));
          }},
          { key: 'status', label: 'Status', render: s => StatusBadge(s.status) },
          { key: 'handoverNote', label: 'Handover' },
        ],
        rows: all,
      }),
    }));
  }

  render();
  app.store.subscribe(s => [s.shifts, s.payments], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1]);
  return root;
}
