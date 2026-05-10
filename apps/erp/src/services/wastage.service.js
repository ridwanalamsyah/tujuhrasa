// src/services/wastage.service.js
// Pencatatan kerugian stok (wastage) — bahan basi/tumpah/kemasan rusak/produk
// kadaluarsa. Auto-deduct dari inventory & emit event ke ledger untuk jurnal.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class WastageService {
  constructor({ wastageRepo, ingredientRepo, productRepo }) {
    this.repo = wastageRepo;
    this.ingredients = ingredientRepo;
    this.products = productRepo;
  }

  record({ refType, refId, qty, reason, note = '', reportedBy = '' }) {
    if (!['ingredient', 'product'].includes(refType)) {
      throw new AppError('INVALID_REF_TYPE', 'refType harus ingredient/product');
    }
    if (!Number.isFinite(qty) || qty <= 0) throw new AppError('INVALID_QTY', 'Qty > 0');

    let unitCost = 0;
    if (refType === 'ingredient') {
      const ing = this.ingredients.requireById(refId);
      if (ing.stok < qty) throw new AppError('INSUFFICIENT', `Stok bahan ${ing.nama} < qty`);
      unitCost = ing.harga || 0;
      this.ingredients.update(ing.id, { stok: ing.stok - qty });
    } else {
      const p = this.products.requireById(refId);
      if ((p.stock || 0) < qty) throw new AppError('INSUFFICIENT', `Stok produk ${p.name} < qty`);
      // Untuk produk-jadi: gunakan HPP sebagai unit cost.
      unitCost = (p.bb || 0) + (p.tk || 0) + (p.oh || 0) + (p.km || 0) + (p.kg || 0);
      this.products.update(p.id, { stock: (p.stock || 0) - qty });
    }
    const totalCost = Math.round(unitCost * qty);
    const w = this.repo.create({
      id: uid('wst'),
      refType, refId, qty, unitCost, totalCost,
      reason, note, reportedBy,
      ts: new Date().toISOString(),
    });
    bus.emit('wastages:created', w);
    return w;
  }

  /** Total kerugian dalam rentang waktu. */
  totalCost({ from, to } = {}) {
    return this.repo.list().reduce((s, w) => {
      if (from && w.ts < from) return s;
      if (to   && w.ts > to)   return s;
      return s + (w.totalCost || 0);
    }, 0);
  }

  /** Top alasan kerugian (untuk dashboard & insight). */
  byReason({ from, to } = {}) {
    const map = {};
    for (const w of this.repo.list()) {
      if (from && w.ts < from) continue;
      if (to   && w.ts > to)   continue;
      map[w.reason] = (map[w.reason] || 0) + (w.totalCost || 0);
    }
    return Object.entries(map).map(([reason, cost]) => ({ reason, cost }))
      .sort((a, b) => b.cost - a.cost);
  }
}
