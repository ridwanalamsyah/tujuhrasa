// src/core/schemas.js
// Schema kanonis untuk setiap entitas domain. Inilah "kontrak data" aplikasi.
// Setiap repository/service WAJIB memvalidasi input/output melawan schema ini.

import { v } from './validator.js';

export const ROLES = ['admin', 'koordinator', 'produksi', 'sales', 'marketing', 'barista'];
export const ORDER_STATUS = ['pending', 'partial', 'paid', 'packing', 'shipped', 'cancel'];
export const PAY_METHOD  = ['cash', 'transfer', 'qris', 'ewallet', 'card', 'other'];
export const PURCHASE_STATUS = ['draft', 'dipesan', 'sebagian', 'diterima', 'batal'];
export const ACCOUNT_KIND = ['asset', 'liability', 'equity', 'revenue', 'expense', 'cogs'];
export const PRODUCTION_STATUS = ['planned', 'in_progress', 'qc', 'done', 'cancelled'];
export const SHIFT_STATUS = ['open', 'closed', 'reconciled'];

export const Schemas = {
  // ───────────────────────── Identity & access ───────────────────────────────
  User: v.object({
    id:        v.string({ required: true }),
    name:      v.string({ required: true, minLength: 2, maxLength: 80 }),
    pos:       v.string({ maxLength: 80 }),
    email:     v.string({ required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: 'Email tidak valid' }),
    pwHash:    v.string(),                    // hash (PBKDF2-SHA-256), bukan plaintext.
    pwSalt:    v.string(),
    googleSub: v.string(),                    // Google subject id (sub claim) bila login Google.
    photo:     v.string(),                    // data URL atau URL Google.
    role:      v.enum(ROLES, { required: true }),
    wa:        v.string({ pattern: /^[0-9+\-\s]{8,20}$/, patternMessage: 'Nomor WA tidak valid' }),
    status:    v.enum(['active', 'pending', 'disabled'], { default: 'active' }),
    roleMultiplier: v.number({ min: 0, max: 5, default: 1 }), // pengali poin per jam kerja.
    createdAt: v.date(),
  }),

  // ───────────────────────── Catalog & inventory ─────────────────────────────
  Product: v.object({
    id:     v.string({ required: true }),
    name:   v.string({ required: true, minLength: 1 }),
    cat:    v.string({ required: true }),
    sku:    v.string(),
    supId:  v.string(),
    bb:     v.integer({ min: 0, default: 0 }),
    tk:     v.integer({ min: 0, default: 0 }),
    oh:     v.integer({ min: 0, default: 0 }),
    km:     v.integer({ min: 0, default: 0 }),
    kg:     v.integer({ min: 0, default: 0 }),
    mtk:    v.integer({ min: 0, max: 100, default: 15 }),
    sell:   v.integer({ min: 0, required: true }),
    gros:   v.integer({ min: 0, default: 0 }),
    wt:     v.integer({ min: 0, default: 0 }),
    sat:    v.string({ default: 'cup' }),
    minStk: v.integer({ min: 0, default: 0 }),
    stock:  v.integer({ min: 0, default: 0 }),  // single-location stock.
    photo:  v.string(),                          // data URL.
    barista: v.object({                          // recipe card untuk barista.
      sop:    v.string(),                        // langkah pembuatan.
      yieldMl:v.integer({ min: 0, default: 0 }), // hasil per cup.
      tempC:  v.integer({ min: 0 }),
      timeS:  v.integer({ min: 0 }),
    }),
  }),

  Ingredient: v.object({
    id:        v.string({ required: true }),
    nama:      v.string({ required: true }),
    satuan:    v.string({ required: true }),
    stok:      v.number({ min: 0, required: true }),
    minStok:   v.number({ min: 0, default: 0 }),
    harga:     v.number({ min: 0, required: true }),  // harga satuan terkini (weighted average).
    supplier:  v.string(),
    leadTimeDays: v.integer({ min: 0, default: 7 }),
  }),

  RecipeItem: v.object({
    id:  v.string({ required: true }),
    qty: v.number({ min: 0, required: true }),
    kind:v.enum(['ingredient', 'product'], { default: 'ingredient' }),  // BOM multi-level.
  }),

  Supplier: v.object({
    id:        v.string({ required: true }),
    name:      v.string({ required: true }),
    pic:       v.string(),
    wa:        v.string(),
    addr:      v.string(),
    cat:       v.string(),
    term:      v.enum(['cash', 'net7', 'net14', 'net30'], { default: 'cash' }),
    note:      v.string(),
    createdAt: v.date(),
  }),

  // ───────────────────────── Sales & customer ────────────────────────────────
  Order: v.object({
    id:     v.string({ required: true }),
    buyer:  v.string({ required: true, minLength: 2 }),
    wa:     v.string(),
    city:   v.string(),
    pid:    v.string({ required: true }),
    pname:  v.string({ required: true }),
    qty:    v.integer({ min: 1, required: true }),
    sell:   v.integer({ min: 0, required: true }),
    total:  v.integer({ min: 0, required: true }),
    disc:   v.integer({ min: 0, max: 100, default: 0 }),
    ongkir: v.integer({ min: 0, default: 0 }),
    status: v.enum(ORDER_STATUS, { required: true }),
    batch:  v.string(),
    promoCode: v.string(),                  // jejak promo → poin marketer.
    marketerId:v.string(),                  // user yang mendapat kredit.
    cashierId: v.string(),                  // shift kasir.
    shiftId:   v.string(),
    ts:     v.date({ required: true }),
    hpp:    v.integer({ min: 0, default: 0 }),  // HPP per unit pada saat checkout.
  }),

  Payment: v.object({
    id:        v.string({ required: true }),
    orderId:   v.string({ required: true }),
    amount:    v.integer({ min: 1, required: true }),
    method:    v.enum(PAY_METHOD, { required: true, default: 'cash' }),
    ref:       v.string(),                    // nomor referensi (transfer / qris ref).
    receivedBy:v.string(),                    // user id.
    shiftId:   v.string(),
    ts:        v.date({ required: true }),
    note:      v.string(),
  }),

  Customer: v.object({
    id:         v.string({ required: true }),
    name:       v.string({ required: true, minLength: 2 }),
    wa:         v.string(),
    city:       v.string(),
    email:      v.string({ pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, patternMessage: 'Email tidak valid' }),
    note:       v.string(),
    orders:     v.integer({ min: 0, default: 0 }),
    totalSpend: v.integer({ min: 0, default: 0 }),
    createdAt:  v.date(),
  }),

  // ───────────────────────── Procurement ─────────────────────────────────────
  PurchaseOrder: v.object({
    id:        v.string({ required: true }),
    supId:     v.string({ required: true }),
    items:     v.array(v.object({
      ingredientId: v.string({ required: true }),
      qty:          v.number({ min: 0, required: true }),
      price:        v.number({ min: 0, required: true }),
    })),
    qty:       v.number({ min: 0 }),
    price:     v.number({ min: 0 }),
    status:    v.enum(PURCHASE_STATUS, { required: true, default: 'draft' }),
    createdAt: v.date(),
    receivedAt:v.date(),
  }),

  // ───────────────────────── Manufacturing ───────────────────────────────────
  ProductionOrder: v.object({
    id:        v.string({ required: true }),
    productId: v.string({ required: true }),
    qtyPlanned:v.integer({ min: 1, required: true }),
    qtyDone:   v.integer({ min: 0, default: 0 }),
    status:    v.enum(PRODUCTION_STATUS, { required: true, default: 'planned' }),
    plannedAt: v.date(),
    startedAt: v.date(),
    finishedAt:v.date(),
    operatorId:v.string(),
    notes:     v.string(),
    qcPassFirst: v.boolean({ default: false }),  // first-pass QC pass → +poin produksi.
  }),

  Wastage: v.object({
    id:           v.string({ required: true }),
    refType:      v.enum(['ingredient', 'product'], { required: true }),
    refId:        v.string({ required: true }),
    qty:          v.number({ min: 0, required: true }),
    unitCost:     v.number({ min: 0, default: 0 }),
    totalCost:    v.number({ min: 0, default: 0 }),
    reason:       v.enum(['expired', 'damaged', 'spilled', 'sample', 'other'], { required: true }),
    note:         v.string(),
    reportedBy:   v.string(),
    ts:           v.date({ required: true }),
  }),

  // ───────────────────────── Accounting (GL) ─────────────────────────────────
  Account: v.object({
    id:       v.string({ required: true }),
    code:     v.string({ required: true }),    // mis. 1100, 4100.
    name:     v.string({ required: true }),
    kind:     v.enum(ACCOUNT_KIND, { required: true }),
    parentId: v.string(),
    archived: v.boolean({ default: false }),
  }),

  JournalEntry: v.object({
    id:       v.string({ required: true }),
    date:     v.date({ required: true }),
    memo:     v.string(),
    source:   v.string(),                       // 'order'|'payment'|'po'|'wastage'|'manual'|'adjust'.
    sourceId: v.string(),
    lines:    v.array(v.object({
      accountId: v.string({ required: true }),
      debit:     v.number({ min: 0, default: 0 }),
      credit:    v.number({ min: 0, default: 0 }),
      memo:      v.string(),
    }), { minItems: 2 }),
    reversedBy: v.string(),                     // jika dibalik.
    createdBy:  v.string(),
    createdAt:  v.date({ required: true }),
  }),

  // ───────────────────────── HR & profit-sharing ─────────────────────────────
  Timesheet: v.object({
    id:       v.string({ required: true }),
    userId:   v.string({ required: true }),
    checkIn:  v.date({ required: true }),
    checkOut: v.date(),
    hours:    v.number({ min: 0, default: 0 }),
    note:     v.string(),
    approvedBy: v.string(),
  }),

  PointsActivity: v.object({
    id:       v.string({ required: true }),
    userId:   v.string({ required: true }),
    kind:     v.string({ required: true }),     // 'effort_hours'|'order_referral'|'new_customer'|'production_qc'|'pos_revenue'|'manual_adjust'|'wastage_penalty'.
    points:   v.number({ required: true }),
    period:   v.string({ required: true }),     // 'YYYY-MM'.
    refType:  v.string(),
    refId:    v.string(),
    note:     v.string(),
    createdBy:v.string(),
    ts:       v.date({ required: true }),
  }),

  Shift: v.object({
    id:          v.string({ required: true }),
    cashierId:   v.string({ required: true }),
    openAt:      v.date({ required: true }),
    closeAt:     v.date(),
    openingCash: v.integer({ min: 0, default: 0 }),
    closingCash: v.integer({ min: 0, default: 0 }),
    expected:    v.integer({ default: 0 }),     // expected cash drawer pada tutup shift.
    variance:    v.integer({ default: 0 }),     // closing - expected.
    handoverNote:v.string(),
    status:      v.enum(SHIFT_STATUS, { required: true, default: 'open' }),
  }),

  // ───────────────────────── Promo & marketing ──────────────────────────────
  Promo: v.object({
    id:         v.string({ required: true }),
    code:       v.string({ required: true, pattern: /^[A-Z0-9_-]{2,20}$/ }),
    description:v.string(),
    type:       v.enum(['percent', 'amount'], { required: true, default: 'percent' }),
    value:      v.number({ min: 0, required: true }),
    quota:      v.integer({ min: 0, default: 0 }),     // 0 = unlimited.
    used:       v.integer({ min: 0, default: 0 }),
    validFrom:  v.date(),
    validTo:    v.date(),
    marketerId: v.string(),                            // user yang dapat kredit poin.
    active:     v.boolean({ default: true }),
  }),

  // ───────────────────────── Schedule & reminders ───────────────────────────
  ScheduleEvent: v.object({
    id:         v.string({ required: true }),
    title:      v.string({ required: true }),
    type:       v.enum(['produksi', 'pengiriman', 'meeting', 'maintenance', 'deadline', 'lainnya'], { required: true }),
    start:      v.date({ required: true }),
    end:        v.date({ required: true }),
    recurrence: v.object({
      freq:     v.enum(['none', 'daily', 'weekly', 'monthly']),
      interval: v.integer({ min: 1, default: 1 }),
      byWeekday:v.array(v.integer({ min: 0, max: 6 })),
      until:    v.date(),
      count:    v.integer({ min: 1 }),
    }),
    refId:      v.string(),
    notes:      v.string(),
  }),

  Reminder: v.object({
    id:        v.string({ required: true }),
    title:     v.string({ required: true }),
    dueAt:     v.date({ required: true }),
    severity:  v.enum(['info', 'warning', 'danger'], { default: 'info' }),
    refType:   v.string(),
    refId:     v.string(),
    dismissed: v.boolean({ default: false }),
  }),

  // ───────────────────────── Settings ────────────────────────────────────────
  Settings: v.object({
    name:     v.string({ required: true }),
    logo:     v.string(),                       // emoji/text or data URL.
    logoUrl:  v.string(),                       // optional uploaded logo data URL.
    tagline:  v.string(),
    color:    v.string({ pattern: /^#[0-9a-fA-F]{6}$/ }),
    address:  v.string(),
    phone:    v.string(),
    email:    v.string(),
    npwp:     v.string(),
    batch:    v.string(),
    bstatus:  v.integer({ min: 0, max: 5, default: 0 }),
    openDate: v.date(),
    shipDate: v.date(),
    kr:  v.integer({ min: 0, default: 0 }),
    km:  v.integer({ min: 0, default: 0 }),
    pk:  v.integer({ min: 0, default: 0 }),
    ops: v.integer({ min: 0, default: 0 }),
    ins: v.integer({ min: 0, default: 0 }),
    waTplInvoice:  v.string(),
    waTplReminder: v.string(),
    partnerNames:  v.array(v.string()),
    googleClientId: v.string(),                 // OAuth Web Client ID.
    pointsConfig: v.object({
      reinvestmentRate: v.number({ min: 0, max: 1, default: 0.3 }),
      capPerUser:       v.number({ min: 0, max: 1, default: 0.4 }),
      enableCap:        v.boolean({ default: false }),
      output: v.object({
        orderReferral:    v.number({ default: 5 }),
        newCustomer:      v.number({ default: 10 }),
        productionQcPass: v.number({ default: 3 }),
        zeroDefectDay:    v.number({ default: 5 }),
        revenuePerMillion:v.number({ default: 2 }),
      }),
    }),
    approvalThreshold: v.number({ min: 0, default: 1_000_000 }),
    branchId:          v.string({ default: 'main' }),
    branchName:        v.string({ default: 'Pusat' }),
    autoBackup:        v.boolean({ default: true }),
    sentryDsn:         v.string(),
    openaiKey:         v.string(),  // optional, untuk AI insight masa depan
  }),
};

// Versi schema untuk migrasi.
export const SCHEMA_VERSION = 3;
