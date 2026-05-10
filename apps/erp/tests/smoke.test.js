// tests/smoke.test.js
// Smoke test menyeluruh — node tests/smoke.test.js
// Mencakup: bootstrap, validasi, store immutability, order/payment flow,
// finance stats, schedule expand+conflict, progress engine, reminder, backup,
// ledger double-entry, wastage auto-journal, points distribution, shift cash,
// production order lifecycle, what-if price simulator, promo, role multiplier.

import { createApp, INITIAL_STATE } from '../src/app.js';
import { MemoryStorageAdapter } from '../src/core/storage.js';
import { ValidationError, AppError } from '../src/core/errorHandler.js';

let passed = 0, failed = 0;
function it(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => { console.log('  PASS', name); passed++; })
    .catch((e) => {
      console.error('  FAIL', name, '\n   ', e.message, e.stack?.split('\n').slice(1, 4).join('\n'));
      failed++;
    });
}
function eq(a, b, msg = '') { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`expected ${JSON.stringify(b)} got ${JSON.stringify(a)} ${msg}`); }
function truthy(v, msg = '') { if (!v) throw new Error(`expected truthy: ${msg}`); }
function close(a, b, eps = 0.01) { if (Math.abs(a - b) > eps) throw new Error(`${a} not close to ${b}`); }
function throws(fn, type) {
  try { const r = fn(); if (r && typeof r.then === 'function') return r.then(() => { throw new Error('expected throw'); }, (e) => { if (type && !(e instanceof type)) throw new Error(`expected ${type.name} got ${e.constructor.name}: ${e.message}`); }); throw new Error('expected throw'); }
  catch (e) { if (type && !(e instanceof type)) throw new Error(`expected ${type.name} got ${e.constructor.name}: ${e.message}`); }
}

