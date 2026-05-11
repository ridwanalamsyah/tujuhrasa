// src/services/reminder.service.js
// Reminder/notification scanner. Periodik memeriksa state untuk:
//   - order pending payment dekat deadline,
//   - stok ingredient/produk di bawah min,
//   - schedule occurrence yang jatuh tempo H-1 / H-0,
//   - PO yang lewat tanggal terima.
// Output → store.notifications + bus event 'reminder:fired'.

import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';
import { ProductCalc } from './product.service.js';

export class ReminderEngine {
  constructor({ store, orderRepo, productRepo, ingredientRepo, scheduleEngine, purchaseRepo }) {
    this.store = store;
    this.orders = orderRepo;
    this.products = productRepo;
    this.ingredients = ingredientRepo;
    this.scheduleEngine = scheduleEngine;
    this.purchases = purchaseRepo;
    this._timer = null;
  }

  start({ intervalMs = 60_000 } = {}) {
    this.scan();
    this._timer = setInterval(() => this.scan(), intervalMs);
  }

  stop() { if (this._timer) clearInterval(this._timer); this._timer = null; }

  scan() {
    const fired = [];
    const now = Date.now();

    // 1. Stok produk-jadi rendah.
    for (const p of this.products.list()) {
      if (ProductCalc.totalStock(p) <= (p.minStk || 0)) {
        fired.push(this._note({
          id: `low-prod-${p.id}`,
          severity: 'warning',
          title: `Stok ${p.name} menipis`,
          detail: `Total stok ${ProductCalc.totalStock(p)} ≤ minimum ${p.minStk}`,
          refType: 'product', refId: p.id,
        }));
      }
    }

    // 2. Stok bahan baku rendah.
    for (const ing of this.ingredients.list()) {
      if ((ing.stok || 0) <= (ing.minStok || 0)) {
        fired.push(this._note({
          id: `low-ing-${ing.id}`,
          severity: 'warning',
          title: `Bahan ${ing.nama} menipis`,
          detail: `Stok ${ing.stok}${ing.satuan} ≤ minimum ${ing.minStok}${ing.satuan}`,
          refType: 'ingredient', refId: ing.id,
        }));
      }
    }

    // 3. Order pending lebih dari 3 hari.
    const THREE_DAYS = 3 * 86400000;
    for (const o of this.orders.list((x) => x.status === 'pending')) {
      const age = now - Date.parse(o.ts);
      if (age >= THREE_DAYS) {
        fired.push(this._note({
          id: `stale-order-${o.id}`,
          severity: 'danger',
          title: `Order ${o.id} pending > 3 hari`,
          detail: `Pembeli: ${o.buyer}`,
          refType: 'order', refId: o.id,
        }));
      }
    }

    // 4. Schedule occurrence H-1/H-0.
    if (this.scheduleEngine) {
      const wStart = new Date(now).toISOString();
      const wEnd   = new Date(now + 2 * 86400000).toISOString();
      for (const occ of this.scheduleEngine.listOccurrences(wStart, wEnd)) {
        const diff = Date.parse(occ.start) - now;
        if (diff <= 86400000) {
          fired.push(this._note({
            id: `sched-${occ.occurrenceOf}-${occ.start}`,
            severity: diff <= 0 ? 'danger' : 'info',
            title: `Jadwal: ${occ.title}`,
            detail: `${occ.type} pada ${new Date(occ.start).toLocaleString('id-ID')}`,
            refType: 'schedule', refId: occ.occurrenceOf,
          }));
        }
      }
    }

    // 5. PO yang sudah dipesan tapi belum diterima > 7 hari.
    if (this.purchases) {
      const SEVEN = 7 * 86400000;
      for (const po of this.purchases.list((p) => p.status === 'dipesan')) {
        const age = now - Date.parse(po.createdAt);
        if (age > SEVEN) {
          fired.push(this._note({
            id: `po-late-${po.id}`,
            severity: 'warning',
            title: `PO ${po.id} belum diterima > 7 hari`,
            detail: `Supplier: ${po.supId}`,
            refType: 'purchase', refId: po.id,
          }));
        }
      }
    }

    this._sync(fired);
    bus.emit('reminder:scanned', { count: fired.length });
    return fired;
  }

  _note(n) {
    return {
      id: n.id, // ID stable agar tidak duplikat antar scan
      title: n.title,
      detail: n.detail,
      severity: n.severity,
      refType: n.refType,
      refId: n.refId,
      ts: new Date().toISOString(),
      dismissed: false,
    };
  }

  _sync(active) {
    this.store.update('notifications.sync', (s) => {
      const existing = s.notifications || [];
      // Pertahankan flag dismissed dari yang sudah ada.
      const merged = active.map((a) => {
        const prev = existing.find((e) => e.id === a.id);
        return prev?.dismissed ? { ...a, dismissed: true } : a;
      });
      // Pertahankan notifikasi non-system (mis. push manual oleh user).
      const manual = existing.filter((e) => !e.id.startsWith('low-') && !e.id.startsWith('stale-') && !e.id.startsWith('sched-') && !e.id.startsWith('po-late-'));
      return { notifications: [...manual, ...merged] };
    });
  }

  dismiss(id) {
    this.store.update('notifications.dismiss', (s) => ({
      notifications: (s.notifications || []).map((n) => n.id === id ? { ...n, dismissed: true } : n),
    }));
  }
}
