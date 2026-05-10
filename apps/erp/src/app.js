// src/app.js
// Composition Root. Tempat seluruh dependency dirangkai.
// Layer: storage → kv → store → repos → services → controllers.

import { LocalStorageAdapter, MemoryStorageAdapter, KVStore } from './core/storage.js';
import { Store } from './core/store.js';
import { CollectionRepository, SingletonRepository } from './core/repository.js';
import { Schemas, SCHEMA_VERSION } from './core/schemas.js';
import { ErrorHandler } from './core/errorHandler.js';
import { bus } from './core/eventBus.js';
import { logger } from './core/logger.js';

import { AuthService, RBACService } from './services/auth.service.js';
import { AuditService } from './services/audit.service.js';
import { ProductService } from './services/product.service.js';
import { InventoryService } from './services/inventory.service.js';
import { OrderService } from './services/order.service.js';
import { PaymentService } from './services/payment.service.js';
import { LedgerService } from './services/ledger.service.js';
import { FinanceService } from './services/finance.service.js';
import { ScheduleEngine } from './services/scheduleEngine.service.js';
import { ReminderEngine } from './services/reminder.service.js';
import { ProgressEngine } from './services/progressEngine.service.js';
import { BackupService } from './services/backup.service.js';
import { WastageService } from './services/wastage.service.js';
import { ProductionService } from './services/production.service.js';
import { TimesheetService } from './services/timesheet.service.js';
import { PointsService } from './services/points.service.js';
import { ShiftService } from './services/shift.service.js';
import { PromoService } from './services/promo.service.js';
import { PdfService } from './services/pdf.service.js';
import { ApprovalService } from './services/approval.service.js';
import { NotificationService } from './services/notification.service.js';
import { PrinterService } from './services/printer.service.js';
import { CustomerAnalyticsService } from './services/customerAnalytics.service.js';
import { AiInsightService } from './services/aiInsight.service.js';
import { ObservabilityService } from './services/observability.service.js';
import { AutoBackupService } from './services/autoBackup.service.js';
import { SubscriptionService } from './services/subscription.service.js';

export const INITIAL_STATE = Object.freeze({
  setupComplete: true,
  currentUser: null,
  users: [],
  products: [],
  ingredients: [],
  recipes: {},
  batches: [],
  suppliers: [],
  orders: [],
  payments: [],
  customers: [],
  purchaseOrders: [],
  productionOrders: [],
  wastages: [],
  accounts: [],
  journals: [],
  timesheets: [],
  pointsActivities: [],
  shifts: [],
  promos: [],
  mutations: [],
  schedules: [],
  notifications: [],
  subscriptions: [],
  auditLogs: [],
  posCart: [],                 // transient
  orderFilter: 'all',
  rbac: {},
  settings: {
    name: 'Tujuh Rasa', logo: '7R', logoUrl: '', tagline: 'Coffee & Beyond',
    color: '#C47040', address: '', phone: '', email: '', npwp: '',
    batch: '', bstatus: 0, openDate: '', shipDate: '',
    kr: 0, km: 0, pk: 0, ops: 0, ins: 0,
    waTplInvoice: '', waTplReminder: '', partnerNames: [],
    googleClientId: '789472760260-skskp86n4m641ljqm4sl404tbltksmtk.apps.googleusercontent.com',
    pointsConfig: {
      reinvestmentRate: 0.3,
      capPerUser: 0.4,
      enableCap: false,
      output: {
        orderReferral: 5, newCustomer: 10,
        productionQcPass: 3, zeroDefectDay: 5,
        revenuePerMillion: 2,
      },
    },
    approvalThreshold: 1_000_000,
    branchId: 'main',
    branchName: 'Pusat',
    autoBackup: true,
    sentryDsn: '',
    openaiKey: '',
  },
});

