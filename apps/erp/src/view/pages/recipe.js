// src/view/pages/recipe.js
// Recipe Card barista + scaling + What-if price simulator.
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Select, Field, Table, Badge, KPI } from '../components.js';
import { ProductCalc } from '../../services/product.service.js';

export function recipePage(app) {
  const root = h('div', { class: 'col gap-4' });
  let selectedId = '';
  let scaleQty = 10;
  let whatIf = { ingredientId: '', newPrice: 0 };

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const products = app.repos.products.list();
    const recipes = app.repos.recipes.get() || {};
    const ings = app.repos.ingredients.list();
    if (!selectedId && products.length) selectedId = products[0].id;
    if (!whatIf.ingredientId && ings.length) {
      whatIf.ingredientId = ings[0].id;
      whatIf.newPrice = ings[0].harga;
    }

    const sel = app.repos.products.findById(selectedId);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Recipe Card & What-if'),
        h('div', { class: 'page-sub' }, 'SOP Barista, BOM, dan simulator dampak harga bahan baku.'),
      ),
    ));

    // Product picker
    root.append(Card({
      body: h('div', { class: 'row gap-3' },
        Field({ label: 'Pilih Produk', children: Select(
          products.map(p => ({ value: p.id, label: p.name })),
          { value: selectedId, onchange: e => { selectedId = e.target.value; render(); } }
        )}),
      ),
    }));

    if (sel) {
      const recipe = recipes[selectedId] || [];
      const hpp = ProductCalc.hpp(sel);
      const margin = ProductCalc.margin(sel);

      // Recipe card
      root.append(Card({
        title: `${sel.name} — Recipe Card`,
        sub: sel.cat,
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'kpi-grid' },
            KPI({ label: 'Harga Jual', value: fmt.rp(sel.sell) }),
            KPI({ label: 'HPP', value: fmt.rp(hpp) }),
            KPI({ label: 'Margin', value: fmt.pct(margin), deltaDir: margin >= 15 ? 'up' : 'down' }),
            KPI({ label: 'Yield', value: `${sel.barista?.yieldMl || 250} ml` }),
          ),
          h('div', { class: 'form-grid' },
            Field({ label: 'SOP Barista', children: h('textarea', {
              class: 'input', rows: 4, style: { width: '100%', resize: 'vertical' },
              oninput: e => app.repos.products.update(sel.id, { barista: { ...sel.barista, sop: e.target.value } }),
            }, sel.barista?.sop || '') }),
            h('div', { class: 'col gap-2' },
              Field({ label: 'Yield (ml)', children: Input({ type: 'number', value: sel.barista?.yieldMl || 250,
                onchange: e => app.repos.products.update(sel.id, { barista: { ...sel.barista, yieldMl: +e.target.value || 250 } }) }) }),
              Field({ label: 'Suhu (°C)', children: Input({ type: 'number', value: sel.barista?.tempC || 4,
                onchange: e => app.repos.products.update(sel.id, { barista: { ...sel.barista, tempC: +e.target.value || 4 } }) }) }),
              Field({ label: 'Waktu (detik)', children: Input({ type: 'number', value: sel.barista?.timeS || 90,
                onchange: e => app.repos.products.update(sel.id, { barista: { ...sel.barista, timeS: +e.target.value || 90 } }) }) }),
            ),
          ),
          h('h4', { style: { marginTop: '12px' } }, 'Bill of Materials'),
          recipe.length === 0
            ? Empty({ icon: '📝', title: 'Belum ada resep', detail: 'Tambahkan bahan agar HPP & MRP otomatis terhitung.' })
            : Table({
              columns: [
                { key: 'name', label: 'Bahan', render: r => {
                  const ing = app.repos.ingredients.findById(r.id);
                  return ing ? ing.nama : r.id;
                }},
                { key: 'qty', label: 'Qty / unit', align: 'right', render: r => {
                  const ing = app.repos.ingredients.findById(r.id);
                  return h('span', { class: 'num' }, `${r.qty} ${ing?.satuan || ''}`);
                }},
                { key: 'cost', label: 'Biaya', align: 'right', render: r => {
                  const ing = app.repos.ingredients.findById(r.id);
                  return h('span', { class: 'num' }, fmt.rp((ing?.harga || 0) * r.qty));
                }},
              ],
              rows: recipe,
            }),
        ),
      }));

      // Recipe scaling slider — "buat N cup"
      if (recipe.length > 0) {
        const scaled = recipe.map(r => {
          const ing = app.repos.ingredients.findById(r.id);
          const need = r.qty * scaleQty;
          const stock = ing?.stock || 0;
          return { id: r.id, name: ing?.nama || r.id, satuan: ing?.satuan || '', need, stock, ok: stock >= need };
        });
        const allOk = scaled.every(s => s.ok);
        const totalCost = scaled.reduce((s, r) => {
          const ing = app.repos.ingredients.findById(r.id);
          return s + (ing?.harga || 0) * r.need;
        }, 0);

        root.append(Card({
          title: 'Scaling Produksi',
          sub: `Hitung kebutuhan bahan untuk batch ${scaleQty} ${sel.sat || 'cup'}`,
          body: h('div', { class: 'col gap-3' },
            h('div', { class: 'col gap-2' },
              h('div', { class: 'row between', style: { alignItems: 'center' } },
                h('div', { class: 'text-sm text-muted' }, `Buat: ${scaleQty} ${sel.sat || 'cup'}`),
                h('div', { class: 'num', style: { fontWeight: 700 } }, fmt.rp(totalCost)),
              ),
              h('input', {
                type: 'range', min: 1, max: 200, step: 1, value: scaleQty,
                style: { width: '100%' },
                oninput: e => { scaleQty = +e.target.value || 1; render(); },
              }),
              h('div', { class: 'row between text-xs text-muted' },
                h('span', null, '1'), h('span', null, '50'), h('span', null, '100'), h('span', null, '200'),
              ),
            ),
            Table({
              columns: [
                { key: 'name', label: 'Bahan' },
                { key: 'need', label: 'Butuh', align: 'right', render: r => h('span', { class: 'num' }, `${r.need.toFixed(2)} ${r.satuan}`) },
                { key: 'stock', label: 'Stok', align: 'right', render: r => h('span', { class: 'num' }, `${r.stock} ${r.satuan}`) },
                { key: 'ok', label: 'Status', render: r => Badge(r.ok ? 'Cukup' : 'Kurang', r.ok ? 'success' : 'danger') },
              ],
              rows: scaled,
            }),
            allOk
              ? h('div', { class: 'text-sm', style: { color: 'var(--success)' } }, '✓ Semua bahan cukup untuk batch ini.')
              : h('div', { class: 'text-sm', style: { color: 'var(--danger)' } }, '⚠ Beberapa bahan kurang. Lakukan PO atau kurangi qty.'),
          ),
        }));
      }

      // What-if simulator
      const ing = app.repos.ingredients.findById(whatIf.ingredientId);
      const wif = whatIf.ingredientId ? app.services.product.whatIfIngredientPrice(whatIf.ingredientId, +whatIf.newPrice || 0) : [];

      root.append(Card({
        title: 'What-if Simulator: Harga Bahan',
        sub: 'Lihat dampak ke margin tiap produk bila harga bahan berubah.',
        body: h('div', { class: 'col gap-3' },
          h('div', { class: 'form-grid' },
            Field({ label: 'Pilih Bahan', children: Select(
              ings.map(i => ({ value: i.id, label: `${i.nama} (saat ini: ${fmt.rp(i.harga)})` })),
              { value: whatIf.ingredientId, onchange: e => {
                whatIf.ingredientId = e.target.value;
                const i = app.repos.ingredients.findById(whatIf.ingredientId);
                whatIf.newPrice = i?.harga || 0; render();
              } }
            )}),
            Field({ label: 'Harga Baru / unit', children: Input({ type: 'number', min: 0,
              value: whatIf.newPrice, oninput: e => { whatIf.newPrice = +e.target.value || 0; render(); } }) }),
          ),
          ing ? h('div', { class: 'text-sm text-muted' },
            `Perubahan: ${fmt.rp(ing.harga)} → ${fmt.rp(+whatIf.newPrice || 0)} (${(((+whatIf.newPrice || 0) - ing.harga) / Math.max(1, ing.harga) * 100).toFixed(1)}%)`
          ) : null,
          wif.length === 0 ? null : Table({
            columns: [
              { key: 'productId', label: 'Produk', render: r => {
                const p = app.repos.products.findById(r.productId);
                return p ? p.name : r.productId;
              }},
              { key: 'oldHPP', label: 'HPP lama', align: 'right', render: r => h('span', { class: 'num' }, fmt.rp(r.oldHPP)) },
              { key: 'newHPP', label: 'HPP baru', align: 'right', render: r => h('span', { class: 'num' }, fmt.rp(r.newHPP)) },
              { key: 'oldMargin', label: 'Margin lama', align: 'right', render: r => h('span', { class: 'num' }, fmt.pct(r.oldMargin)) },
              { key: 'newMargin', label: 'Margin baru', align: 'right', render: r => h('span', { class: 'num ' + (r.newMargin < r.oldMargin ? 'text-danger' : '') },
                fmt.pct(r.newMargin)) },
              { key: 'rec', label: 'Rekomendasi', render: r => Badge(r.recommend, r.newMargin < 10 ? 'danger' : (r.newMargin < r.oldMargin ? 'warning' : 'success')) },
            ],
            rows: wif,
          }),
        ),
      }));
    }
  }

  render();
  app.store.subscribe(s => [s.products, s.ingredients, s.recipes], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
  return root;
}
