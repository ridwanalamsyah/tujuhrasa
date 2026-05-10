// src/view/seed.js
// Seed data demo. Idempotent — hanya menambah jika koleksi kosong.
// Dipakai untuk dev/demo agar UI memiliki konten yang realistis.

export async function seedDemo(app) {
  const s = app.store.getState();

  if ((s.users || []).length === 0) {
    await app.services.auth.ensureSeedUser({
      email: 'ridwan@tujuhrasa.id', name: 'Ridwan Alamsyah',
      password: 'ridwan123', role: 'admin',
    });
    await app.services.auth.ensureSeedUser({
      email: 'ahmad@tujuhrasa.id', name: 'Ahmad Yusup',
      password: 'ahmad123', role: 'produksi',
    });
    await app.services.auth.ensureSeedUser({
      email: 'siti@tujuhrasa.id', name: 'Siti Rahma',
      password: 'siti123', role: 'barista',
    });
    // Set role multiplier khusus.
    const u2 = app.repos.users.list().find(u => u.email === 'ahmad@tujuhrasa.id');
    if (u2) app.repos.users.update(u2.id, { roleMultiplier: 1.0, pos: 'Manajer Produksi' });
    const u3 = app.repos.users.list().find(u => u.email === 'siti@tujuhrasa.id');
    if (u3) app.repos.users.update(u3.id, { roleMultiplier: 0.9, pos: 'Barista' });
    const u1 = app.repos.users.list().find(u => u.email === 'ridwan@tujuhrasa.id');
    if (u1) app.repos.users.update(u1.id, { roleMultiplier: 1.0, pos: 'Owner & Marketing' });
  }

  // Backfill: add missing page keys to existing RBAC matrices so users upgrading
  // from old versions can access new features (analytics, subscriptions, purchases).
  if (s.rbac && Object.keys(s.rbac).length > 0) {
    const additions = {
      admin:       { subscriptions:1, purchases:1, analytics:1 },
      koordinator: { subscriptions:1, purchases:1, analytics:1 },
      marketing:   { subscriptions:1, analytics:1 },
      produksi:    { subscriptions:0, purchases:1 },
      sales:       { subscriptions:0, purchases:0 },
      barista:     { subscriptions:0, purchases:0 },
    };
    let dirty = false;
    const next = { ...s.rbac };
    for (const [role, add] of Object.entries(additions)) {
      const cur = next[role];
      if (!cur) continue;
      for (const [k, v] of Object.entries(add)) {
        if (cur[k] === undefined) { cur[k] = v; dirty = true; }
      }
    }
    if (dirty) app.store.update('rbac.backfill', () => ({ rbac: next }));
  }

  if (!s.rbac || Object.keys(s.rbac).length === 0) {
    app.store.update('rbac.seed', () => ({
      rbac: {
        admin:       { dashboard:1, pos:1, cogs:1, analytics:1, orders:1, customers:1, invoice:1, products:1, inventory:1, suppliers:1, purchase:1, finance:1, accounting:1, production:1, wastage:1, recipe:1, shifts:1, points:1, promo:1, reports:1, audit:1, users:1, profil:1, settings:1, schedule:1, subscriptions:1, purchases:1 },
        koordinator: { dashboard:1, pos:1, cogs:1, analytics:1, orders:1, customers:1, invoice:1, products:0, inventory:1, suppliers:0, purchase:1, finance:1, accounting:0, production:1, wastage:1, recipe:1, shifts:1, points:1, promo:0, reports:1, audit:1, users:0, profil:1, settings:0, schedule:1, subscriptions:1, purchases:1 },
        produksi:    { dashboard:1, pos:0, cogs:1, analytics:0, orders:1, customers:0, invoice:0, products:1, inventory:1, suppliers:1, purchase:1, finance:0, accounting:0, production:1, wastage:1, recipe:1, shifts:0, points:1, promo:0, reports:0, audit:0, users:0, profil:1, settings:0, schedule:1 },
        sales:       { dashboard:1, pos:1, cogs:0, analytics:0, orders:1, customers:1, invoice:1, products:0, inventory:0, suppliers:0, purchase:0, finance:0, accounting:0, production:0, wastage:0, recipe:0, shifts:1, points:1, promo:1, reports:0, audit:0, users:0, profil:1, settings:0, schedule:0 },
        marketing:   { dashboard:1, pos:0, cogs:0, analytics:1, orders:1, customers:1, invoice:0, products:0, inventory:0, suppliers:0, purchase:0, finance:0, accounting:0, production:0, wastage:0, recipe:0, shifts:0, points:1, promo:1, reports:1, audit:0, users:0, profil:1, settings:0, schedule:0, subscriptions:1, purchases:0 },
        barista:     { dashboard:1, pos:1, cogs:0, analytics:0, orders:1, customers:1, invoice:0, products:0, inventory:0, suppliers:0, purchase:0, finance:0, accounting:0, production:0, wastage:1, recipe:1, shifts:1, points:1, promo:0, reports:0, audit:0, users:0, profil:1, settings:0, schedule:1 },
      },
    }));
  }

  if ((s.ingredients || []).length === 0) {
    [
      ['I001','Kopi Robusta','g',5000,500,85,'Toko Kopi Jaya'],
      ['I002','Susu UHT','ml',20000,2000,17,'Distributor Susu'],
      ['I003','Gula Aren Cair','ml',5000,500,32,'Petani Aren Subang'],
      ['I004','Matcha Powder','g',300,50,520,'Import'],
      ['I005','SKM','g',2000,200,24.8,'Indomaret'],
      ['I006','Brown Sugar Syrup','ml',300,300,28,'Supplier Lokal'],
      ['I010','Botol PET 250ml','pcs',500,100,1200,'CV Plastik Mandiri'],
      ['I011','Label Stiker','lembar',500,100,500,'Percetakan Abadi'],
      ['I012','Tutup Botol','pcs',500,100,300,'CV Plastik Mandiri'],
    ].forEach(([id, nama, satuan, stok, minStok, harga, supplier]) => {
      app.repos.ingredients.create({ id, nama, satuan, stok, minStok, harga, supplier, leadTimeDays: 7 });
    });
  }

  if ((s.products || []).length === 0) {
    [
      ['P001','Kopi Susu Gula Aren','Kopi','KSA-001',7185,720,350,1800,15,10000,8500,300,'botol',10,50],
      ['P002','Matcha Latte','Matcha','MTL-001',6014,720,350,1500,15,10000,8500,300,'botol',10,40],
      ['P003','Brown Sugar Milk','Susu','BSM-001',4400,720,350,1800,15,10000,8500,300,'botol',8,30],
      ['P004','Taro Latte','Seasonal','TRL-001',5070,720,350,1800,15,12000,10000,300,'botol',5,20],
      ['P005','Pandan Latte','Seasonal','PDL-001',4460,720,350,1800,15,12000,10000,300,'botol',5,3],
    ].forEach(([id,name,cat,sku,bb,tk,oh,km,mtk,sell,gros,wt,sat,minStk,stock]) => {
      app.repos.products.create({
        id, name, cat, sku, supId:'',
        bb, tk, oh, km, kg:0, mtk, sell, gros, wt, sat, minStk,
        stock,
        photo: '',
        barista: {
          sop: name === 'Kopi Susu Gula Aren'
            ? 'Tarik espresso 2 shot (18g, 27ml, 25-30s) → tuang gula aren cair 30ml → tambahkan susu UHT 200ml dingin → es batu secukupnya'
            : `SOP standar ${name}`,
          yieldMl: 250, tempC: 4, timeS: 90,
        },
      });
    });
  }

  if (!s.recipes || Object.keys(s.recipes).length === 0) {
    app.repos.recipes.set({
      P001: [
        { id: 'I001', qty: 18, kind: 'ingredient' },
        { id: 'I002', qty: 200, kind: 'ingredient' },
        { id: 'I003', qty: 30, kind: 'ingredient' },
        { id: 'I010', qty: 1, kind: 'ingredient' },
        { id: 'I011', qty: 1, kind: 'ingredient' },
        { id: 'I012', qty: 1, kind: 'ingredient' },
      ],
      P002: [
        { id: 'I004', qty: 8, kind: 'ingredient' },
        { id: 'I002', qty: 200, kind: 'ingredient' },
        { id: 'I010', qty: 1, kind: 'ingredient' },
      ],
      P003: [
        { id: 'I006', qty: 30, kind: 'ingredient' },
        { id: 'I002', qty: 200, kind: 'ingredient' },
        { id: 'I010', qty: 1, kind: 'ingredient' },
      ],
    });
  }

  if ((s.suppliers || []).length === 0) {
    app.repos.suppliers.create({
      id: 'S001', name: 'Toko Kopi Jaya', pic: 'Pak Budi',
      wa: '08112345678', addr: 'Jl. Kopi No.1, Bandung', cat: 'Bahan Baku Kopi',
      term: 'cash', note: 'Kopi robusta grade A', createdAt: new Date().toISOString(),
    });
    app.repos.suppliers.create({
      id: 'S002', name: 'Distributor Susu Sejahtera', pic: 'Bu Lina',
      wa: '08112345679', addr: 'Cimahi', cat: 'Susu',
      term: 'net7', note: 'UHT full cream', createdAt: new Date().toISOString(),
    });
  }

  if ((s.promos || []).length === 0) {
    app.repos.promos.create({
      id: 'pmo-LAUNCH50', code: 'LAUNCH50',
      description: 'Diskon launching 5%', type: 'percent', value: 5,
      quota: 100, used: 0,
      validFrom: new Date(Date.now() - 7*86400000).toISOString(),
      validTo: new Date(Date.now() + 30*86400000).toISOString(),
      marketerId: '', active: true,
    });
  }

  // Sample order historis dengan field baru (tanpa DP).
  if ((s.orders || []).length === 0) {
    const days = [3, 5, 8, 10, 14, 18, 22];
    const products = ['P001', 'P002', 'P003', 'P004', 'P005'];
    const names    = ['Kopi Susu Gula Aren','Matcha Latte','Brown Sugar Milk','Taro Latte','Pandan Latte'];
    const sells    = [10000, 10000, 10000, 12000, 12000];
    days.forEach((d, i) => {
      const idx = i % 5;
      const ts = new Date(Date.now() - d * 86400000).toISOString();
      const qty = 2 + (i % 4);
      const sell = sells[idx];
      const total = qty * sell - (i === 2 ? Math.round(qty * sell * 0.1) : 0);
      const status = ['paid','partial','packing','shipped','pending','paid','partial'][i % 7];
      const id = `ORD-${String(i+1).padStart(4,'0')}`;
      app.repos.orders.create({
        id, buyer: ['Pak Budi','Ibu Rina','Mas Toni','Mbak Lisa','Pak Doni'][i % 5],
        wa: '0811000' + (1000 + i), city: ['Bandung','Jakarta','Bekasi','Bogor'][i % 4],
        pid: products[idx], pname: names[idx], qty, sell, total,
        disc: i === 2 ? 10 : 0, ongkir: 5000,
        status, batch: 'Batch Mei 2025',
        promoCode: '', marketerId: '', cashierId: '', shiftId: '',
        ts, hpp: 7185,
      });
      // Buat sample payment.
      if (status === 'paid' || status === 'packing' || status === 'shipped') {
        app.repos.payments.create({
          id: 'pay-' + id, orderId: id, amount: total + 5000,
          method: ['cash','transfer','qris'][i % 3], ref: '',
          receivedBy: '', shiftId: '', ts, note: 'Pembayaran demo',
        });
      } else if (status === 'partial') {
        app.repos.payments.create({
          id: 'pay-' + id, orderId: id, amount: Math.round((total + 5000) * 0.5),
          method: 'transfer', ref: '', receivedBy: '', shiftId: '',
          ts, note: 'Pembayaran sebagian',
        });
      }
    });
  }

  if ((s.schedules || []).length === 0) {
    app.repos.schedules.create({
      id: 'SCH-001', title: 'Produksi Batch Mingguan', type: 'produksi',
      start: nextMonday(8, 0), end: nextMonday(11, 0),
      recurrence: { freq: 'weekly', interval: 1, byWeekday: [1], until: addDays(60).toISOString(), count: 12 },
      notes: 'Produksi batch minuman kemasan',
    });
    app.repos.schedules.create({
      id: 'SCH-002', title: 'QC & Packing', type: 'produksi',
      start: nextMonday(13, 0), end: nextMonday(15, 0),
      recurrence: { freq: 'weekly', interval: 1, byWeekday: [1] },
      notes: 'Quality check + labeling',
    });
    app.repos.schedules.create({
      id: 'SCH-003', title: 'Kalibrasi mesin espresso', type: 'maintenance',
      start: addDays(2, 9, 0).toISOString(), end: addDays(2, 10, 0).toISOString(),
      recurrence: { freq: 'monthly', interval: 1 },
      notes: 'Maintenance bulanan',
    });
    app.repos.schedules.create({
      id: 'SCH-004', title: 'Review bagi hasil & poin', type: 'meeting',
      start: addDays(7, 19, 0).toISOString(), end: addDays(7, 20, 30).toISOString(),
      recurrence: { freq: 'monthly', interval: 1 },
    });
  }
}

function nextMonday(h, m) {
  const d = new Date(); d.setHours(h, m, 0, 0);
  const day = d.getDay();
  const offset = day === 1 ? 7 : (8 - day) % 7 || 7;
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}
function addDays(days, h = 0, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  if (h || m) d.setHours(h, m, 0, 0);
  return d;
}
