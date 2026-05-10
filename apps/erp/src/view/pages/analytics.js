// src/view/pages/analytics.js
// Customer analytics: LTV, RFM segmentation, cohort retention.

import { h, fmt } from '../h.js';
import { Card, KPI, Table, Empty, Badge } from '../components.js';

const SEG_LABEL = {
  champion: '🏆 Champion',
  loyal:    '💎 Loyal',
  new:      '🌱 Baru',
  at_risk:  '⚠️ Berisiko',
  churned:  '😴 Hibernasi',
  casual:   'Casual',
};
const SEG_TONE = {
  champion: 'success',
  loyal:    'success',
  new:      'info',
  at_risk:  'warning',
  churned:  'danger',
  casual:   'neutral',
};

export function analyticsPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    root.innerHTML = '';
    const ca = app.services.customerAnalytics;
    const summary = ca.summary();
    const rfm = ca.rfm();
    const cohorts = ca.cohortRetention();

    root.append(
      h('div', { class: 'col gap-1' },
        h('div', { class: 'page-title' }, 'Customer Analytics'),
        h('div', { class: 'page-sub' }, 'LTV, RFM, dan cohort retention'),
      ),
      h('div', { class: 'kpi-grid' },
        KPI({ label: 'Total Pelanggan', value: summary.totalCustomers }),
        KPI({ label: 'Average LTV', value: fmt.rp(summary.avgLtv), tone: 'positive' }),
        KPI({ label: 'Repeat Rate', value: summary.repeatRate.toFixed(0) + '%', tone: summary.repeatRate >= 30 ? 'positive' : 'warning' }),
        KPI({ label: 'Total Spend', value: fmt.rp(summary.totalSpend) }),
      ),
    );

    if (rfm.length === 0) {
      root.append(Card({ title: 'Belum ada data', body: Empty({ icon: '📊', title: 'Pelanggan belum ada' }) }));
      return;
    }

    // RFM Segmentation table
    const segCount = {};
    for (const c of rfm) segCount[c.segment] = (segCount[c.segment] || 0) + 1;

    root.append(Card({
      title: 'Segmentasi Pelanggan (RFM)',
      sub: 'Recency × Frequency × Monetary',
      body: h('div', { class: 'col gap-3' },
        h('div', { class: 'row gap-2 wrap' }, ...Object.entries(segCount).map(([seg, n]) =>
          Badge(`${SEG_LABEL[seg] || seg}: ${n}`, SEG_TONE[seg] || 'neutral'))),
        Table({
          columns: [
            { key: 'name', label: 'Nama' },
            { key: 'wa', label: 'WA' },
            { key: 'orders', label: 'Order', align: 'right' },
            { key: 'spend', label: 'Total Spend', align: 'right', render: c => h('span', { class: 'num' }, fmt.rp(c.spend)) },
            { key: 'avgOrder', label: 'Avg/Order', align: 'right', render: c => h('span', { class: 'num' }, fmt.rp(c.avgOrder)) },
            { key: 'rfm', label: 'R/F/M', render: c => h('span', { class: 'mono' }, `${c.R}-${c.F}-${c.M}`) },
            { key: 'segment', label: 'Segment', render: c => Badge(SEG_LABEL[c.segment] || c.segment, SEG_TONE[c.segment] || 'neutral') },
          ],
          rows: rfm.slice(0, 50),
        }),
      ),
    }));

    // Cohort retention
    if (cohorts.length) {
      const maxMonth = Math.max(0, ...cohorts.flatMap(c => Object.keys(c.retained).map(Number)));
      root.append(Card({
        title: 'Cohort Retention',
        sub: 'Persentase customer yang masih beli pada bulan ke-N setelah pembelian pertama',
        body: h('div', { style: { overflowX: 'auto' } },
          h('table', { class: 'table-cohort', style: { minWidth: '600px', borderCollapse: 'collapse' } },
            h('thead', null,
              h('tr', null,
                h('th', { style: { textAlign: 'left', padding: '8px' } }, 'Cohort'),
                h('th', { style: { textAlign: 'right', padding: '8px' } }, 'Size'),
                ...Array.from({ length: maxMonth }, (_, i) =>
                  h('th', { style: { textAlign: 'center', padding: '8px', fontSize: '12px' } }, `+${i + 1}`)),
              ),
            ),
            h('tbody', null, ...cohorts.map(c =>
              h('tr', null,
                h('td', { style: { padding: '8px', fontWeight: '600' } }, c.cohort),
                h('td', { style: { padding: '8px', textAlign: 'right' } }, c.size),
                ...Array.from({ length: maxMonth }, (_, i) => {
                  const m = i + 1;
                  const n = c.retained[m] || 0;
                  const pct = c.size > 0 ? Math.round(n / c.size * 100) : 0;
                  const tone = pct >= 50 ? '#10b981' : pct >= 25 ? '#f59e0b' : pct > 0 ? '#94a3b8' : '#e2e8f0';
                  return h('td', {
                    style: {
                      textAlign: 'center', padding: '6px',
                      background: tone, color: pct >= 25 ? '#fff' : '#475569',
                      fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                    },
                  }, n > 0 ? `${pct}%` : '·');
                }),
              ),
            )),
          ),
        ),
      }));
    }
  }

  render();
  app.store.subscribe(s => s.orders, () => render(), (a, b) => a === b);
  return root;
}
