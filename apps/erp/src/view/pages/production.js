// src/view/pages/production.js — Produksi + MRP saran PO.
import { h, fmt } from '../h.js';
import { Card, Empty, Input, Field, Table, Badge, KPI, StatusBadge } from '../components.js';
import { bus } from '../../core/eventBus.js';

export function productionPage(app) {
  const root = h('div', { class: 'col gap-4' });

  function render() {
    while (root.firstChild) root.firstChild.remove();
    const pos = app.repos.productionOrders.list().slice().reverse();
    const ings = app.repos.ingredients.list();
    const mrp = app.services.production.mrpSuggestions(ings);

    root.append(h('div', { class: 'page-header' },
      h('div', null,
        h('div', { class: 'page-title' }, 'Produksi'),
        h('div', { class: 'page-sub' }, 'Production Order + Material Requirement Planning.'),
      ),
      h('div', { class: 'page-actions' },
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/wastage' }, 'Wastage'),
        h('button', { class: 'btn ghost sm', onclick: () => location.hash = '#/recipe' }, 'Recipe'),
      ),
    ));

    root.append(h('div', { class: 'kpi-grid' },
      KPI({ label: 'Total PO', value: pos.length }),
      KPI({ label: 'Berjalan', value: pos.filter(p => p.status === 'in_progress').length }),
      KPI({ label: 'Direncanakan', value: pos.filter(p => p.status === 'planned').length }),
      KPI({ label: 'Bahan Kurang', value: mrp.length, deltaDir: mrp.length > 0 ? 'down' : 'up' }),
    ));

    // Form plan
    let f = { productId: '', qtyPlanned: 0, notes: '' };
    root.append(Card({
      title: 'Rencanakan Produksi Baru',
      body: h('form', { class: 'col gap-3', onsubmit: (e) => {
        e.preventDefault();
        try {
          app.services.production.plan({
            productId: f.productId, qtyPlanned: +f.qtyPlanned,
            operatorId: app.services.auth.getCurrentUser()?.id || '',
            notes: f.notes,
          });
          bus.emit('toast', { severity: 'success', message: 'Production order dibuat.' });
          render();
        } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
      }},
        h('div', { class: 'form-grid' },
          Field({ label: 'Produk', children: h('select', {
            class: 'input', onchange: e => f.productId = e.target.value,
          }, [
            h('option', { value: '' }, '— Pilih —'),
            ...app.repos.products.list().map(p => h('option', { value: p.id }, p.name)),
          ])}),
          Field({ label: 'Qty', children: Input({ type: 'number', min: 1, oninput: e => f.qtyPlanned = e.target.value }) }),
        ),
        Field({ label: 'Catatan', children: Input({ oninput: e => f.notes = e.target.value }) }),
        h('button', { class: 'btn primary', type: 'submit' }, 'Buat Production Order'),
      ),
    }));

    // MRP
    root.append(Card({
      title: 'MRP — Bahan yang Perlu Dipesan',
      sub: mrp.length === 0 ? 'Stok cukup untuk semua PO planned' : 'Berdasarkan PO planned/in_progress',
      body: mrp.length === 0
        ? Empty({ icon: '✓', title: 'Tidak ada kekurangan bahan' })
        : Table({
          columns: [
            { key: 'name', label: 'Bahan' },
            { key: 'need', label: 'Butuh', align: 'right', render: r => h('span', { class: 'num' }, r.need.toFixed(2)) },
            { key: 'have', label: 'Stok', align: 'right', render: r => h('span', { class: 'num' }, r.have) },
            { key: 'shortfall', label: 'Kurang', align: 'right', render: r => h('span', { class: 'num', style: { color: 'var(--danger)' } }, r.shortfall.toFixed(2)) },
            { key: 'leadTimeDays', label: 'Lead Time', align: 'right', render: r => `${r.leadTimeDays} hari` },
            { key: 'estCost', label: 'Est. Biaya', align: 'right', render: r => h('span', { class: 'num' }, fmt.rp(r.estCost)) },
          ],
          rows: mrp,
        }),
    }));

    // List PO
    root.append(Card({
      title: 'Production Orders',
      body: pos.length === 0 ? Empty() : Table({
        columns: [
          { key: 'id', label: 'ID' },
          { key: 'productId', label: 'Produk', render: p => app.repos.products.findById(p.productId)?.name || p.productId },
          { key: 'qtyPlanned', label: 'Qty', align: 'right' },
          { key: 'plannedAt', label: 'Direncanakan', render: p => fmt.rel(p.plannedAt) },
          { key: 'status', label: 'Status', render: p => StatusBadge(p.status) },
          { key: 'actions', label: 'Aksi', render: p => h('div', { class: 'row gap-2' },
            p.status === 'planned' ? h('button', { class: 'btn ghost sm', onclick: () => {
              try { app.services.production.start(p.id); render(); }
              catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
            } }, 'Start') : null,
            p.status === 'in_progress' ? h('button', { class: 'btn primary sm', onclick: () => {
              try {
                app.services.production.complete(p.id, { qcPassFirst: confirm('QC pass first try? OK = ya') });
                bus.emit('toast', { severity: 'success', message: 'Produksi selesai.' });
                render();
              } catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
            } }, 'Complete') : null,
            ['planned','in_progress'].includes(p.status) ? h('button', { class: 'btn ghost sm', onclick: () => {
              const r = prompt('Alasan pembatalan?'); if (r === null) return;
              try { app.services.production.cancel(p.id, { reason: r }); render(); }
              catch (er) { bus.emit('toast', { severity: 'error', message: er.message }); }
            } }, 'Batal') : null,
          )},
        ],
        rows: pos,
      }),
    }));
  }

  render();
  app.store.subscribe(s => [s.productionOrders, s.products, s.ingredients], () => render(), (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2]);
  return root;
}
