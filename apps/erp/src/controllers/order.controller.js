// src/controllers/order.controller.js
// Controller: jembatan tipis antara DOM/UI dan service. TIDAK berisi logika bisnis.
// Tugas controller:
//   1. Subscribe ke Store untuk re-render (lewat `bind`).
//   2. Mendaftarkan event listener (delegated, BUKAN inline) ke root element.
//   3. Memetakan input DOM → payload → memanggil service.
//   4. Menampilkan toast/notifikasi melalui EventBus.

import { bus } from '../core/eventBus.js';
import { debounce } from '../core/perf.js';

export class OrderController {
  constructor({ root, orderService, store, view }) {
    this.root = root;
    this.service = orderService;
    this.store = store;
    this.view = view;     // view = { renderList(orders), renderEmpty() }
    this._unbinds = [];
  }

  mount() {
    // 1. Subscribe ke list orders dengan equality dangkal untuk hindari rerender tak perlu.
    const unsub = this.store.subscribe(
      (s) => s.orders,
      (orders) => this.view.renderList(orders || []),
      (a, b) => a === b   // referential equality cukup karena Store immutable
    );
    this._unbinds.push(unsub);

    // 2. Delegated click handler: ganti seluruh `onclick=` inline.
    const onClick = (ev) => {
      const target = ev.target.closest('[data-action]');
      if (!target || !this.root.contains(target)) return;
      const action = target.dataset.action;
      const id = target.dataset.id;
      try {
        if (action === 'order:advance')      this.service.advance(id);
        else if (action === 'order:cancel')  this.service.cancel(id);
        else if (action === 'order:pay')     this.service.recordPayment(id, { amount: Number(target.dataset.amount || 0) });
      } catch (err) {
        bus.emit('toast', { severity: 'error', message: err.userMessage || err.message });
      }
    };
    this.root.addEventListener('click', onClick);
    this._unbinds.push(() => this.root.removeEventListener('click', onClick));

    // 3. Search debounced.
    const searchInput = this.root.querySelector('[data-role="order-search"]');
    if (searchInput) {
      const onInput = debounce((e) => {
        this.store.update('orderFilter.search', () => ({ orderFilter: e.target.value }));
      }, 250);
      searchInput.addEventListener('input', onInput);
      this._unbinds.push(() => searchInput.removeEventListener('input', onInput));
    }

    // Render awal
    this.view.renderList(this.store.getState().orders || []);
  }

  destroy() {
    for (const off of this._unbinds) try { off(); } catch (_) {}
    this._unbinds = [];
  }
}
