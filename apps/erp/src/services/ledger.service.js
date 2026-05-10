// src/services/ledger.service.js
// Buku Besar (General Ledger) double-entry.
// Mendengarkan event domain → otomatis membuat JournalEntry seimbang.
// Tidak ada controller yang perlu memanggil ledger secara manual.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

/** Standard Chart of Accounts default (kode 4-digit). */
export const DEFAULT_COA = [
  { code: '1100', name: 'Kas',                          kind: 'asset' },
  { code: '1110', name: 'Bank',                         kind: 'asset' },
  { code: '1120', name: 'Piutang Usaha',                kind: 'asset' },
  { code: '1200', name: 'Persediaan Bahan',             kind: 'asset' },
  { code: '1210', name: 'Persediaan Barang Jadi',       kind: 'asset' },
  { code: '1300', name: 'Peralatan',                    kind: 'asset' },
  { code: '2100', name: 'Hutang Usaha',                 kind: 'liability' },
  { code: '2200', name: 'Hutang Pajak',                 kind: 'liability' },
  { code: '3100', name: 'Modal',                        kind: 'equity' },
  { code: '3200', name: 'Laba Ditahan',                 kind: 'equity' },
  { code: '4100', name: 'Pendapatan Penjualan',         kind: 'revenue' },
  { code: '4200', name: 'Diskon Penjualan',             kind: 'revenue' },
  { code: '4300', name: 'Pendapatan Ongkir',            kind: 'revenue' },
  { code: '5100', name: 'HPP — Bahan',                  kind: 'cogs' },
  { code: '6100', name: 'Beban Operasional',            kind: 'expense' },
  { code: '6110', name: 'Beban Gaji',                   kind: 'expense' },
  { code: '6200', name: 'Beban Kerugian Stok',          kind: 'expense' },
  { code: '6300', name: 'Beban Penyesuaian Persediaan', kind: 'expense' },
];

export class LedgerService {
  constructor({ accountRepo, journalRepo, orderRepo, paymentRepo, productRepo }) {
    this.accounts = accountRepo;
    this.journals = journalRepo;
    this.orders   = orderRepo;
    this.payments = paymentRepo;
    this.products = productRepo;
  }

  /** Pasang Chart of Accounts default jika belum ada. */
  ensureDefaultCoA() {
    if (this.accounts.list().length > 0) return;
    for (const a of DEFAULT_COA) {
      this.accounts.create({ id: 'acc-' + a.code, code: a.code, name: a.name, kind: a.kind, archived: false });
    }
  }

  account(code) {
    return this.accounts.list(a => a.code === code)[0];
  }

  /** Validasi & catat journal entry (double-entry). */
  post({ memo = '', source = 'manual', sourceId = '', lines, createdBy = '', date }) {
    if (!Array.isArray(lines) || lines.length < 2) throw new AppError('JOURNAL_INVALID', 'Journal entry minimal 2 baris');
    const sumDr = lines.reduce((s, l) => s + (l.debit || 0), 0);
    const sumCr = lines.reduce((s, l) => s + (l.credit || 0), 0);
    if (Math.abs(sumDr - sumCr) > 0.01) {
      throw new AppError('JOURNAL_UNBALANCED', `Debit (${sumDr}) ≠ Credit (${sumCr})`);
    }
    if (sumDr === 0) throw new AppError('JOURNAL_ZERO', 'Total transaksi 0');

    const entry = this.journals.create({
      id: uid('je'),
      date: date || new Date().toISOString(),
      memo, source, sourceId, lines, createdBy,
      createdAt: new Date().toISOString(),
    });
    bus.emit('ledger:posted', entry);
    return entry;
  }

  /** Membalik (reverse) sebuah jurnal — mis. order dibatalkan. */
  reverse(entryId, { memo = 'Reversal' } = {}) {
    const e = this.journals.requireById(entryId);
    if (e.reversedBy) throw new AppError('ALREADY_REVERSED', 'Sudah dibalik sebelumnya');
    const reversed = this.post({
      memo: `${memo} of ${entryId}`,
      source: 'reversal',
      sourceId: entryId,
      lines: e.lines.map(l => ({ accountId: l.accountId, debit: l.credit, credit: l.debit, memo: l.memo })),
    });
    this.journals.update(entryId, { reversedBy: reversed.id });
    return reversed;
  }

