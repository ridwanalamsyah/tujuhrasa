// src/services/subscription.service.js
// Subscription / membership recurring orders.
// Setiap subscription auto-generate order pada tanggal jatuh tempo.

import { bus } from '../core/eventBus.js';

export class SubscriptionService {
  constructor({ store, orderRepo, productRepo, customerRepo }) {
    this.store    = store;
    this.orders   = orderRepo;
    this.products = productRepo;
    this.customers= customerRepo;
  }

  list() {
    const s = this.store.getState();
    return s.subscriptions || [];
  }

  /** Buat subscription baru. */
  create({ customerName, wa, productId, qty, frequency = 'weekly', startDate, marketerId = '' }) {
    const product = this.products.findById(productId);
    if (!product) throw new Error('Produk tidak ditemukan');
    if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) {
      throw new Error('Frekuensi harus weekly/biweekly/monthly');
    }
    const id = 'SUB-' + Date.now().toString(36).toUpperCase();
    const sub = {
      id,
      customerName, wa,
      productId, productName: product.name,
      qty: Number(qty) || 1,
      sell: product.sell,
      frequency,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      nextDueDate: startDate || new Date().toISOString().slice(0, 10),
      marketerId,
      active: true,
      createdAt: new Date().toISOString(),
      orderHistory: [],
    };
    this.store.update('subscription.create', (st) => ({
      ...st, subscriptions: [...(st.subscriptions || []), sub],
    }));
    bus.emit('subscription:created', { subscription: sub });
    return sub;
  }

  pause(id) {
    this.store.update('subscription.pause', (st) => ({
      ...st,
      subscriptions: (st.subscriptions || []).map(s =>
        s.id === id ? { ...s, active: false } : s
      ),
    }));
  }
  resume(id) {
    this.store.update('subscription.resume', (st) => ({
      ...st,
      subscriptions: (st.subscriptions || []).map(s =>
        s.id === id ? { ...s, active: true } : s
      ),
    }));
  }
  delete(id) {
    this.store.update('subscription.delete', (st) => ({
      ...st,
      subscriptions: (st.subscriptions || []).filter(s => s.id !== id),
    }));
  }

  _addInterval(dateStr, freq) {
    const d = new Date(dateStr);
    if (freq === 'weekly')   d.setDate(d.getDate() + 7);
    else if (freq === 'biweekly') d.setDate(d.getDate() + 14);
    else if (freq === 'monthly')  d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 10);
  }

  /** Eksekusi subscriptions yang due hari ini → buat Order pending. */
  runDueToday({ today = new Date() } = {}) {
    const todayStr = today.toISOString().slice(0, 10);
    const created = [];
    const subs = this.list().filter(s => s.active && s.nextDueDate <= todayStr);
    for (const sub of subs) {
      const product = this.products.findById(sub.productId);
      if (!product) continue;
      const total = (product.sell || sub.sell) * sub.qty;
      const orderId = 'O-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 100);
      const order = {
        id: orderId,
        buyer: sub.customerName,
        wa: sub.wa,
        city: '',
        pid: product.id,
        pname: product.name,
        qty: sub.qty,
        sell: product.sell,
        total,
        disc: 0,
        ongkir: 0,
        status: 'pending',
        marketerId: sub.marketerId || '',
        ts: today.toISOString(),
        hpp: 0,
        promoCode: '',
      };
      this.orders.create(order);
      created.push(order);
      const nextDue = this._addInterval(sub.nextDueDate, sub.frequency);
      this.store.update('subscription.advance', (st) => ({
        ...st,
        subscriptions: (st.subscriptions || []).map(s =>
          s.id === sub.id
            ? { ...s, nextDueDate: nextDue, orderHistory: [...(s.orderHistory || []), orderId] }
            : s
        ),
      }));
      bus.emit('subscription:order_created', { subscriptionId: sub.id, orderId });
    }
    return created;
  }
}
