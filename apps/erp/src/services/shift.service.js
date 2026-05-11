// src/services/shift.service.js
// Shift kasir + cash drawer reconcile + handover note.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class ShiftService {
  constructor({ shiftRepo, paymentRepo, orderRepo }) {
    this.repo = shiftRepo;
    this.payments = paymentRepo;
    this.orders = orderRepo;
  }

  open({ cashierId, openingCash = 0 }) {
    if (!cashierId) throw new AppError('NO_CASHIER', 'cashierId wajib');
    const existing = this.repo.list(s => s.cashierId === cashierId && s.status === 'open')[0];
    if (existing) throw new AppError('ALREADY_OPEN', 'Shift sudah terbuka');
    return this.repo.create({
      id: uid('sft'),
      cashierId, openAt: new Date().toISOString(),
      closeAt: '', openingCash, closingCash: 0,
      expected: 0, variance: 0, handoverNote: '',
      status: 'open',
    });
  }

  /**
   * Hitung expected cash drawer = openingCash + sum(payments cash dalam shift).
   */
  expectedCash(shiftId) {
    const sft = this.repo.requireById(shiftId);
    const cashIn = this.payments.list(p => p.shiftId === shiftId && p.method === 'cash')
      .reduce((s, p) => s + (p.amount || 0), 0);
    return (sft.openingCash || 0) + cashIn;
  }

  close({ shiftId, closingCash = 0, handoverNote = '' }) {
    const sft = this.repo.requireById(shiftId);
    if (sft.status !== 'open') throw new AppError('NOT_OPEN', 'Shift bukan open');
    const expected = this.expectedCash(shiftId);
    const variance = closingCash - expected;
    const next = this.repo.update(shiftId, {
      closeAt: new Date().toISOString(),
      closingCash, expected, variance, handoverNote,
      status: 'closed',
    });
    bus.emit('shifts:closed', next);
    return next;
  }

  reconcile(shiftId) {
    const sft = this.repo.requireById(shiftId);
    if (sft.status !== 'closed') throw new AppError('NOT_CLOSED', 'Tutup shift dulu');
    return this.repo.update(shiftId, { status: 'reconciled' });
  }

  currentOf(cashierId) {
    return this.repo.list(s => s.cashierId === cashierId && s.status === 'open')[0];
  }

  /**
   * Ringkasan shift: jumlah cash diterima, expected drawer, jumlah order/payment.
   */
  summary(shiftId) {
    const sft = this.repo.requireById(shiftId);
    const pays = this.payments.list(p => p.shiftId === shiftId);
    const cashIn = pays.filter(p => p.method === 'cash').reduce((s, p) => s + (p.amount || 0), 0);
    const otherIn = pays.filter(p => p.method !== 'cash').reduce((s, p) => s + (p.amount || 0), 0);
    const orderCount = new Set(pays.map(p => p.orderId)).size;
    return {
      cashIn, otherIn, totalPayments: cashIn + otherIn,
      expected: (sft.openingCash || 0) + cashIn,
      orderCount, paymentCount: pays.length,
    };
  }
}
