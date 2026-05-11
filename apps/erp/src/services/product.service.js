// src/services/product.service.js
// Logika produk + HPP (Cost-of-Goods). Murni — tanpa DOM.

export const ProductCalc = {
  /**
   * HPP per unit produk: bb + tk + (tk * mtk%) + oh + km + kg.
   * `bb` (bahan baku) idealnya disinkronkan dari resep + harga ingredient
   * terkini melalui `ProductService.syncBBFromRecipes()`.
   */
  hpp(p) {
    const tk = p.tk || 0;
    const mtk = p.mtk ?? 15;
    return (p.bb || 0) + tk + Math.round(tk * mtk / 100) + (p.oh || 0) + (p.km || 0) + (p.kg || 0);
  },

  totalStock(p) { return Number(p.stock || 0); },

  margin(p) {
    const hpp = this.hpp(p);
    return p.sell > 0 ? (p.sell - hpp) / p.sell * 100 : 0;
  },

  /**
   * Hitung biaya bahan baku dari resep — bisa rekursif jika BOM multi-level
   * (item dengan kind='product' merujuk ke produk lain → dihitung HPP-nya).
   */
  bbFromRecipe(productId, ctx) {
    const recipe = (ctx.recipes && ctx.recipes[productId]) || [];
    let total = 0;
    for (const r of recipe) {
      if (r.kind === 'product') {
        total += this.bbFromRecipe(r.id, ctx) * r.qty;
      } else {
        const ing = ctx.ingredients.find(i => i.id === r.id);
        if (ing) total += ing.harga * r.qty;
      }
    }
    return Math.round(total);
  },

  /**
   * Skala resep untuk batch besar.
   */
  scaleRecipe(productId, multiplier, { recipes }) {
    const r = recipes[productId] || [];
    return r.map(item => ({ ...item, qty: item.qty * multiplier }));
  },
};

export class ProductService {
  constructor({ productRepo, recipes, ingredientRepo, store }) {
    this.repo = productRepo;
    this.recipes = recipes;
    this.ingredients = ingredientRepo;
    this.store = store;
  }

  list() { return this.repo.list(); }

  /**
   * Sinkronkan field `bb` produk dengan resep & harga bahan terkini.
   * Idempotent — aman dipanggil berkali-kali (mis. setelah harga ingredient
   * berubah karena PO diterima dengan harga baru).
   */
  syncBBFromRecipes() {
    const recipes = this.recipes.get() || {};
    const ings = this.ingredients.list();
    const updated = [];
    for (const p of this.repo.list()) {
      const next = ProductCalc.bbFromRecipe(p.id, { recipes, ingredients: ings });
      if (next !== p.bb) {
        this.repo.update(p.id, { bb: next });
        updated.push({ id: p.id, oldBB: p.bb, newBB: next });
      }
    }
    return updated;
  }

  lowStock() {
    return this.repo.list().filter(p => ProductCalc.totalStock(p) <= (p.minStk || 0));
  }

  /**
   * Total nilai persediaan produk-jadi (untuk neraca).
   */
  inventoryValue() {
    return this.repo.list().reduce((sum, p) => sum + ProductCalc.hpp(p) * ProductCalc.totalStock(p), 0);
  }

  /**
   * What-if: simulasi kenaikan harga bahan tertentu → hitung dampak ke margin
   * tiap produk. Return: [{ productId, name, oldHPP, newHPP, oldMargin, newMargin, recommend }].
   */
  whatIfIngredientPrice(ingredientId, newPrice) {
    const recipes = this.recipes.get() || {};
    const ings = this.ingredients.list();
    const overridden = ings.map(i => i.id === ingredientId ? { ...i, harga: newPrice } : i);
    const out = [];
    for (const p of this.repo.list()) {
      const oldHPP = ProductCalc.hpp(p);
      const newBB = ProductCalc.bbFromRecipe(p.id, { recipes, ingredients: overridden });
      const newHPP = ProductCalc.hpp({ ...p, bb: newBB });
      const oldMargin = ProductCalc.margin(p);
      const newMargin = p.sell > 0 ? (p.sell - newHPP) / p.sell * 100 : 0;
      const delta = newMargin - oldMargin;
      let recommend = 'aman';
      if (newMargin < 0)         recommend = 'rugi - reformulasi atau hentikan';
      else if (newMargin < 10)   recommend = 'naikkan harga jual / cari supplier alternatif';
      else if (delta < -5)       recommend = 'awasi — margin tergerus signifikan';
      out.push({
        productId: p.id, name: p.name,
        oldHPP, newHPP, oldMargin, newMargin, delta, recommend,
      });
    }
    return out;
  }
}