  // ───────────────────────── Auto-posting listeners ────────────────────────
  attachAutoPosting() {
    // Saat pembayaran masuk → Kas (DR) ↔ Piutang (CR) atau Pendapatan (CR).
    bus.on('payments:recorded', (pmt) => this._postPayment(pmt));
    bus.on('payments:refunded', (pmt) => this._postPayment(pmt));

    // Saat order checkout → Piutang (DR) ↔ Pendapatan (CR), serta HPP (DR) ↔ Persediaan (CR).
    bus.on('orders:checkout', ({ orders }) => orders.forEach(o => this._postOrderCheckout(o)));

    // Saat order dibatalkan → balikan jurnal-nya.
    bus.on('orders:cancelled', (o) => this._reverseOrderJournals(o));

    // Saat PO diterima → Persediaan (DR) ↔ Hutang (CR).
    bus.on('purchaseOrders:updated', (po) => {
      if (po.status === 'diterima') this._postPurchase(po);
    });

    // Wastage → Beban kerugian (DR) ↔ Persediaan (CR).
    bus.on('wastages:created', (w) => this._postWastage(w));

    // Revaluasi persediaan saat harga bahan berubah signifikan.
    bus.on('inventory:received', (e) => this._maybePostRevaluation(e));
  }

  _accId(code) { return 'acc-' + code; }

  _postOrderCheckout(o) {
    const due = (o.total || 0) + (o.ongkir || 0);
    if (due <= 0) return;
    // 1) Pendapatan
    this.post({
      memo: `Penjualan ${o.id} — ${o.pname}`,
      source: 'order', sourceId: o.id,
      lines: [
        { accountId: this._accId('1120'), debit: due,            credit: 0,           memo: 'Piutang' },
        { accountId: this._accId('4100'), debit: 0,              credit: o.total || 0, memo: 'Pendapatan' },
        { accountId: this._accId('4300'), debit: 0,              credit: o.ongkir || 0, memo: 'Ongkir' },
      ].filter(l => l.debit > 0 || l.credit > 0),
    });
    // 2) HPP
    const hpp = (o.hpp || 0) * (o.qty || 0);
    if (hpp > 0) {
      this.post({
        memo: `HPP ${o.id}`,
        source: 'order_hpp', sourceId: o.id,
        lines: [
          { accountId: this._accId('5100'), debit: hpp, credit: 0, memo: 'HPP' },
          { accountId: this._accId('1210'), debit: 0,   credit: hpp, memo: 'Persediaan keluar' },
        ],
      });
    }
  }

  _reverseOrderJournals(o) {
    const related = this.journals.list(j => j.sourceId === o.id && !j.reversedBy);
    related.forEach(j => this.reverse(j.id, { memo: 'Order dibatalkan' }));
  }

  _postPayment(pmt) {
    const o = this.orders.findById(pmt.orderId);
    if (!o) return;
    const cashAcc = pmt.method === 'transfer' || pmt.method === 'qris' || pmt.method === 'ewallet'
      ? this._accId('1110') : this._accId('1100');
    this.post({
      memo: `Pembayaran ${pmt.orderId} — ${pmt.method}`,
      source: 'payment', sourceId: pmt.id,
      lines: pmt.amount >= 0
        ? [
            { accountId: cashAcc,           debit: pmt.amount,  credit: 0,           memo: pmt.method },
            { accountId: this._accId('1120'), debit: 0,         credit: pmt.amount,  memo: 'Piutang berkurang' },
          ]
        : [
            { accountId: this._accId('1120'), debit: -pmt.amount, credit: 0,         memo: 'Refund — piutang naik' },
            { accountId: cashAcc,             debit: 0,           credit: -pmt.amount, memo: 'Refund kas keluar' },
          ],
    });
  }

  _postPurchase(po) {
    const items = po.items?.length
      ? po.items
      : [{ ingredientId: '', qty: po.qty || 0, price: po.price || 0 }];
    const total = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
    if (total <= 0) return;
    this.post({
      memo: `Penerimaan PO ${po.id}`,
      source: 'po', sourceId: po.id,
      lines: [
        { accountId: this._accId('1200'), debit: total, credit: 0,     memo: 'Persediaan masuk' },
        { accountId: this._accId('2100'), debit: 0,     credit: total, memo: 'Hutang ke supplier' },
      ],
    });
  }

