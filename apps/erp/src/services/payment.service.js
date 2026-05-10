// src/services/payment.service.js
// Pembayaran sebagai entitas first-class. Satu order bisa punya banyak Payment
// (cicilan, parsial). Status order disinkronkan otomatis.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class PaymentService {
  constructor({ paymentRepo, orderRepo, orderSvc }) {
    this.repo = paymentRepo;
    this.orders = orderRepo;
    this.orderSvc = orderSvc;
  }

  /**
   * Catat pembayaran untuk satu order. Status order otomatis menjadi
   * 'partial' / 'paid'. Return Payment yang baru dibuat.
   */
  record({ orderId, amount, method = 'cash', ref = '', receivedBy = '', shiftId = '', note = '' }) {
    const o = this.orders.requireById(orderId);
    if (o.status === 'cancel') throw new AppError('ORDER_CANCELLED', 'Order sudah dibatalkan');
    if (!Number.isFinite(amount) || amount <= 0) throw new AppError('INVALID_AMOUNT', 'Jumlah pembayaran > 0');

    const due  = (o.total || 0) + (o.ongkir || 0);
    const paid = this.totalPaid(orderId);
    const outstanding = Math.max(0, due - paid);
    if (amount > outstanding) {
      throw new AppError('OVERPAYMENT', `Lebih bayar — sisa tagihan hanya Rp ${outstanding.toLocaleString('id-ID')}`);
    }

    const pmt = this.repo.create({
      id: uid('pay'),
      orderId, amount, method, ref, receivedBy, shiftId,
      ts: new Date().toISOString(), note,
    });
    this.orderSvc._refreshOrderStatus(orderId);
    bus.emit('payments:recorded', pmt);
    return pmt;
  }

  /**
   * Refund — buat Payment dengan amount negatif (pencatatan ke GL akan
   * otomatis membalik debit/credit lewat listener LedgerService).
   */
  refund({ orderId, amount, reason = '' }) {
    const o = this.orders.requireById(orderId);
    if (!Number.isFinite(amount) || amount <= 0) throw new AppError('INVALID_AMOUNT', 'Jumlah refund > 0');
    const paid = this.totalPaid(orderId);
    if (amount > paid) throw new AppError('REFUND_EXCEEDS_PAID', 'Refund melebihi yang sudah dibayar');
    const pmt = this.repo.create({
      id: uid('rfd'),
      orderId, amount: -amount, method: 'refund', ref: '',
      receivedBy: '', shiftId: '',
      ts: new Date().toISOString(), note: reason || 'refund',
    });
    this.orderSvc._refreshOrderStatus(orderId);
    bus.emit('payments:refunded', pmt);
    return pmt;
  }

  totalPaid(orderId) {
    return this.repo.list(p => p.orderId === orderId).reduce((s, p) => s + (p.amount || 0), 0);
  }

  list(filter) { return this.repo.list(filter); }

  /**
   * Ringkasan pembayaran per metode untuk rentang waktu.
   */
  byMethod({ from, to } = {}) {
    const out = {};
    for (const p of this.repo.list()) {
      if (from && p.ts < from) continue;
      if (to   && p.ts > to)   continue;
      out[p.method] = (out[p.method] || 0) + p.amount;
    }
    return out;
  }
}
