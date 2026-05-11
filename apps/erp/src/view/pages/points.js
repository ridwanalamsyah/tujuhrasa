// src/view/pages/points.js — bagi hasil + leaderboard.
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Field, Table, Badge, KPI } from '../components.js';
import { bus } from '../../core/eventBus.js';

function rankBadge(i) {
  if (i === 0) return h('span', { class: 'rank-badge gold' }, '1');
  if (i === 1) return h('span', { class: 'rank-badge silver' }, '2');
  if (i === 2) return h('span', { class: 'rank-badge bronze' }, '3');
  return h('span', { class: 'rank-badge' }, String(i + 1));
}

export function pointsPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let period = new Date().toISOString().slice(0, 7); // YYYY-MM

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const board = app.services.points.leaderboard(period);
    const stats = app.services.finance.stats();
    const dist = app.services.points.distribute(stats.profit, period);
    const cfg = app.services.points.config();
    const activities = app.repos.pointsActivities.list(a => a.period === period).slice(-50).reverse();

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Bagi Hasil & Poin'),
        h('div', { class: 'page-sub' }, 'Sistem Effort + Output untuk distribusi keuntungan adil.'),
      ),
      h('div', { class: 'page-actions' },
        Field({ label: '', children: Input({ type: 'month', value: period, onchange: e => { period = e.target.value; render(); } }) }),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Profit Periode', value: fmt.rp(stats.profit), delta: fmt.pct(stats.margin) }),
      KPI({ label: 'Reinvestment', value: fmt.pct((cfg.reinvestmentRate || 0) * 100), delta: 'ditahan untuk modal' }),
      KPI({ label: 'Distributable', value: fmt.rp(dist.distributable) }),
      KPI({ label: 'Total Poin', value: dist.totalPts || 0 }),
    ));

    root.append(Card({
      title: 'Leaderboard',
      sub: `${board.length} kontributor • Periode ${period}`,
      body: board.length === 0
        ? Empty({ icon: '🏆', title: 'Belum ada poin terkumpul', detail: 'Poin otomatis bertambah dari order, customer baru, QC pass, dll.' })
        : Table({
            columns: [
              { key: 'rank', label: '#', render: (_, i) => rankBadge(i) },
              { key: 'name', label: 'Nama', render: r => h('div', { class: 'row gap-2' },
                r.photo ? h('img', { class: 'avatar', src: r.photo }) : h('span', { class: 'avatar' }, (r.name || '?')[0]),
                h('div', { class: 'col' },
                  h('strong', null, r.name),
                  h('span', { class: 'text-xs text-muted' }, r.role),
                ),
              )},
              { key: 'points', label: 'Poin', align: 'right', render: r => h('span', { class: 'num' }, r.points) },
              { key: 'sharePct', label: 'Share %', align: 'right', render: r => {
                const s = dist.shares.find(x => x.userId === r.userId);
                return s ? fmt.pct(s.sharePct * 100) : '—';
              }},
              { key: 'amount', label: 'Bagi Hasil', align: 'right', render: r => {
                const s = dist.shares.find(x => x.userId === r.userId);
                return h('span', { class: 'num', style: { color: 'var(--brand)', fontWeight: 700 } }, s ? fmt.rp(s.amount) : 'Rp 0');
              }},
            ],
            rows: board,
          }),
    }));

    // Manual log
    let manual = { userId: '', kind: 'output', source: 'manual', points: 0, note: '' };
    root.append(Card({
      title: 'Catat Aktivitas (Admin)',
      body: h('form', { class: 'col gap-3', onsubmit: (e) => {
        e.preventDefault();
        try {
          app.services.points.add({ ...manual, points: +manual.points || 0 });
          bus.emit('toast', { severity: 'success', message: 'Poin tercatat.' });
          render();
        } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
      }},
        h('div', { class: 'form-grid' },
          Field({ label: 'User', children: h('select', {
            class: 'input', onchange: e => manual.userId = e.target.value,
          }, [
            h('option', { value: '' }, '— Pilih —'),
            ...app.repos.users.list().map(u => h('option', { value: u.id }, u.name)),
          ])}),
          Field({ label: 'Jenis', children: h('select', {
            class: 'input', onchange: e => manual.kind = e.target.value, value: manual.kind,
          }, [
            h('option', { value: 'effort' }, 'Effort (jam kerja)'),
            h('option', { value: 'output' }, 'Output (KPI)'),
            h('option', { value: 'penalty' }, 'Penalty'),
          ])}),
        ),
        h('div', { class: 'form-grid' },
          Field({ label: 'Poin', children: Input({ type: 'number', oninput: e => manual.points = e.target.value, placeholder: '5' }) }),
          Field({ label: 'Sumber', children: Input({ oninput: e => manual.source = e.target.value, placeholder: 'manual' }) }),
        ),
        Field({ label: 'Catatan', children: Input({ oninput: e => manual.note = e.target.value }) }),
        h('button', { class: 'btn primary', type: 'submit' }, 'Catat Poin'),
      ),
    }));

    root.append(Card({
      title: 'Aktivitas Terbaru',
      body: activities.length === 0 ? Empty() : Table({
        columns: [
          { key: 'ts', label: 'Waktu', render: a => fmt.rel(a.ts) },
          { key: 'userId', label: 'User', render: a => app.repos.users.findById(a.userId)?.name || a.userId },
          { key: 'kind', label: 'Jenis', render: a => Badge(a.kind, a.kind === 'penalty' ? 'danger' : 'info') },
          { key: 'source', label: 'Sumber' },
          { key: 'points', label: 'Poin', align: 'right', render: a => h('span', { class: 'num', style: { color: a.points < 0 ? 'var(--danger)' : '' } }, a.points) },
          { key: 'note', label: 'Catatan' },
        ],
        rows: activities,
      }),
    }));
  }

  render();
  app.store.subscribe(s => [s.pointsActivities, s.users, s.orders], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
  return root;
}
