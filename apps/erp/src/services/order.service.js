// src/services/order.service.js
// Order lifecycle. Pure logic; tanpa DOM/inline handler.
// Status flow: pending → partial → paid → packing → shipped.
// 'partial' & 'paid' diturunkan otomatis dari `PaymentService`, bukan field DP.

import { AppError } from '../core/errorHandler.js';
import { uid, shortCode } from '../core/id.js';
import { bus } from '../core/eventBus.js';
import { ProductCalc } from './product.service.js';

const FLOW_AFTER_PAID = ['paid', 'packing', 'shipped'];

export class OrderService {
  constructor({ orderRepo, productRepo, customerRepo, inventory, paymentRepo, store }) {
    this.orders = orderRepo;
    this.products = productRepo;
    this.customers = customerRepo;
    this.inventory = inventory;
    this.payments = paymentRepo;
    this.store = store;
  }

  /**
   * Checkout dari kart POS.
   *
   * cart      : [{ productId, qty }]
   * buyer     : { name, wa, city }
   * payment   : { discPct, shipping, paid?, method?, promoCode?, marketerId? }
   *             - paid: jumlah yang langsung diterima saat checkout (0 = belum bayar)
   *             - method: metode pembayaran untuk paid awal tsb (default 'cash')
   * meta      : { cashierId, shiftId, batch }
   *
   * Mengembalikan { orders, payment }.
   */
  checkout({ cart, buyer, payment = {}, meta = {} }) {
    if (!cart || cart.length === 0) throw new AppError('EMPTY_CART', 'Keranjang kosong');
    if (!buyer?.name || buyer.name.trim().length < 2) throw new AppError('INVALID_BUYER', 'Nama pembeli minimal 2 karakter');

    const subtotal = cart.reduce((s, it) => {
      const p = this.products.requireById(it.productId);
      return s + p.sell * it.qty;
    }, 0);
    const discPct = payment.discPct || 0;
    const ship    = payment.shipping || 0;
    const paid    = Math.max(0, payment.paid || 0);

    const created = [];
    const seq = (this.store.getState().orders || []).length;
    const perItemShip = cart.length > 0 ? Math.round(ship / cart.length) : 0;

    cart.forEach((item, idx) => {
      const p = this.products.requireById(item.productId);
      const lineTotal = p.sell * item.qty;
      this.inventory.consume({ productId: p.id, qty: item.qty });

      const order = {
        id: shortCode('ORD', seq + idx + 1, 4),
        buyer: buyer.name.trim(),
        wa: buyer.wa || '',
        city: buyer.city || '',
        pid: p.id,
        pname: p.name,
        qty: item.qty,
        sell: p.sell,
        total: Math.max(0, lineTotal - Math.round(lineTotal * discPct / 100)),
        disc: discPct,
        ongkir: idx === 0 ? perItemShip * cart.length : 0,
        status: 'pending',
        batch: meta.batch || '',
        promoCode: payment.promoCode || '',
        marketerId: payment.marketerId || '',
        cashierId: meta.cashierId || '',
        shiftId: meta.shiftId || '',
        ts: new Date().toISOString(),
        hpp: ProductCalc.hpp(p),
      };
      created.push(this.orders.create(order));
    });

    this._upsertCustomerSummary(buyer, created);
    bus.emit('orders:checkout', { orders: created, buyer, payment, meta });

    let initialPayments = [];
    if (paid > 0 && this.payments) {
      // Distribusikan paid ke order pertama (pelunasan order #1 dulu, lalu sisa ke #2 dst.)
      initialPayments = this._distributePayment(created, paid, payment.method || 'cash', meta);
    } else {
      // Tetap `pending` — user bisa bayar nanti via PaymentService.
    }

    return { orders: created, payments: initialPayments };
  }

  _distributePayment(orders, amount, method, meta) {
    const payments = [];
    let remaining = amount;
    for (const o of orders) {
      if (remaining <= 0) break;
      const due = (o.total || 0) + (o.ongkir || 0);
      const pay = Math.min(remaining, due);
      const pmt = this.payments.create({
        id: uid('pay'),
        orderId: o.id,
        amount: pay,
        method,
        ref: '',
        receivedBy: meta.cashierId || '',
        shiftId: meta.shiftId || '',
        ts: new Date().toISOString(),
        note: 'Pembayaran saat checkout',
      });
      payments.push(pmt);
      bus.emit('payments:recorded', pmt);   // ledger / points hooks
      this._refreshOrderStatus(o.id);
      remaining -= pay;
    }
    return payments;
  }

  /**
   * Hitung total pembayaran untuk satu order & sesuaikan status.
   */
  _refreshOrderStatus(orderId) {
    const o = this.orders.requireById(orderId);
    if (o.status === 'cancel' || ['packing', 'shipped'].includes(o.status)) return o;
    const due = (o.total || 0) + (o.ongkir || 0);
    const paid = (this.payments?.list(p => p.orderId === orderId) || [])
      .reduce((s, p) => s + (p.amount || 0), 0);
    let next = o.status;
    if (paid <= 0) next = 'pending';
    else if (paid < due) next = 'partial';
    else next = 'paid';
    if (next !== o.status) this.orders.update(o.id, { status: next });
    return this.orders.requireById(orderId);
  }

  advance(id) {
    const o = this.orders.requireById(id);
    if (o.status === 'cancel') throw new AppError('ORDER_CANCELLED', 'Order sudah dibatalkan');
    if (['pending', 'partial'].includes(o.status)) {
      throw new AppError('ORDER_UNPAID', 'Order belum lunas — catat pembayaran dulu');
    }
    const i = FLOW_AFTER_PAID.indexOf(o.status);
    if (i < 0 || i >= FLOW_AFTER_PAID.length - 1) {
      throw new AppError('NO_NEXT_STATUS', 'Sudah pada status akhir');
    }
    return this.orders.update(id, { status: FLOW_AFTER_PAID[i + 1] });
  }

  cancel(id, { restock = true } = {}) {
    const o = this.orders.requireById(id);
    if (o.status === 'cancel') return o;
    if (restock) this.inventory.restore({ productId: o.pid, qty: o.qty });
    bus.emit('orders:cancelled', o);
    return this.orders.update(id, { status: 'cancel' });
  }

  /**
   * Total tagihan untuk satu order: total + ongkir.
   */
  due(orderId) {
    const o = this.orders.requireById(orderId);
    return (o.total || 0) + (o.ongkir || 0);
  }

  paidAmount(orderId) {
    return (this.payments?.list(p => p.orderId === orderId) || [])
      .reduce((s, p) => s + (p.amount || 0), 0);
  }

  outstanding(orderId) {
    return Math.max(0, this.due(orderId) - this.paidAmount(orderId));
  }

  _upsertCustomerSummary(buyer, orders) {
    if (!buyer?.wa) return;
    const existing = this.customers.list().find(c => c.wa === buyer.wa);
    const totalSpend = orders.reduce((s, o) => s + (o.total || 0) + (o.ongkir || 0), 0);
    if (existing) {
      this.customers.update(existing.id, {
        orders: (existing.orders || 0) + orders.length,
        totalSpend: (existing.totalSpend || 0) + totalSpend,
        city: buyer.city || existing.city,
      });
    } else {
      this.customers.create({
        id: uid('cust'),
        name: buyer.name,
        wa: buyer.wa,
        city: buyer.city || '',
        email: '',
        note: '',
        orders: orders.length,
        totalSpend,
        createdAt: new Date().toISOString(),
      });
      bus.emit('customers:new', { wa: buyer.wa, name: buyer.name });
    }
  }
}