export function createApp({ storageAdapter, persistKey = 'state' } = {}) {
  // ─── Infrastructure ────────────────────────────────────────────────
  const adapter = storageAdapter || (typeof localStorage !== 'undefined'
    ? new LocalStorageAdapter()
    : new MemoryStorageAdapter());
  const kv = new KVStore(adapter, { namespace: 'tr_erp_v3' });

  const store = new Store(INITIAL_STATE, {
    kv,
    persistKey,
    // currentUser disimpan per-browser via localStorage 'tr_session', BUKAN
    // di-share lewat cloud — supaya tab incognito tidak auto-login.
    transientKeys: new Set(['posCart', 'orderFilter', 'currentUser']),
    migrate: (raw) => migrateState(raw),
  });

  const errors = new ErrorHandler({ bus, logger });
  errors.installGlobalHandlers();

  // ─── Repositories ──────────────────────────────────────────────────
  const repos = {
    users:           new CollectionRepository(store, 'users',          Schemas.User,             'users'),
    products:        new CollectionRepository(store, 'products',       Schemas.Product,          'products'),
    ingredients:     new CollectionRepository(store, 'ingredients',    Schemas.Ingredient,       'ingredients'),
    suppliers:       new CollectionRepository(store, 'suppliers',      Schemas.Supplier,         'suppliers'),
    orders:          new CollectionRepository(store, 'orders',         Schemas.Order,            'orders'),
    payments:        new CollectionRepository(store, 'payments',       Schemas.Payment,          'payments'),
    customers:       new CollectionRepository(store, 'customers',      Schemas.Customer,         'customers'),
    purchaseOrders:  new CollectionRepository(store, 'purchaseOrders', Schemas.PurchaseOrder,    'purchaseOrders'),
    productionOrders:new CollectionRepository(store, 'productionOrders',Schemas.ProductionOrder, 'productionOrders'),
    wastages:        new CollectionRepository(store, 'wastages',       Schemas.Wastage,          'wastages'),
    accounts:        new CollectionRepository(store, 'accounts',       Schemas.Account,          'accounts'),
    journals:        new CollectionRepository(store, 'journals',       Schemas.JournalEntry,     'journals'),
    timesheets:      new CollectionRepository(store, 'timesheets',     Schemas.Timesheet,        'timesheets'),
    pointsActivities:new CollectionRepository(store, 'pointsActivities',Schemas.PointsActivity,  'pointsActivities'),
    shifts:          new CollectionRepository(store, 'shifts',         Schemas.Shift,            'shifts'),
    promos:          new CollectionRepository(store, 'promos',         Schemas.Promo,            'promos'),
    schedules:       new CollectionRepository(store, 'schedules',      Schemas.ScheduleEvent,    'schedules'),
    settings:        new SingletonRepository(store, 'settings',        Schemas.Settings,         'settings'),
    // recipes adalah map keyed by productId; di-treat sebagai singleton dgn kontrak ringan.
    recipes:         new SingletonRepository(store, 'recipes',
      { type: 'object', additionalProperties: true, properties: {} }, 'recipes'),
  };

  // ─── Services ──────────────────────────────────────────────────────
  const audit = new AuditService(store);
  const auth  = new AuthService({ userRepo: repos.users, store, audit });
  const rbac  = new RBACService(store);

  const productSvc   = new ProductService({
    productRepo: repos.products, recipes: repos.recipes,
    ingredientRepo: repos.ingredients, store,
  });
  const inventorySvc = new InventoryService({
    productRepo: repos.products, ingredientRepo: repos.ingredients,
    recipes: repos.recipes, store,
  });
  const orderSvc     = new OrderService({
    orderRepo: repos.orders, productRepo: repos.products,
    customerRepo: repos.customers, inventory: inventorySvc,
    paymentRepo: repos.payments, store,
  });
  const paymentSvc   = new PaymentService({
    paymentRepo: repos.payments, orderRepo: repos.orders, orderSvc,
  });
  const ledgerSvc    = new LedgerService({
    accountRepo: repos.accounts, journalRepo: repos.journals,
    orderRepo: repos.orders, paymentRepo: repos.payments, productRepo: repos.products,
  });
  const wastageSvc   = new WastageService({
    wastageRepo: repos.wastages, ingredientRepo: repos.ingredients,
    productRepo: repos.products,
  });
  const productionSvc = new ProductionService({
    productionRepo: repos.productionOrders, productRepo: repos.products,
    inventory: inventorySvc, recipes: repos.recipes,
  });
  const timesheetSvc = new TimesheetService({
    timesheetRepo: repos.timesheets, userRepo: repos.users,
  });
  const pointsSvc    = new PointsService({
    pointsRepo: repos.pointsActivities, timesheetRepo: repos.timesheets,
    userRepo: repos.users, settingsRepo: repos.settings, orderRepo: repos.orders,
  });
  const shiftSvc     = new ShiftService({
    shiftRepo: repos.shifts, paymentRepo: repos.payments, orderRepo: repos.orders,
  });
  const promoSvc     = new PromoService({ promoRepo: repos.promos });
  const pdfSvc       = new PdfService({
    settingsRepo: repos.settings, productRepo: repos.products,
    customerRepo: repos.customers, supplierRepo: repos.suppliers,
    paymentRepo: repos.payments, ledger: ledgerSvc,
    accounts: repos.accounts, journals: repos.journals,
  });

  const financeSvc   = new FinanceService({
    orderRepo: repos.orders, productRepo: repos.products,
    settingsRepo: repos.settings, purchaseRepo: repos.purchaseOrders,
    paymentRepo: repos.payments, ledger: ledgerSvc,
  });
  const scheduleEngine = new ScheduleEngine({ scheduleRepo: repos.schedules });
  const reminderEngine = new ReminderEngine({
    store, orderRepo: repos.orders,
    productRepo: repos.products, ingredientRepo: repos.ingredients,
    scheduleEngine, purchaseRepo: repos.purchaseOrders,
  });
  const progressEngine = new ProgressEngine();
  const backup = new BackupService({ store, audit });

  // ─── New services (additive) ──────────────────────────────────────
  const approvalSvc = new ApprovalService({
    purchaseRepo: repos.purchaseOrders,
    settingsRepo: repos.settings,
    auth,
  });
  const notificationSvc = new NotificationService({
    orderRepo: repos.orders, paymentRepo: repos.payments,
    customerRepo: repos.customers, settingsRepo: repos.settings,
  });
  const printerSvc = new PrinterService({
    orderRepo: repos.orders, paymentRepo: repos.payments,
    productRepo: repos.products, settingsRepo: repos.settings,
  });
  const customerAnalytics = new CustomerAnalyticsService({
    orderRepo: repos.orders, customerRepo: repos.customers,
    paymentRepo: repos.payments,
  });
  const aiInsightSvc = new AiInsightService({
    finance: financeSvc, customerAnalytics,
    orderRepo: repos.orders, productRepo: repos.products,
    settingsRepo: repos.settings,
  });
  const observabilitySvc = new ObservabilityService({ settingsRepo: repos.settings });
  const autoBackupSvc = new AutoBackupService({ backupSvc: backup, settingsRepo: repos.settings, store });
  const subscriptionSvc = new SubscriptionService({
    store, orderRepo: repos.orders, productRepo: repos.products,
    customerRepo: repos.customers,
  });

  // ─── Auto-listeners (event-driven) ────────────────────────────────
  audit.attachAutoAudit({
    getCurrentUser: () => auth.getCurrentUser(),
    domains: ['users', 'products', 'ingredients', 'suppliers', 'orders', 'payments',
              'customers', 'purchaseOrders', 'productionOrders', 'wastages',
              'accounts', 'journals', 'shifts', 'promos', 'schedules'],
  });
  ledgerSvc.attachAutoPosting();
  pointsSvc.attachAutoListeners();

  // Saat harga ingredient berubah (PO diterima dgn harga baru),
  // sinkronkan HPP semua produk. Ini bagian dari "HPP-driven inventory revaluation".
  bus.on('inventory:received', () => {
    productSvc.syncBBFromRecipes();
  });

  return {
    store, kv, bus, errors, logger,
    repos,
    services: {
      auth, rbac, audit,
      product: productSvc, inventory: inventorySvc, order: orderSvc,
      payment: paymentSvc, ledger: ledgerSvc,
      wastage: wastageSvc, production: productionSvc,
      timesheet: timesheetSvc, points: pointsSvc,
      shift: shiftSvc, promo: promoSvc, pdf: pdfSvc,
      finance: financeSvc, scheduleEngine, reminderEngine, progressEngine,
      backup,
      approval: approvalSvc, notification: notificationSvc, printer: printerSvc,
      customerAnalytics, aiInsight: aiInsightSvc,
      observability: observabilitySvc, autoBackup: autoBackupSvc,
      subscription: subscriptionSvc,
    },
    async init() {
      await store.load();
      ledgerSvc.ensureDefaultCoA();
    },
  };
}