  _postWastage(w) {
    const cost = w.totalCost || (w.qty * (w.unitCost || 0));
    if (cost <= 0) return;
    const stockAcc = w.refType === 'ingredient' ? this._accId('1200') : this._accId('1210');
    this.post({
      memo: `Wastage ${w.refType} — ${w.reason}`,
      source: 'wastage', sourceId: w.id,
      lines: [
        { accountId: this._accId('6200'), debit: cost, credit: 0,    memo: 'Kerugian' },
        { accountId: stockAcc,            debit: 0,    credit: cost, memo: 'Persediaan keluar' },
      ],
    });
  }

  _maybePostRevaluation({ ingredientId, oldPrice, newPrice }) {
    if (oldPrice === newPrice || !ingredientId) return;
    // Revaluasi diserahkan ke ProductService.syncBBFromRecipes() di app bootstrap;
    // di sini cukup beri sinyal. Implementasi GL revaluasi formal bisa
    // ditambahkan sebagai journal adjustment terpisah bila diinginkan.
    bus.emit('ledger:price_changed', { ingredientId, oldPrice, newPrice });
  }

  // ───────────────────────── Reports ──────────────────────────────────────
  /**
   * Saldo per akun pada rentang [from, to].
   */
  balances({ from, to } = {}) {
    const map = new Map();
    for (const j of this.journals.list()) {
      if (from && j.date < from) continue;
      if (to   && j.date > to)   continue;
      for (const l of j.lines || []) {
        const cur = map.get(l.accountId) || { debit: 0, credit: 0 };
        cur.debit  += l.debit  || 0;
        cur.credit += l.credit || 0;
        map.set(l.accountId, cur);
      }
    }
    return map;
  }

  /** Trial balance: list akun + saldo. */
  trialBalance(opts) {
    const map = this.balances(opts);
    return this.accounts.list().map(a => {
      const b = map.get(a.id) || { debit: 0, credit: 0 };
      const net = a.kind === 'asset' || a.kind === 'expense' || a.kind === 'cogs'
        ? b.debit - b.credit
        : b.credit - b.debit;
      return { ...a, debit: b.debit, credit: b.credit, balance: net };
    });
  }

  profitAndLoss(opts) {
    const tb = this.trialBalance(opts);
    const rev   = tb.filter(a => a.kind === 'revenue').reduce((s, a) => s + a.balance, 0);
    const cogs  = tb.filter(a => a.kind === 'cogs').reduce((s, a) => s + a.balance, 0);
    const exp   = tb.filter(a => a.kind === 'expense').reduce((s, a) => s + a.balance, 0);
    return {
      revenue: rev, cogs, grossProfit: rev - cogs,
      expenses: exp, netProfit: rev - cogs - exp,
      details: tb.filter(a => ['revenue', 'cogs', 'expense'].includes(a.kind)),
    };
  }

  balanceSheet(opts) {
    const tb = this.trialBalance(opts);
    const assets       = tb.filter(a => a.kind === 'asset').reduce((s, a) => s + a.balance, 0);
    const liabilities  = tb.filter(a => a.kind === 'liability').reduce((s, a) => s + a.balance, 0);
    const equity       = tb.filter(a => a.kind === 'equity').reduce((s, a) => s + a.balance, 0);
    const pl = this.profitAndLoss(opts);
    return {
      assets, liabilities,
      equity: equity + pl.netProfit,
      retainedEarnings: pl.netProfit,
      details: tb.filter(a => ['asset', 'liability', 'equity'].includes(a.kind)),
    };
  }

  /**
   * Ledger transactions per akun (Buku Besar).
   */
  accountLedger(accountId, opts = {}) {
    const lines = [];
    let running = 0;
    for (const j of this.journals.list().sort((a, b) => a.date.localeCompare(b.date))) {
      if (opts.from && j.date < opts.from) continue;
      if (opts.to   && j.date > opts.to)   continue;
      for (const l of j.lines || []) {
        if (l.accountId !== accountId) continue;
        running += (l.debit || 0) - (l.credit || 0);
        lines.push({
          date: j.date, jeId: j.id, memo: j.memo, source: j.source,
          debit: l.debit || 0, credit: l.credit || 0, balance: running,
        });
      }
    }
    return lines;
  }
}
