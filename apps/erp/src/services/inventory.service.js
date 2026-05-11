// src/services/inventory.service.js
// Mutasi stok produk-jadi & deduct ingredient saat batch produksi.
// Single-location. Multi-warehouse dihapus — bisa dikembalikan via warehouse
// service terpisah bila skala butuh.

import { AppError } from '../core/errorHandler.js';
import { uid } from '../core/id.js';
import { bus } from '../core/eventBus.js';

export class InventoryService {
  constructor({ productRepo, ingredientRepo, recipes, store }) {
    this.products = productRepo;
    this.ingredients = ingredientRepo;
    this.recipes = recipes;
    this.store = store;
  }

  /**
   * Adjust stok produk (+/-). Mencatat audit-friendly mutation.
   */
  adjust({ productId, delta, reason = '' }) {
    if (!Number.isFinite(delta) || delta === 0) throw new AppError('INVALID_DELTA', 'Delta wajib non-zero');
    const p = this.products.requireById(productId);
    const next = (p.stock || 0) + delta;
    if (next < 0) throw new AppError('NEGATIVE_STOCK', `Stok ${p.name} akan menjadi negatif`);
    this.products.update(productId, { stock: next });
    const m = { id: uid('mut'), productId, delta, reason, ts: new Date().toISOString() };
    this.store.update('mutations.add', (s) => ({ mutations: [...(s.mutations || []), m] }));
    bus.emit('inventory:adjusted', m);
    return m;
  }

  /**
   * Catat batch produksi: tambah stok produk-jadi, kurangi ingredient sesuai resep.
   * Resep di-resolve rekursif (BOM multi-level): bila item kind='product',
   * konsumsi diturunkan dari produksi internal lain (model Just-In-Time).
   * Untuk MVP, kita hanya rekursi 1 level (kalau nested produk, dihitung BB-nya
   * tapi tidak otomatis trigger sub-production).
   */
  produceBatch({ productId, qty, recipes, notes = '', operatorId = '' }) {
    if (qty <= 0) throw new AppError('INVALID_QTY', 'Qty harus > 0');
    const p = this.products.requireById(productId);
    const recipe = (recipes || this.recipes?.get() || {})[productId] || [];
    if (recipe.length === 0) throw new AppError('NO_RECIPE', `Produk ${p.name} belum punya resep`);

    // Hitung kebutuhan ingredient (flatten BOM 1 level).
    const need = new Map();
    const allRecipes = recipes || this.recipes.get() || {};
    function flatten(prodId, mult) {
      const r = allRecipes[prodId] || [];
      for (const it of r) {
        if (it.kind === 'product') {
          flatten(it.id, mult * it.qty);
        } else {
          need.set(it.id, (need.get(it.id) || 0) + it.qty * mult);
        }
      }
    }
    flatten(productId, qty);

    // Validasi cukup-tidaknya bahan.
    const insufficient = [];
    for (const [ingId, q] of need) {
      const ing = this.ingredients.findById(ingId);
      if (!ing) { insufficient.push({ id: ingId, reason: 'tidak ada' }); continue; }
      if (ing.stok < q) insufficient.push({ id: ingId, nama: ing.nama, need: q, have: ing.stok });
    }
    if (insufficient.length) throw new AppError('INSUFFICIENT_INGREDIENT', 'Bahan tidak cukup', { meta: { insufficient } });

    // Kurangi ingredient.
    for (const [ingId, q] of need) {
      const ing = this.ingredients.requireById(ingId);
      this.ingredients.update(ing.id, { stok: ing.stok - q });
    }
    // Tambah stok produk.
    this.products.update(p.id, { stock: (p.stock || 0) + qty });

    const batch = {
      id: uid('batch'), productId, qty, notes, operatorId,
      ts: new Date().toISOString(), status: 'done',
    };
    this.store.update('batches.add', (s) => ({ batches: [...(s.batches || []), batch] }));
    bus.emit('inventory:produced', batch);
    return batch;
  }

  /**
   * Konsumsi stok produk-jadi untuk pengiriman/order — atomik.
   */
  consume({ productId, qty }) {
    const p = this.products.requireById(productId);
    if ((p.stock || 0) < qty) {
      throw new AppError('INSUFFICIENT_STOCK', `Stok ${p.name} tidak cukup`);
    }
    this.products.update(productId, { stock: (p.stock || 0) - qty });
    bus.emit('inventory:consumed', { productId, qty });
  }

  /**
   * Pemulihan stok (mis. order dibatalkan).
   */
  restore({ productId, qty }) {
    const p = this.products.requireById(productId);
    this.products.update(productId, { stock: (p.stock || 0) + qty });
    bus.emit('inventory:restored', { productId, qty });
  }

  /**
   * Terima PO bahan. Update stok + harga rata-rata tertimbang (weighted avg).
   * Emit event agar GL & ProductService dapat merevaluasi HPP & jurnal
   * persediaan.
   */
  receivePurchase({ ingredientId, qty, price }) {
    const ing = this.ingredients.requireById(ingredientId);
    const newStok = ing.stok + qty;
    const newPrice = newStok > 0
      ? Math.round(((ing.harga * ing.stok) + (price * qty)) / newStok * 100) / 100
      : price;
    const oldPrice = ing.harga;
    this.ingredients.update(ingredientId, { stok: newStok, harga: newPrice });
    bus.emit('inventory:received', { ingredientId, qty, price, oldPrice, newPrice });
    return { oldPrice, newPrice };
  }
}