/**
 * Migrasi state lama → v3.
 * v1/v2 → v3 changes:
 *   - Product.stock: {bandung, transit, samarinda} → integer (jumlah).
 *   - Order: hilangkan field `dp`, status 'dp' → 'partial', 'lunas' → 'paid'.
 *   - User.pw plaintext tetap dipertahankan; akan di-hash saat login pertama.
 */
function migrateState(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const out = { ...raw };
  const ver = out.__schemaVersion || 1;

  if (ver < 3) {
    // Products: flatten stock multi-warehouse → single integer.
    if (Array.isArray(out.products)) {
      out.products = out.products.map((p) => {
        if (p.stock && typeof p.stock === 'object') {
          const sum = (p.stock.bandung || 0) + (p.stock.transit || 0) + (p.stock.samarinda || 0);
          return { ...p, stock: sum };
        }
        return p;
      });
    }
    // Orders: rename status, hapus dp.
    if (Array.isArray(out.orders)) {
      out.orders = out.orders.map((o) => {
        const next = { ...o };
        if (next.status === 'dp')    next.status = 'partial';
        if (next.status === 'lunas') next.status = 'paid';
        delete next.dp;
        return next;
      });
    }
  }

  // Pastikan koleksi baru ada.
  for (const k of [
    'payments', 'productionOrders', 'wastages', 'accounts', 'journals',
    'timesheets', 'pointsActivities', 'shifts', 'promos',
    'schedules', 'notifications', 'auditLogs', 'mutations', 'batches',
    'subscriptions',
  ]) {
    if (!Array.isArray(out[k])) out[k] = [];
  }

  // Settings backfill.
  out.settings = { ...INITIAL_STATE.settings, ...(out.settings || {}) };

  out.__schemaVersion = SCHEMA_VERSION;
  return out;
}

export { INITIAL_STATE as DEFAULT_INITIAL_STATE };
