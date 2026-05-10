// src/services/production.service.js
// Production Order untuk manufacturing: planned → in_progress → qc → done.
// Mengintegrasikan dengan InventoryService.produceBatch saat selesai.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class ProductionService {
  constructor({ productionRepo, productRepo, inventory, recipes }) {
    this.repo = productionRepo;
    this.products = productRepo;
    this.inventory = inventory;
    this.recipes = recipes;
  }

  plan({ productId, qtyPlanned, plannedAt, operatorId = '', notes = '' }) {
    this.products.requireById(productId);
    if (!Number.isFinite(qtyPlanned) || qtyPlanned <= 0) throw new AppError('INVALID_QTY', 'qtyPlanned > 0');
    return this.repo.create({
      id: uid('prod'),
      productId, qtyPlanned, qtyDone: 0,
      status: 'planned',
      plannedAt: plannedAt || new Date().toISOString(),
      startedAt: '', finishedAt: '',
      operatorId, notes, qcPassFirst: false,
    });
  }

  start(id) {
    const po = this.repo.requireById(id);
    if (po.status !== 'planned') throw new AppError('INVALID_STATE', 'Hanya planned yang bisa di-start');
    return this.repo.update(id, { status: 'in_progress', startedAt: new Date().toISOString() });
  }

  /**
   * Selesai produksi: panggil InventoryService.produceBatch, set status done.
   */
  complete(id, { qcPassFirst = true } = {}) {
    const po = this.repo.requireById(id);
    if (!['in_progress', 'qc'].includes(po.status)) throw new AppError('INVALID_STATE', 'Harus in_progress atau qc');
    const batch = this.inventory.produceBatch({
      productId: po.productId,
      qty: po.qtyPlanned,
      recipes: this.recipes.get() || {},
      operatorId: po.operatorId,
      notes: po.notes,
    });
    const next = this.repo.update(id, {
      status: 'done',
      qtyDone: po.qtyPlanned,
      finishedAt: new Date().toISOString(),
      qcPassFirst,
    });
    bus.emit('production:done', { productionOrder: next, batch, qcPassFirst, operatorId: po.operatorId });
    return next;
  }

  cancel(id, { reason = '' } = {}) {
    const po = this.repo.requireById(id);
    return this.repo.update(id, { status: 'cancelled', notes: (po.notes || '') + ` [batal: ${reason}]` });
  }

  /**
   * MRP sederhana: dari kebutuhan (ProductionOrder dengan status planned) →
   * hitung total bahan yang dibutuhkan, bandingkan dengan stok bahan, hasilkan
   * saran PO.
   */
  mrpSuggestions(ingredients) {
    const recipes = this.recipes.get() || {};
    const need = new Map();
    for (const po of this.repo.list(x => x.status === 'planned' || x.status === 'in_progress')) {
      const flatten = (prodId, mult) => {
        const r = recipes[prodId] || [];
        for (const it of r) {
          if (it.kind === 'product') flatten(it.id, mult * it.qty);
          else need.set(it.id, (need.get(it.id) || 0) + it.qty * mult);
        }
      };
      flatten(po.productId, po.qtyPlanned);
    }
    const out = [];
    for (const [ingId, q] of need) {
      const ing = ingredients.find(i => i.id === ingId);
      if (!ing) continue;
      const shortfall = q - ing.stok;
      if (shortfall > 0) {
        out.push({
          ingredientId: ingId, name: ing.nama,
          need: q, have: ing.stok, shortfall,
          leadTimeDays: ing.leadTimeDays || 7,
          estCost: shortfall * (ing.harga || 0),
        });
      }
    }
    return out.sort((a, b) => b.shortfall - a.shortfall);
  }
}
