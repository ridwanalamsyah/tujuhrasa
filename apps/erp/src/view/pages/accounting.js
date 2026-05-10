// src/view/pages/accounting.js — Akuntansi double-entry: GL, Trial Balance, P&L, Balance Sheet.
import { h, fmt } from '../h.js';
import { Card, Empty, Table, Badge, KPI } from '../components.js';

export function accountingPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let tab = 'trial';
  let selectedAcc = '';

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const accs = app.repos.accounts.list();
    const journals = app.repos.journals.list().slice().reverse();
    const tb = app.services.ledger.trialBalance();
    const pl = app.services.ledger.profitAndLoss();
    const bs = app.services.ledger.balanceSheet();

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Akuntansi (GL)'),
        h('div', { class: 'page-sub' }, 'Buku besar double-entry — auto-posted dari order, payment, PO, wastage.'),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn primary', onclick: () => app.services.pdf.printFinancialReport() }, '🖨️ Cetak Laporan'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Akun', value: accs.length }),
      KPI({ label: 'Journal Entries', value: journals.length }),
      KPI({ label: 'Net Profit', value: fmt.rp(pl.netProfit), deltaDir: pl.netProfit >= 0 ? 'up' : 'down' }),
      KPI({ label: 'Aset Total', value: fmt.rp(bs.assets) }),
    ));

    // Tabs
    const tabs = h('div', { class: 'row gap-2' },
      ...['trial','pl','bs','jurnal','gl'].map(t => h('button', {
        class: 'btn ' + (tab === t ? 'primary' : 'ghost'),
        onclick: () => { tab = t; render(); },
      }, ({ trial:'Trial Balance', pl:'Laba/Rugi', bs:'Neraca', jurnal:'Jurnal', gl:'Buku Besar' })[t])),
    );
    root.append(Card({ body: tabs }));

    if (tab === 'trial') {
      root.append(Card({
        title: 'Trial Balance',
        body: Table({
          columns: [
            { key: 'code', label: 'Kode' },
            { key: 'name', label: 'Akun' },
            { key: 'kind', label: 'Tipe', render: a => Badge(a.kind, 'info') },
            { key: 'debit',  label: 'Debit',  align: 'right', render: a => h('span', { class: 'num' }, fmt.rp(a.debit)) },
            { key: 'credit', label: 'Kredit', align: 'right', render: a => h('span', { class: 'num' }, fmt.rp(a.credit)) },
            { key: 'balance', label: 'Saldo', align: 'right', render: a => h('span', { class: 'num', style: { fontWeight: 600 } }, fmt.rp(a.balance)) },
          ],
          rows: tb,
        }),
      }));
    } else if (tab === 'pl') {
      root.append(Card({
        title: 'Laba / Rugi',
        body: h('div', { class: 'col gap-2' },
          rowKv('Pendapatan', fmt.rp(pl.revenue), 'success'),
          rowKv('HPP', fmt.rp(pl.cogs), 'warning'),
          rowKv('Laba Kotor', fmt.rp(pl.grossProfit), 'info'),
          rowKv('Beban Operasi', fmt.rp(pl.expenses), 'warning'),
          h('div', { class: 'divider' }),
          rowKv('Laba Bersih', fmt.rp(pl.netProfit), pl.netProfit >= 0 ? 'success' : 'danger'),
          h('h4', { style: { marginTop: '12px' } }, 'Detail'),
          Table({
            columns: [
              { key: 'name', label: 'Akun' },
              { key: 'kind', label: 'Tipe', render: a => Badge(a.kind, 'info') },
              { key: 'balance', label: 'Saldo', align: 'right', render: a => h('span', { class: 'num' }, fmt.rp(a.balance)) },
            ],
            rows: pl.details,
          }),
        ),
      }));
    } else if (tab === 'bs') {
      root.append(Card({
        title: 'Neraca',
        body: h('div', { class: 'col gap-2' },
          rowKv('Aset', fmt.rp(bs.assets), 'info'),
          rowKv('Kewajiban', fmt.rp(bs.liabilities), 'warning'),
          rowKv('Modal', fmt.rp(bs.equity), 'success'),
          rowKv('Laba Ditahan', fmt.rp(bs.retainedEarnings), 'info'),
          h('h4', { style: { marginTop: '12px' } }, 'Detail'),
          Table({
            columns: [
              { key: 'code', label: 'Kode' },
              { key: 'name', label: 'Akun' },
              { key: 'kind', label: 'Tipe' },
              { key: 'balance', label: 'Saldo', align: 'right', render: a => h('span', { class: 'num' }, fmt.rp(a.balance)) },
            ],
            rows: bs.details,
          }),
        ),
      }));
    } else if (tab === 'jurnal') {
      root.append(Card({
        title: 'Journal Entries (' + journals.length + ')',
        body: journals.length === 0 ? Empty({ icon: '📓', title: 'Belum ada journal entry' }) : h('div', { class: 'col gap-2' },
          ...journals.slice(0, 50).map(j => h('div', { class: 'card', style: { padding: '12px' } },
            h('div', { class: 'row between' },
              h('div', null,
                h('strong', null, j.id),
                ' • ',
                h('span', { class: 'text-sm text-muted' }, fmt.rel(j.date)),
                ' • ',
                Badge(j.source || 'manual', 'info'),
              ),
              h('span', { class: 'text-sm text-muted' }, j.memo || ''),
            ),
            Table({
              columns: [
                { key: 'accountId', label: 'Akun', render: l => {
                  const a = app.repos.accounts.findById(l.accountId);
                  return a ? `${a.code} - ${a.name}` : l.accountId;
                }},
                { key: 'debit', label: 'Debit', align: 'right', render: l => h('span', { class: 'num' }, l.debit ? fmt.rp(l.debit) : '') },
                { key: 'credit', label: 'Kredit', align: 'right', render: l => h('span', { class: 'num' }, l.credit ? fmt.rp(l.credit) : '') },
              ],
              rows: j.lines || [],
            }),
          )),
        ),
      }));
    } else if (tab === 'gl') {
      if (!selectedAcc && accs.length) selectedAcc = accs[0].id;
      root.append(Card({
        body: h('select', {
          class: 'input', value: selectedAcc, onchange: e => { selectedAcc = e.target.value; render(); },
        }, accs.map(a => h('option', { value: a.id }, `${a.code} - ${a.name}`))),
      }));
      const ledger = selectedAcc ? app.services.ledger.accountLedger(selectedAcc) : [];
      root.append(Card({
        title: 'Buku Besar',
        body: ledger.length === 0 ? Empty() : Table({
          columns: [
            { key: 'date', label: 'Tanggal', render: l => fmt.rel(l.date) },
            { key: 'jeId', label: 'JE' },
            { key: 'memo', label: 'Memo' },
            { key: 'source', label: 'Sumber', render: l => Badge(l.source, 'info') },
            { key: 'debit', label: 'Debit', align: 'right', render: l => h('span', { class: 'num' }, l.debit ? fmt.rp(l.debit) : '') },
            { key: 'credit', label: 'Kredit', align: 'right', render: l => h('span', { class: 'num' }, l.credit ? fmt.rp(l.credit) : '') },
            { key: 'balance', label: 'Saldo', align: 'right', render: l => h('span', { class: 'num', style: { fontWeight: 600 } }, fmt.rp(l.balance)) },
          ],
          rows: ledger,
        }),
      }));
    }
  }

  function rowKv(label, val, kind = 'info') {
    return h('div', { class: 'row between', style: { padding: '8px 12px', borderRadius: '8px', background: 'var(--' + kind + '-soft)' } },
      h('strong', null, label),
      h('span', { class: 'num', style: { fontWeight: 700 } }, val),
    );
  }

  render();
  app.store.subscribe(s => [s.journals, s.accounts], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1]);
  return root;
}
