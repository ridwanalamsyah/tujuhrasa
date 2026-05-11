// src/view/pages/inventory.js
import { h, fmt } from '../h.js';
import { Card, Table, Badge, Empty, KPI } from '../components.js';
import { ProductCalc } from '../../services/product.service.js';

export function inventoryPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const ings = app.repos.ingredients.list();
    const prods = app.repos.products.list();
    const lowI = ings.filter(i => i.stok <= i.minStok).length;
    const lowP = prods.filter(p => ProductCalc.totalStock(p) <= p.minStk).length;
    const stockValue = ings.reduce((s, i) => s + i.stok * i.harga, 0);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Bahan & Gudang'),
        h('div', { class: 'page-sub' }, 'Stok bahan baku & produk-jadi'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total Bahan', value: ings.length }),
      KPI({ label: 'Bahan menipis', value: lowI, deltaDir: lowI > 0 ? 'down' : 'up', delta: lowI > 0 ? 'perlu PO' : 'aman' }),
      KPI({ label: 'Produk menipis', value: lowP, deltaDir: lowP > 0 ? 'down' : 'up', delta: lowP > 0 ? 'butuh produksi' : 'aman' }),
      KPI({ label: 'Nilai Stok Bahan', value: fmt.rp(stockValue) }),
    ));

    root.append(Card({
      title: 'Bahan Baku',
      body: Table({
        columns: [
          { key: 'nama', label: 'Bahan' },
          { key: 'stok', label: 'Stok', align: 'right', render: i => h('span', { class: 'num' }, `${i.stok} ${i.satuan}`) },
          { key: 'minStok', label: 'Minimum', align: 'right', render: i => `${i.minStok} ${i.satuan}` },
          { key: 'harga', label: 'Harga / unit', align: 'right', render: i => h('span', { class: 'num' }, fmt.rp(i.harga)) },
          { key: 'supplier', label: 'Supplier' },
          { key: 'status', label: '', render: i => i.stok <= i.minStok ? Badge('Menipis', 'danger') : Badge('Aman', 'success') },
        ],
        rows: ings,
        empty: Empty(),
      }),
    }));

    root.append(Card({
      title: 'Produk Jadi',
      body: Table({
        columns: [
          { key: 'name', label: 'Produk' },
          { key: 'cat',  label: 'Kategori' },
          { key: 'sell', label: 'Harga jual', align: 'right', render: p => h('span', { class: 'num' }, fmt.rp(p.sell)) },
          { key: 'stock', label: 'Stok', align: 'right', render: p => h('span', { class: 'num' }, `${p.stock || 0} ${p.sat}`) },
          { key: 'minStk', label: 'Minimum', align: 'right', render: p => `${p.minStk || 0} ${p.sat}` },
          { key: 'status', label: '', render: p => {
            const t = ProductCalc.totalStock(p);
            return Badge(`${t <= p.minStk ? 'Menipis' : 'Aman'}`, t <= p.minStk ? 'danger' : 'success');
          }},
        ],
        rows: prods,
        empty: Empty(),
      }),
    }));
  }

  render();
  app.store.subscribe(s => [s.ingredients, s.products], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1]);
  return root;
}