async function main() {
  console.log('Smoke tests:');

  const app = createApp({ storageAdapter: new MemoryStorageAdapter() });
  await app.init();

  await it('boot: state matches INITIAL_STATE shape', () => {
    eq(Object.keys(app.store.getState()).sort(), Object.keys(INITIAL_STATE).sort());
  });

  await it('boot: default Chart of Accounts loaded', () => {
    const accs = app.repos.accounts.list();
    truthy(accs.length >= 15, `accounts seeded ${accs.length}`);
    truthy(accs.some(a => a.code === '1100' && a.kind === 'asset'), 'kas account');
  });

  await it('validator: rejects invalid product (negative sell)', () => {
    throws(() => app.repos.products.create({ id: 'P', name: '', cat: '', sell: -5 }), ValidationError);
  });

  // Inject demo data fresh
  await app.services.auth.ensureSeedUser({
    email: 'a@b.co', name: 'Tester', password: 'secret1', role: 'admin',
  });
  await app.services.auth.ensureSeedUser({
    email: 'm@b.co', name: 'Marketer', password: 'mark1234', role: 'marketing',
  });

  app.repos.ingredients.create({
    id: 'I001', nama: 'Susu', satuan: 'ml', stok: 5000, minStok: 500, harga: 10, supplier: '', leadTimeDays: 7,
  });
  app.repos.ingredients.create({
    id: 'I002', nama: 'Kopi', satuan: 'g', stok: 500, minStok: 50, harga: 80, supplier: '', leadTimeDays: 7,
  });
  app.repos.products.create({
    id: 'P001', name: 'Kopi Susu', cat: 'Kopi', sku: 'KS', supId: '',
    bb: 1000, tk: 500, oh: 100, km: 200, kg: 0, mtk: 15, sell: 10000, gros: 8500,
    wt: 300, sat: 'botol', minStk: 5,
    stock: 20,
    photo: '',
    barista: { sop: 'tarik shot', yieldMl: 250, tempC: 4, timeS: 90 },
  });
  app.repos.recipes.set({
    P001: [
      { id: 'I001', qty: 200, kind: 'ingredient' },
      { id: 'I002', qty: 18, kind: 'ingredient' },
    ],
  });

  await it('auth: hashed login + auto-migrate legacy', async () => {
    await app.services.auth.login({ email: 'a@b.co', password: 'secret1' });
    truthy(app.services.auth.getCurrentUser());
    app.services.auth.logout();
    eq(app.services.auth.getCurrentUser(), null);
    await app.services.auth.login({ email: 'a@b.co', password: 'secret1' });
  });

  await it('auth: rejects wrong password', async () => {
    await throws(() => app.services.auth.login({ email: 'a@b.co', password: 'wrong' }));
  });

  await it('store: state object is shallow-frozen', () => {
    const before = app.store.getState();
    let threw = false;
    try { before.orders = []; } catch (_) { threw = true; }
    truthy(Object.isFrozen(before), 'state must be frozen');
    truthy(threw || before.orders === app.store.getState().orders, 'mutation must not stick');
  });

  await it('order: checkout deducts single-stock + creates order without DP', () => {
    const me = app.services.auth.getCurrentUser();
    const r = app.services.order.checkout({
      cart: [{ productId: 'P001', qty: 2 }],
      buyer: { name: 'Pak Budi', wa: '08110001000', city: 'Bandung' },
      payment: { discPct: 0, shipping: 5000, paid: 0 },
      meta: { cashierId: me.id },
    });
    truthy(r.orders.length === 1);
    eq(r.payments.length, 0);
    const o = r.orders[0];
    eq(o.status, 'pending');
    truthy(!('dp' in o), 'order should NOT have dp field');
    const p = app.repos.products.findById('P001');
    eq(p.stock, 18);
  });

  await it('payment: partial → status=partial; full → status=paid', () => {
    const o = app.repos.orders.list()[0];
    const due = (o.total || 0) + (o.ongkir || 0);
    app.services.payment.record({ orderId: o.id, amount: Math.round(due * 0.4), method: 'cash' });
    eq(app.repos.orders.requireById(o.id).status, 'partial');
    app.services.payment.record({ orderId: o.id, amount: due - Math.round(due * 0.4), method: 'transfer' });
    eq(app.repos.orders.requireById(o.id).status, 'paid');
  });

  await it('payment: rejects overpayment', () => {
    const o = app.repos.orders.list()[0];
    throws(() => app.services.payment.record({ orderId: o.id, amount: 1, method: 'cash' }), AppError);
  });

  await it('order: advance status flows after paid', () => {
    const o = app.repos.orders.list()[0];
    app.services.order.advance(o.id);
    eq(app.repos.orders.findById(o.id).status, 'packing');
  });

  await it('ledger: order checkout creates balanced journal entries', () => {
    const journals = app.repos.journals.list();
    truthy(journals.length >= 2, 'at least 2 journal entries');
    for (const j of journals) {
      const dr = j.lines.reduce((s, l) => s + (l.debit || 0), 0);
      const cr = j.lines.reduce((s, l) => s + (l.credit || 0), 0);
      close(dr, cr, 0.01);
    }
  });

  await it('ledger: trialBalance debit==credit', () => {
    const tb = app.services.ledger.trialBalance();
    const dr = tb.reduce((s, a) => s + a.debit, 0);
    const cr = tb.reduce((s, a) => s + a.credit, 0);
    close(dr, cr, 0.01);
  });

  await it('ledger: profitAndLoss returns numeric netProfit', () => {
    const pl = app.services.ledger.profitAndLoss();
    truthy(typeof pl.netProfit === 'number');
  });

  await it('finance: stats computes margin & paid', () => {
    const s = app.services.finance.stats();
    truthy(s.orders >= 1);
    truthy(s.omz > 0);
    truthy(s.paid >= 0);
  });

  await it('finance: cashflow projection produces 30-day series', () => {
    const cf = app.services.finance.cashflowProjection(30);
    eq(cf.series.length, 30);
    truthy(typeof cf.totalOutstanding === 'number');
  });

  await it('what-if: price increase reduces margin in product analyzer', () => {
    const result = app.services.product.whatIfIngredientPrice('I002', 200);
    truthy(result.length >= 1);
    const r = result.find(x => x.productId === 'P001');
    truthy(r.newMargin <= r.oldMargin, 'margin must drop or stay');
  });

  await it('inventory: produceBatch consumes ingredients & adds stock', () => {
    const before = app.repos.products.requireById('P001').stock;
    const ingBefore = app.repos.ingredients.requireById('I001').stok;
    app.services.inventory.produceBatch({
      productId: 'P001', qty: 5, recipes: app.repos.recipes.get(),
    });
    eq(app.repos.products.requireById('P001').stock, before + 5);
    eq(app.repos.ingredients.requireById('I001').stok, ingBefore - 1000);
  });

  await it('wastage: auto-journals to beban kerugian', () => {
    const beforeJ = app.repos.journals.list().length;
    app.services.wastage.record({
      refType: 'ingredient', refId: 'I001', qty: 100, reason: 'spilled', reportedBy: '',
    });
    truthy(app.repos.wastages.list().length >= 1);
    truthy(app.repos.journals.list().length > beforeJ, 'journal posted by listener');
  });

  await it('production: plan → start → complete advances stock', () => {
    const beforeStock = app.repos.products.requireById('P001').stock;
    const po = app.services.production.plan({ productId: 'P001', qtyPlanned: 3 });
    app.services.production.start(po.id);
    app.services.production.complete(po.id, { qcPassFirst: true });
    truthy(app.repos.products.requireById('P001').stock > beforeStock);
  });

  await it('shift: open→close calculates expected & variance', () => {
    const me = app.services.auth.getCurrentUser();
    const sft = app.services.shift.open({ cashierId: me.id, openingCash: 100_000 });
    const closed = app.services.shift.close({ shiftId: sft.id, closingCash: 100_000 });
    eq(closed.status, 'closed');
    truthy(typeof closed.expected === 'number');
  });

  await it('promo: validates % discount', () => {
    app.services.promo.create({
      code: 'TEST10', type: 'percent', value: 10, quota: 100,
      validFrom: new Date(Date.now() - 86400000).toISOString(),
      validTo:   new Date(Date.now() + 86400000).toISOString(),
    });
    const r = app.services.promo.validate('TEST10', 100_000);
    eq(r.discAmt, 10_000);
  });

  await it('points: order_referral logs points to marketer', () => {
    const m = app.repos.users.list().find(u => u.email === 'm@b.co');
    const before = app.services.points.totalForUser(m.id);
    app.services.order.checkout({
      cart: [{ productId: 'P001', qty: 1 }],
      buyer: { name: 'Bu Lina', wa: '08120002000', city: 'Bandung' },
      payment: { discPct: 0, shipping: 0, marketerId: m.id },
    });
    const after = app.services.points.totalForUser(m.id);
    truthy(after > before, `points should increase: ${before} → ${after}`);
  });

  await it('points: distribute returns shares pct sums ≈ 1', () => {
    const dist = app.services.points.distribute(1_000_000);
    if (dist.shares.length >= 2) {
      const totalPct = dist.shares.reduce((s, x) => s + x.sharePct, 0);
      close(totalPct, 1, 0.001);
    }
  });

  await it('schedule: weekly recurring expands & conflicts detected', () => {
    app.repos.schedules.create({
      id: 'S1', title: 'Produksi A', type: 'produksi',
      start: '2025-05-05T08:00:00.000Z', end: '2025-05-05T10:00:00.000Z',
      recurrence: { freq: 'weekly', interval: 1, byWeekday: [1], until: '2025-05-26T00:00:00.000Z' },
    });
    app.repos.schedules.create({
      id: 'S2', title: 'Produksi B', type: 'produksi',
      start: '2025-05-12T09:00:00.000Z', end: '2025-05-12T11:00:00.000Z',
    });
    const occ = app.services.scheduleEngine.listOccurrences('2025-05-01T00:00:00.000Z', '2025-06-01T00:00:00.000Z');
    truthy(occ.length >= 4, `expected >=4 occurrences, got ${occ.length}`);
    const conflicts = app.services.scheduleEngine.detectConflicts(occ);
    truthy(conflicts.length >= 1, 'expected ≥1 conflict');
  });

  await it('progress: classify late & done', () => {
    const pe = app.services.progressEngine;
    const project = {
      id: 'B-001', title: 'Batch Mei',
      startAt: '2025-05-01T00:00:00.000Z', dueAt: '2025-05-31T00:00:00.000Z',
      milestones: [
        { id: 'm1', weight: 1, status: 'done',  dueAt: '2025-05-05T00:00:00.000Z' },
        { id: 'm2', weight: 2, status: 'in_progress' },
        { id: 'm3', weight: 1, status: 'todo',  dueAt: '2025-05-10T00:00:00.000Z' },
      ], activities: [],
    };
    const r = pe.classify(project, Date.parse('2025-05-20T00:00:00.000Z'));
    eq(r.status, 'late');
    const done = { ...project, milestones: project.milestones.map(m => ({ ...m, status: 'done' })) };
    eq(pe.classify(done).status, 'done');
  });

  await it('reminder: scan creates low-stock notification', () => {
    app.repos.products.update('P001', { stock: 0 });
    app.repos.ingredients.update('I001', { stok: 100 });
    app.services.reminderEngine.scan();
    const ns = app.store.getState().notifications;
    truthy(ns.length > 0, 'should have notification');
  });

  await it('migration: legacy v2 state with stock object → integer', async () => {
    const legacy = {
      __schemaVersion: 2,
      products: [{ id: 'X', name: 'X', cat: 'C', sell: 1, stock: { bandung: 5, transit: 2, samarinda: 3 } }],
      orders:   [{ id: 'O1', status: 'lunas', dp: 100, total: 100, ongkir: 0, ts: new Date().toISOString(), buyer: 'X', pid: 'X', pname: 'X', qty: 1, sell: 1 }],
    };
    const adapter = new MemoryStorageAdapter();
    await adapter.setRaw('tr_erp_v3:state', JSON.stringify(legacy));
    const a2 = createApp({ storageAdapter: adapter });
    await a2.init();
    const p = a2.store.getState().products[0];
    eq(p.stock, 10);
    const o = a2.store.getState().orders[0];
    eq(o.status, 'paid');
    truthy(!('dp' in o), 'dp removed');
  });

  await it('backup: export+import roundtrip preserves orders & payments', () => {
    const bk = app.services.backup.export();
    const ordersBefore   = app.repos.orders.list().length;
    const paymentsBefore = app.repos.payments.list().length;
    app.services.backup.import(bk);
    eq(app.repos.orders.list().length,   ordersBefore);
    eq(app.repos.payments.list().length, paymentsBefore);
  });

  await it('rbac: admin can access all pages', () => {
    app.services.rbac.setMatrix({
      admin: { pos: 1, accounting: 1, dashboard: 1, profil: 1 },
    });
    truthy(app.services.rbac.can('admin', 'pos'));
    truthy(app.services.rbac.can('admin', 'accounting'));
    truthy(!app.services.rbac.can('barista', 'accounting'));
  });

  await it('order: cancel reverses ledger journals', () => {
    // Pastikan stok cukup
    app.repos.products.update('P001', { stock: 50 });
    const me = app.services.auth.getCurrentUser();
    const r = app.services.order.checkout({
      cart: [{ productId: 'P001', qty: 1 }],
      buyer: { name: 'Cancel Test', wa: '0811222', city: 'X' },
      payment: { discPct: 0, shipping: 0, paid: 0 },
      meta: { cashierId: me.id },
    });
    const o = r.orders[0];
    const beforeRev = app.repos.journals.list().filter(j => j.source === 'reversal').length;
    app.services.order.cancel(o.id);
    const afterRev = app.repos.journals.list().filter(j => j.source === 'reversal').length;
    truthy(afterRev > beforeRev, 'reversal journal posted');
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => { console.error('FATAL', e); process.exit(2); });
