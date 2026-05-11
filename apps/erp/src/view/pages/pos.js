// src/view/pages/pos.js
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Select, Field, Button } from '../components.js';
import { Icon } from '../icons.js';
import { bus } from '../../core/eventBus.js';
import { ProductCalc } from '../../services/product.service.js';
import { debounce } from '../../core/perf.js';

export function posPage(app) {
  const root = h('div', { class: 'col gap-4' });
  let cart = [];
  let buyer = { name: '', wa: '', city: '' };
  let payment = { discPct: 0, shipping: 0, paid: 0, method: 'cash', promoCode: '' };
  let q = '';

  function findProduct(id) { return app.repos.products.findById(id); }
  function addToCart(id) {
    const p = findProduct(id); if (!p) return;
    const ex = cart.find(c => c.id === id);
    if (ex) ex.qty += 1; else cart.push({ id, qty: 1 });
    render();
  }
  function changeQty(id, delta) {
    const ex = cart.find(c => c.id === id); if (!ex) return;
    ex.qty = Math.max(0, ex.qty + delta);
    if (ex.qty === 0) cart = cart.filter(c => c.id !== id);
    render();
  }

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const products = app.repos.products.list().filter(p => !q || `${p.name} ${p.cat} ${p.sku}`.toLowerCase().includes(q.toLowerCase()));

    const subtotal = cart.reduce((s, c) => { const p = findProduct(c.id); return s + (p?.sell || 0) * c.qty; }, 0);
    const disc = Math.round(subtotal * (payment.discPct || 0) / 100);
    const total = Math.max(0, subtotal - disc + (payment.shipping || 0));

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Kasir (POS)'),
        h('div', { class: 'page-sub' }, 'Klik produk untuk menambahkan ke keranjang.'),
      ),
    ));

    root.append(h('div', { class: 'pos-grid' },
      // Katalog
      h('div', { class: 'col gap-3' },
        Input({ placeholder: 'Cari produk…', value: q, oninput: debounce(e => { q = e.target.value; render(); }, 150) }),
        h('div', { class: 'pos-catalog' }, ...products.map(p => {
          const stock = ProductCalc.totalStock(p);
          return h('div', { class: 'pos-card', onclick: () => addToCart(p.id) },
            h('div', { class: 'name' }, p.name),
            h('div', { class: 'text-xs text-muted' }, `${p.cat} • ${p.sat}`),
            h('div', { class: 'row between mt-2' },
              h('div', { class: 'price' }, fmt.rp(p.sell)),
              h('div', { class: 'text-xs ' + (stock <= p.minStk ? 'badge danger' : 'badge default') }, `Stok ${stock}`),
            ),
          );
        })),
      ),
      // Cart
      Card({
        title: 'Keranjang',
        sub: cart.length ? `${cart.length} item` : 'Kosong',
        body: cart.length === 0
          ? Empty({ icon: '🛒', title: 'Belum ada item', detail: 'Pilih produk dari katalog.' })
          : h('div', { class: 'col gap-3' },
              h('div', { class: 'col gap-2' },
                ...cart.map(c => {
                  const p = findProduct(c.id) || {};
                  return h('div', { class: 'row between', style: { padding: '8px 0', borderBottom: '1px solid var(--border-soft)' } },
                    h('div', { class: 'col grow' },
                      h('div', null, p.name),
                      h('div', { class: 'text-xs text-muted' }, fmt.rp(p.sell)),
                    ),
                    h('div', { class: 'row gap-2' },
                      h('button', { class: 'btn sm', onclick: () => changeQty(c.id, -1) }, '−'),
                      h('span', { class: 'num', style: { minWidth: '24px', textAlign: 'center' } }, c.qty),
                      h('button', { class: 'btn sm', onclick: () => changeQty(c.id, +1) }, '+'),
                    ),
                  );
                }),
              ),
              h('div', { class: 'divider' }),
              h('div', { class: 'col gap-2' },
                Field({ label: 'Nama Pembeli', children: Input({ value: buyer.name, oninput: e => buyer.name = e.target.value, placeholder: 'mis. Pak Budi' }) }),
                h('div', { class: 'form-grid' },
                  Field({ label: 'WhatsApp', children: Input({ value: buyer.wa, oninput: e => buyer.wa = e.target.value, placeholder: '08...' }) }),
                  Field({ label: 'Kota', children: Input({ value: buyer.city, oninput: e => buyer.city = e.target.value }) }),
                ),
                h('div', { class: 'form-grid' },
                  Field({ label: 'Diskon %', children: Input({ type: 'number', min: 0, max: 100, value: payment.discPct, oninput: e => { payment.discPct = +e.target.value || 0; render(); } }) }),
                  Field({ label: 'Ongkir', children: Input({ type: 'number', min: 0, value: payment.shipping, oninput: e => { payment.shipping = +e.target.value || 0; render(); } }) }),
                ),
                h('div', { class: 'form-grid' },
                  Field({ label: 'Bayar Sekarang', children: Input({ type: 'number', min: 0, value: payment.paid, oninput: e => { payment.paid = +e.target.value || 0; render(); } }) }),
                  Field({ label: 'Metode', children: Select(
                    ['cash','transfer','qris','ewallet','card'].map(m => ({ value: m, label: m })),
                    { value: payment.method, onchange: e => payment.method = e.target.value }
                  ) }),
                ),
                Field({ label: 'Kode Promo', children: Input({ value: payment.promoCode, oninput: e => payment.promoCode = e.target.value.toUpperCase(), placeholder: 'Opsional' }) }),
              ),
              h('div', { class: 'divider' }),
              h('div', { class: 'row between' }, h('span', { class: 'text-muted text-sm' }, 'Subtotal'), h('span', { class: 'num' }, fmt.rp(subtotal))),
              h('div', { class: 'row between' }, h('span', { class: 'text-muted text-sm' }, 'Diskon'), h('span', { class: 'num' }, '− ' + fmt.rp(disc))),
              h('div', { class: 'row between' }, h('span', { class: 'text-muted text-sm' }, 'Ongkir'), h('span', { class: 'num' }, fmt.rp(payment.shipping))),
              h('div', { class: 'row between', style: { fontSize: '16px', fontWeight: 700 } }, h('span', null, 'Total'), h('span', { class: 'num' }, fmt.rp(total))),
              Button('Proses Checkout', { variant: 'primary', onclick: () => {
                try {
                  // Validate promo if any
                  let promoMarketerId = '';
                  if (payment.promoCode) {
                    try {
                      const v = app.services.promo.validate(payment.promoCode, subtotal);
                      promoMarketerId = v.marketerId || '';
                      app.services.promo.redeem(payment.promoCode);
                    } catch (er) {
                      bus.emit('toast', { severity: 'warning', message: er.message });
                    }
                  }
                  const me = app.services.auth.getCurrentUser();
                  const cur = me?.role === 'sales' || me?.role === 'barista' ? me.id : '';
                  const r = app.services.order.checkout({
                    cart: cart.map(c => ({ productId: c.id, qty: c.qty })),
                    buyer,
                    payment: { ...payment, marketerId: promoMarketerId },
                    meta: { cashierId: cur, batch: app.repos.settings.get()?.batch || '' },
                  });
                  cart = []; buyer = { name: '', wa: '', city: '' };
                  payment = { discPct: 0, shipping: 0, paid: 0, method: 'cash', promoCode: '' };
                  bus.emit('toast', { severity: 'success', message: `Checkout berhasil (${r.orders.length} order).` });
                  // Auto-print struk untuk order pertama (thermal Bluetooth jika tersambung, fallback PDF)
                  try {
                    if (r.orders[0]) {
                      const ps = app.services.printer;
                      if (ps && ps._char) {
                        ps.printReceipt(r.orders[0].id).catch(() => app.services.pdf.printReceipt(r.orders[0]));
                      } else {
                        app.services.pdf.printReceipt(r.orders[0]);
                      }
                    }
                  } catch (_) {}
                  location.hash = '#/orders';
                } catch (e) {
                  app.errors.handle(e);
                  bus.emit('toast', { severity: 'error', message: e.userMessage || e.message });
                }
              } }),
            ),
      }),
    ));
  }

  render();
  app.store.subscribe(s => s.products, () => render(), (a, b) => a === b);
  return root;
}
