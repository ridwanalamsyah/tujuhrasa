// src/lib/erp.ts
// Bridge ke ERP Tujuh Rasa (Supabase kv_store, key = tr_erp_v3:state).
//
// Konvensi:
// - ERP simpan SELURUH state aplikasi sebagai 1 row JSONB.
// - Untuk push (order/customer/payment/subscription/points), kita lakukan
//   read-modify-write: GET state -> append/merge -> upsert state.
// - Stok dipotong di state.products[i].stock saat order sukses.
// - Tidak melakukan push kalau ERP_SYNC_ENABLED=false.

const URL_ROOT = process.env.ERP_SUPABASE_URL?.replace(/\/$/, "") ?? "";
const ANON_KEY = process.env.ERP_SUPABASE_ANON_KEY ?? "";
const TABLE = process.env.ERP_TABLE ?? "kv_store";
const STATE_KEY = process.env.ERP_STATE_KEY ?? "tr_erp_v3:state";
const BATCH_NAME = process.env.ERP_BATCH_NAME ?? "Batch Mei 2026";
const ENABLED =
  (process.env.ERP_SYNC_ENABLED ?? "true").toLowerCase() !== "false" &&
  !!URL_ROOT &&
  !!ANON_KEY;

export const erpEnabled = ENABLED;
export const erpBatchName = BATCH_NAME;

type Product = {
  id: string;
  sku?: string;
  name: string;
  cat?: string;
  sat?: string;
  sell: number;
  gros?: number;
  stock: number;
  minStk?: number;
  photo?: string;
  barista?: { sop?: string; tempC?: number; timeS?: number; yieldMl?: number };
};

type Order = {
  id: string;
  ts: string;
  buyer: string;
  wa: string;
  city: string;
  pid: string;
  pname: string;
  qty: number;
  sell: number;
  disc: number;
  ongkir: number;
  total: number;
  hpp: number;
  status: "paid" | "partial" | "unpaid";
  batch: string;
  shiftId: string;
  cashierId: string;
  promoCode: string;
  marketerId: string;
};

type Payment = {
  id: string;
  ts: string;
  amount: number;
  method: string;
  ref: string;
  note: string;
  orderId: string;
  shiftId: string;
  receivedBy: string;
};

type Customer = {
  id: string;
  name: string;
  wa: string;
  email: string;
  city: string;
  totalSpend: number;
  orderCount: number;
  joinedAt: string;
};

type Subscription = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  plan: "weekly" | "biweekly" | "monthly";
  bottlesPerBox: number;
  preference: string;
  address: string;
  status: "active" | "paused" | "cancelled";
  createdAt: string;
};

type PromoState = {
  code: string;
  kind: "percent" | "amount";
  value: number;
  minSubtotal?: number;
  active?: boolean;
};

type PointsActivity = {
  id: string;
  ts: string;
  customerEmail: string;
  customerName: string;
  kind: string;
  points: number;
  refOrderId: string;
  note: string;
};

type ErpState = {
  products?: Product[];
  orders?: Order[];
  payments?: Payment[];
  customers?: Customer[];
  subscriptions?: Subscription[];
  promos?: PromoState[];
  pointsActivities?: PointsActivity[];
  settings?: Record<string, unknown>;
  [k: string]: unknown;
};

function headers(extra: Record<string, string> = {}) {
  return {
    apikey: ANON_KEY,
    Authorization: "Bearer " + ANON_KEY,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function fetchState(): Promise<ErpState> {
  if (!ENABLED) return {};
  const url = `${URL_ROOT}/rest/v1/${TABLE}?key=eq.${encodeURIComponent(STATE_KEY)}&select=value`;
  const r = await fetch(url, { headers: headers(), cache: "no-store" });
  if (!r.ok) throw new Error(`ERP fetchState ${r.status}`);
  const rows = (await r.json()) as { value: ErpState }[];
  return rows[0]?.value ?? {};
}

async function writeState(state: ErpState): Promise<void> {
  if (!ENABLED) return;
  const url = `${URL_ROOT}/rest/v1/${TABLE}?on_conflict=key`;
  const r = await fetch(url, {
    method: "POST",
    headers: headers({
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify({ key: STATE_KEY, value: state }),
  });
  if (!r.ok) throw new Error(`ERP writeState ${r.status}: ${await r.text()}`);
}

function nextOrderId(orders: Order[] = []): string {
  let max = 0;
  for (const o of orders) {
    const m = /^ORD-(\d+)$/.exec(o.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `ORD-${String(max + 1).padStart(4, "0")}`;
}

function nextCustomerId(customers: Customer[] = []): string {
  let max = 0;
  for (const c of customers) {
    const m = /^C(\d+)$/.exec(c.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `C${String(max + 1).padStart(4, "0")}`;
}

function nextSubscriptionId(subs: Subscription[] = []): string {
  let max = 0;
  for (const s of subs) {
    const m = /^SUB-(\d+)$/.exec(s.id);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `SUB-${String(max + 1).padStart(4, "0")}`;
}

export type WebOrderPayload = {
  webOrderNumber: string;
  buyer: string;
  wa: string;
  email: string;
  city: string;
  items: {
    sku: string;
    name: string;
    rasa: string;
    qty: number;
    sellIdr: number;
    grosIdr: number;
  }[];
  ongkirIdr: number;
  discountIdr: number;
  totalIdr: number;
  paymentMethod: string;
  paymentChannel?: string;
  promoCode?: string;
  status: "paid" | "unpaid" | "partial";
};

export type ErpPushResult = {
  ok: boolean;
  erpOrderIds?: string[];
  customerId?: string;
  error?: string;
};

/**
 * Push order ke ERP. Karena ERP punya "1 produk per row order", web order
 * dengan banyak item dipecah jadi N order rows di ERP, satu per item.
 * Stok di state.products[*] juga dikurangi sesuai sku.
 */
export async function pushOrderToErp(
  payload: WebOrderPayload
): Promise<ErpPushResult> {
  if (!ENABLED) return { ok: false, error: "ERP sync disabled" };

  try {
    const state = await fetchState();
    state.orders = state.orders ?? [];
    state.payments = state.payments ?? [];
    state.products = state.products ?? [];
    state.customers = state.customers ?? [];
    state.pointsActivities = state.pointsActivities ?? [];

    const ts = new Date().toISOString();

    // Upsert customer (dedupe by wa or email)
    const existingCustomer = state.customers.find(
      (c) => (c.wa && c.wa === payload.wa) || (c.email && c.email === payload.email)
    );
    let customerId: string;
    if (existingCustomer) {
      existingCustomer.totalSpend = (existingCustomer.totalSpend ?? 0) + payload.totalIdr;
      existingCustomer.orderCount = (existingCustomer.orderCount ?? 0) + 1;
      customerId = existingCustomer.id;
    } else {
      customerId = nextCustomerId(state.customers);
      state.customers.push({
        id: customerId,
        name: payload.buyer,
        wa: payload.wa,
        email: payload.email,
        city: payload.city,
        totalSpend: payload.totalIdr,
        orderCount: 1,
        joinedAt: ts,
      });
    }

    // Allocate ongkir/disc proportionally across items (so each ERP order row reflects share)
    const itemSubtotal = payload.items.reduce(
      (s, it) => s + it.sellIdr * it.qty,
      0
    );
    const erpOrderIds: string[] = [];

    for (const it of payload.items) {
      const itemTotalSell = it.sellIdr * it.qty;
      const share = itemSubtotal > 0 ? itemTotalSell / itemSubtotal : 1 / payload.items.length;
      const ongkirShare = Math.round(payload.ongkirIdr * share);
      const discShare = Math.round(payload.discountIdr * share);
      // ERP convention: `total` = subtotal item saja (sell*qty - disc).
      // Field `ongkir` ditampilkan terpisah; ERP dashboard menjumlahkan
      // total + ongkir untuk display final, jadi jangan dobel-jumlah di sini.
      const total = itemTotalSell - discShare;

      // Lookup ERP product by sku (so stock decrement bisa hit row yang benar)
      const erpProduct = state.products.find(
        (p) => p.sku === it.sku || p.name === it.name
      );
      const pid = erpProduct?.id ?? `WEB-${it.sku}`;

      // Decrement stock
      if (erpProduct) {
        erpProduct.stock = Math.max(0, (erpProduct.stock ?? 0) - it.qty);
      } else {
        // Auto-create produk virtual di ERP supaya kelihatan di dashboard
        const newPid = `WEB-${it.sku}`;
        if (!state.products.find((p) => p.id === newPid)) {
          state.products.push({
            id: newPid,
            sku: it.sku,
            name: it.name,
            cat: "Kopi Botol Web",
            sat: "botol",
            sell: it.sellIdr,
            gros: it.grosIdr,
            stock: 0,
            minStk: 10,
            photo: "",
          });
        }
      }

      const orderId = nextOrderId(state.orders);
      const orderRow: Order = {
        id: orderId,
        ts,
        buyer: payload.buyer,
        wa: payload.wa,
        city: payload.city,
        pid,
        pname: it.name,
        qty: it.qty,
        sell: it.sellIdr,
        disc: discShare,
        ongkir: ongkirShare,
        total,
        hpp: it.grosIdr * it.qty,
        status: payload.status,
        batch: BATCH_NAME,
        shiftId: "",
        cashierId: "web-checkout",
        promoCode: payload.promoCode ?? "",
        marketerId: "",
      };
      state.orders.push(orderRow);
      erpOrderIds.push(orderId);

      // Payment row per order (ERP convention: pay-{orderId})
      if (payload.status === "paid") {
        state.payments.push({
          id: `pay-${orderId}`,
          ts,
          amount: total,
          method: payload.paymentMethod,
          ref: payload.webOrderNumber,
          note: `Web checkout · ${payload.paymentChannel ?? payload.paymentMethod}`,
          orderId,
          shiftId: "",
          receivedBy: "web",
        });
      }
    }

    // Earn points: revenuePerMillion (default 2 poin per Rp1jt) + newCustomer (10) jika first order
    const cfg = (state.settings as Record<string, unknown>)?.pointsConfig as
      | { output?: { revenuePerMillion?: number; newCustomer?: number } }
      | undefined;
    const ptsRevenue = Math.round(
      (payload.totalIdr / 1_000_000) * (cfg?.output?.revenuePerMillion ?? 2)
    );
    if (ptsRevenue > 0) {
      state.pointsActivities.push({
        id: `pts-${Date.now()}-rev`,
        ts,
        customerEmail: payload.email,
        customerName: payload.buyer,
        kind: "revenuePerMillion",
        points: ptsRevenue,
        refOrderId: erpOrderIds[0] ?? "",
        note: `Order ${payload.webOrderNumber} (Rp ${payload.totalIdr.toLocaleString("id-ID")})`,
      });
    }
    if (!existingCustomer) {
      const ptsNew = cfg?.output?.newCustomer ?? 10;
      state.pointsActivities.push({
        id: `pts-${Date.now()}-new`,
        ts,
        customerEmail: payload.email,
        customerName: payload.buyer,
        kind: "newCustomer",
        points: ptsNew,
        refOrderId: erpOrderIds[0] ?? "",
        note: "Pelanggan baru via web",
      });
    }

    await writeState(state);
    return { ok: true, erpOrderIds, customerId };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export type SubscriptionPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  plan: "weekly" | "biweekly" | "monthly";
  bottlesPerBox: number;
  preference: string;
  address: string;
};

export async function pushSubscriptionToErp(
  payload: SubscriptionPayload
): Promise<{ ok: boolean; erpId?: string; error?: string }> {
  if (!ENABLED) return { ok: false, error: "ERP sync disabled" };
  try {
    const state = await fetchState();
    state.subscriptions = state.subscriptions ?? [];
    // Upsert by email
    const existing = state.subscriptions.find(
      (s) => s.customerEmail === payload.customerEmail
    );
    const ts = new Date().toISOString();
    let id: string;
    if (existing) {
      Object.assign(existing, payload, { status: "active" });
      id = existing.id;
    } else {
      id = nextSubscriptionId(state.subscriptions);
      state.subscriptions.push({
        id,
        ...payload,
        status: "active",
        createdAt: ts,
      });
    }
    await writeState(state);
    return { ok: true, erpId: id };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function getErpStockBySku(): Promise<Record<string, number>> {
  if (!ENABLED) return {};
  try {
    const state = await fetchState();
    const map: Record<string, number> = {};
    for (const p of state.products ?? []) {
      if (p.sku) map[p.sku] = p.stock;
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Snapshot ERP product (operational fields only) keyed by SKU.
 * Web menggabungkan ini dengan konten lokal (story, brewTip, foto, dll.).
 */
export type ErpProductSnapshot = {
  id: string;
  sku: string;
  name: string;
  cat: string;
  sat?: string;
  sell: number;
  gros?: number;
  stock: number;
  minStk?: number;
};

/** Full ERP product (semua field yang kepakai di web), termasuk barista SOP. */
export type ErpProductFull = {
  id: string;
  sku: string;
  name: string;
  cat: string;
  sat?: string;
  sell: number;
  gros?: number;
  stock: number;
  minStk?: number;
  photo?: string;
  barista?: {
    sop?: string;
    tempC?: number;
    timeS?: number;
    yieldMl?: number;
  };
};

/**
 * Ambil semua produk dari ERP state.products[]. Web pakai ini sebagai sumber
 * utama menu (vs. local Prisma yang hanya memberi konten naratif sebagai overlay).
 */
export async function fetchErpProducts(): Promise<ErpProductFull[]> {
  if (!ENABLED) return [];
  try {
    const state = await fetchState();
    return (state.products ?? []).map((p) => ({
      id: p.id,
      sku: p.sku ?? "",
      name: p.name ?? "",
      cat: p.cat ?? "",
      sat: p.sat,
      sell: p.sell ?? 0,
      gros: p.gros,
      stock: p.stock ?? 0,
      minStk: p.minStk,
      photo: p.photo,
      barista: p.barista,
    }));
  } catch {
    return [];
  }
}

export async function fetchErpProductsBySku(): Promise<Record<string, ErpProductSnapshot>> {
  if (!ENABLED) return {};
  try {
    const state = await fetchState();
    const map: Record<string, ErpProductSnapshot> = {};
    for (const p of state.products ?? []) {
      if (!p.sku) continue;
      map[p.sku] = {
        id: p.id,
        sku: p.sku,
        name: p.name,
        cat: p.cat ?? "",
        sat: p.sat,
        sell: p.sell,
        gros: p.gros,
        stock: p.stock,
        minStk: p.minStk,
      };
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Idempotent: pastikan setiap SKU yang dikirim ada di ERP state.products[].
 * Yang sudah ada disinkronkan harga/HPP/min-stoknya. Yang belum dibuat
 * dengan stock awal sesuai `defaultStock` (default 100).
 */
export async function ensureErpProducts(
  items: Array<{
    sku: string;
    name: string;
    cat?: string;
    sat?: string;
    sell: number;
    gros: number;
    minStk?: number;
    photo?: string;
    barista?: { sop?: string; tempC?: number; timeS?: number; yieldMl?: number };
  }>,
  defaultStock = 100
): Promise<{ ok: boolean; created: string[]; updated: string[]; error?: string }> {
  if (!ENABLED) return { ok: false, created: [], updated: [], error: "ERP disabled" };
  try {
    const state = await fetchState();
    state.products = state.products ?? [];
    const created: string[] = [];
    const updated: string[] = [];

    let nextNum = 0;
    for (const p of state.products) {
      const m = /^P0*(\d+)$/.exec(p.id ?? "");
      if (m) nextNum = Math.max(nextNum, parseInt(m[1], 10));
    }

    for (const it of items) {
      const existing = state.products.find((p) => p.sku === it.sku);
      if (existing) {
        // Sinkronkan field operasional (jangan override stock yang sudah jalan).
        existing.name = it.name;
        existing.cat = it.cat ?? existing.cat ?? "Kopi Botol";
        existing.sat = it.sat ?? existing.sat ?? "botol";
        existing.sell = it.sell;
        existing.gros = it.gros;
        if (it.minStk != null) existing.minStk = it.minStk;
        if (it.photo) existing.photo = it.photo;
        if (it.barista) existing.barista = { ...(existing.barista ?? {}), ...it.barista };
        updated.push(it.sku);
      } else {
        nextNum += 1;
        const id = `P${String(nextNum).padStart(3, "0")}`;
        state.products.push({
          id,
          sku: it.sku,
          name: it.name,
          cat: it.cat ?? "Kopi Botol",
          sat: it.sat ?? "botol",
          sell: it.sell,
          gros: it.gros,
          stock: defaultStock,
          minStk: it.minStk ?? 10,
          photo: it.photo ?? "",
          barista: it.barista,
        });
        created.push(it.sku);
      }
    }

    await writeState(state);
    return { ok: true, created, updated };
  } catch (e: unknown) {
    return {
      ok: false,
      created: [],
      updated: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function lookupErpPromo(
  code: string,
  subtotalIdr: number
): Promise<
  | { ok: true; kind: "percent" | "amount"; value: number; discountIdr: number }
  | { ok: false; reason: string }
> {
  if (!code) return { ok: false, reason: "Kode promo kosong." };
  if (!ENABLED) return { ok: false, reason: "ERP belum tersambung." };
  try {
    const state = await fetchState();
    const promos = (state.promos ?? []) as PromoState[];
    const found = promos.find(
      (p) => p.code?.toUpperCase() === code.toUpperCase() && p.active !== false
    );
    if (!found) return { ok: false, reason: "Kode tidak ditemukan." };
    if (found.minSubtotal && subtotalIdr < found.minSubtotal) {
      return {
        ok: false,
        reason: `Minimum belanja Rp ${found.minSubtotal.toLocaleString("id-ID")}.`,
      };
    }
    const discountIdr =
      found.kind === "percent"
        ? Math.round((subtotalIdr * found.value) / 100)
        : found.value;
    return { ok: true, kind: found.kind, value: found.value, discountIdr };
  } catch (e: unknown) {
    return {
      ok: false,
      reason: e instanceof Error ? e.message : "Gagal cek promo.",
    };
  }
}

export type LiveActivity = {
  buyer: string;
  city: string;
  pname: string;
  qty: number;
  ts: string;
  agoMin: number;
};

export type LiveStats = {
  bottlesToday: number;
  ordersToday: number;
  revenueWeek: number;
  activeMenu: number;
  totalCustomers: number;
  topProducts: { name: string; qty: number }[];
  recentActivities: LiveActivity[];
  inProgress: { pname: string; qty: number; etaMin: number; tempC: number; sop: string } | null;
  open: boolean;
  openHourLabel: string;
  todayBarista: { name: string; emoji: string } | null;
};

const BARISTA_ROSTER = [
  { name: "Mas Yudha", emoji: "👨‍🍳" },
  { name: "Mbak Rara", emoji: "👩‍🍳" },
  { name: "Pak Dirman", emoji: "🧑‍🍳" },
  { name: "Kak Bayu", emoji: "🧔" },
  { name: "Bu Sari", emoji: "👩‍🦰" },
];

export async function fetchLiveStats(): Promise<LiveStats> {
  const empty: LiveStats = {
    bottlesToday: 0,
    ordersToday: 0,
    revenueWeek: 0,
    activeMenu: 0,
    totalCustomers: 0,
    topProducts: [],
    recentActivities: [],
    inProgress: null,
    open: true,
    openHourLabel: "08:00 – 22:00",
    todayBarista: null,
  };
  if (!ENABLED) return empty;
  let state: ErpState;
  try {
    state = await fetchState();
  } catch {
    return empty;
  }
  const orders = (state.orders ?? []) as Order[];
  const products = (state.products ?? []) as Product[];
  const customers = (state.customers ?? []) as Customer[];

  const now = Date.now();
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const startTodayMs = startToday.getTime();
  const startWeekMs = now - 7 * 24 * 3600 * 1000;

  let bottlesToday = 0;
  let ordersToday = 0;
  let revenueWeek = 0;
  const productAgg = new Map<string, number>();
  for (const o of orders) {
    const t = new Date(o.ts).getTime();
    if (Number.isNaN(t)) continue;
    if (t >= startTodayMs) {
      bottlesToday += o.qty;
      ordersToday++;
    }
    if (t >= startWeekMs) {
      revenueWeek += o.total;
    }
    productAgg.set(o.pname, (productAgg.get(o.pname) ?? 0) + o.qty);
  }
  const topProducts = Array.from(productAgg.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3);

  const recentActivities: LiveActivity[] = orders
    .slice()
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 8)
    .map((o) => {
      const t = new Date(o.ts).getTime();
      const agoMin = Math.max(1, Math.round((now - t) / 60000));
      const buyerInitial =
        o.buyer && o.buyer.length > 0
          ? o.buyer.split(/\s+/)[0] +
            " " +
            (o.buyer.split(/\s+/)[1]?.charAt(0) ?? "") +
            "."
          : "Pelanggan";
      return {
        buyer: buyerInitial.trim(),
        city: o.city || "Jakarta",
        pname: o.pname,
        qty: o.qty,
        ts: o.ts,
        agoMin,
      };
    });

  // In progress: pakai order paling baru dengan estimasi 8-15 menit
  const latest = orders
    .slice()
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())[0];
  let inProgress: LiveStats["inProgress"] = null;
  if (latest) {
    const product = products.find(
      (p) => p.id === latest.pid || p.name === latest.pname
    );
    inProgress = {
      pname: latest.pname,
      qty: latest.qty,
      etaMin: 8 + Math.floor(Math.random() * 8),
      tempC: product?.barista?.tempC ?? 92,
      sop: product?.barista?.sop ?? "Diseduh & dibotolkan dengan resep kafe.",
    };
  }

  // Buka/tutup: cek jam di Asia/Jakarta (server is UTC, +7)
  const jakartaHour = (new Date(now + 7 * 3600 * 1000).getUTCHours() + 24) % 24;
  const open = jakartaHour >= 8 && jakartaHour < 22;

  // Barista hari ini: rotate by day-of-year
  const dayOfYear = Math.floor((now - new Date(new Date().getUTCFullYear(), 0, 0).getTime()) / 86400000);
  const todayBarista = BARISTA_ROSTER[dayOfYear % BARISTA_ROSTER.length];

  return {
    bottlesToday,
    ordersToday,
    revenueWeek,
    activeMenu: products.filter((p) => p.stock > 0).length,
    totalCustomers: customers.length,
    topProducts,
    recentActivities,
    inProgress,
    open,
    openHourLabel: "08:00 – 22:00",
    todayBarista,
  };
}

// ────────────────────────────────────────────────────────────────────────
// Loyalty: poin, stamp card, tier
// ────────────────────────────────────────────────────────────────────────

export type CustomerProfile = {
  id: string;
  name: string;
  wa: string;
  email: string;
  city: string;
  totalSpend: number;
  orderCount: number;
  joinedAt: string;
};

export type LoyaltyData = {
  found: boolean;
  customer: CustomerProfile | null;
  pointsBalance: number;
  pointsEarned: number;
  pointsRedeemed: number;
  activities: PointsActivity[];
  tier: { name: string; min: number; next: { name: string; min: number } | null };
  ordersTotal: number;
  freeAtCount: number;
  recentOrders: { id: string; ts: string; pname: string; qty: number; total: number; status: string }[];
};

const TIERS = [
  { name: "Pendatang", min: 0 },
  { name: "Tetangga", min: 100_000 },
  { name: "Sahabat", min: 500_000 },
  { name: "Saudagar", min: 2_000_000 },
];

function tierOf(spend: number) {
  let curr = TIERS[0];
  let next: { name: string; min: number } | null = TIERS[1];
  for (let i = 0; i < TIERS.length; i++) {
    if (spend >= TIERS[i].min) {
      curr = TIERS[i];
      next = TIERS[i + 1] ?? null;
    }
  }
  return { name: curr.name, min: curr.min, next };
}

export async function fetchLoyaltyData(email: string): Promise<LoyaltyData> {
  const empty: LoyaltyData = {
    found: false,
    customer: null,
    pointsBalance: 0,
    pointsEarned: 0,
    pointsRedeemed: 0,
    activities: [],
    tier: { name: "Pendatang", min: 0, next: { name: "Tetangga", min: 100_000 } },
    ordersTotal: 0,
    freeAtCount: 10,
    recentOrders: [],
  };
  if (!ENABLED || !email) return empty;
  let state: ErpState;
  try {
    state = await fetchState();
  } catch {
    return empty;
  }
  const target = email.trim().toLowerCase();
  const customers = (state.customers ?? []) as Customer[];
  const customer =
    customers.find((c) => (c.email ?? "").toLowerCase() === target) ?? null;
  if (!customer) return empty;

  const acts = (state.pointsActivities ?? []) as PointsActivity[];
  const userActs = acts
    .filter((a) => (a.customerEmail ?? "").toLowerCase() === target)
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  let earned = 0;
  let redeemed = 0;
  for (const a of userActs) {
    if (a.kind === "redeem") redeemed += Math.abs(a.points);
    else earned += a.points;
  }

  const orders = (state.orders ?? []) as Order[];
  const userOrders = orders
    .filter((o) => (o.wa && customer.wa && o.wa === customer.wa) || (o.buyer && o.buyer === customer.name))
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());

  return {
    found: true,
    customer,
    pointsBalance: earned - redeemed,
    pointsEarned: earned,
    pointsRedeemed: redeemed,
    activities: userActs,
    tier: tierOf(customer.totalSpend),
    ordersTotal: userOrders.length,
    freeAtCount: 10,
    recentOrders: userOrders.slice(0, 5).map((o) => ({
      id: o.id,
      ts: o.ts,
      pname: o.pname,
      qty: o.qty,
      total: o.total,
      status: o.status,
    })),
  };
}

export async function redeemPoints(
  email: string,
  points: number
): Promise<{ ok: true; promoCode: string; discountIdr: number } | { ok: false; error: string }> {
  if (!ENABLED) return { ok: false, error: "ERP disabled" };
  if (points < 50) return { ok: false, error: "Minimum tukar 50 poin." };
  try {
    const state = await fetchState();
    const target = email.trim().toLowerCase();
    const customers = (state.customers ?? []) as Customer[];
    const customer = customers.find(
      (c) => (c.email ?? "").toLowerCase() === target
    );
    if (!customer) return { ok: false, error: "Email tidak ditemukan." };

    const acts = ((state.pointsActivities ?? []) as PointsActivity[]).filter(
      (a) => (a.customerEmail ?? "").toLowerCase() === target
    );
    const balance = acts.reduce(
      (s, a) => s + (a.kind === "redeem" ? -Math.abs(a.points) : a.points),
      0
    );
    if (balance < points)
      return { ok: false, error: `Poinmu hanya ${balance}.` };

    // 1 poin = Rp 1.000 diskon (rate ramah)
    const discountIdr = points * 1000;
    const code = `POIN-${Date.now().toString().slice(-6)}-${customer.id.slice(-4)}`;

    state.pointsActivities = state.pointsActivities ?? [];
    state.pointsActivities.push({
      id: `pts-${Date.now()}-redeem`,
      ts: new Date().toISOString(),
      customerEmail: customer.email,
      customerName: customer.name,
      kind: "redeem",
      points: -points,
      refOrderId: code,
      note: `Tukar ${points} poin → ${code} (Rp ${discountIdr.toLocaleString("id-ID")})`,
    });

    state.promos = (state.promos ?? []) as PromoState[];
    state.promos.push({
      code,
      kind: "amount",
      value: discountIdr,
      minSubtotal: 0,
      active: true,
    });

    await writeState(state);
    return { ok: true, promoCode: code, discountIdr };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal tukar poin.",
    };
  }
}

export async function dailyCheckin(
  email: string
): Promise<{ ok: true; points: number; streak: number } | { ok: false; error: string; streak?: number }> {
  if (!ENABLED) return { ok: false, error: "ERP disabled" };
  try {
    const state = await fetchState();
    const target = email.trim().toLowerCase();
    const customers = (state.customers ?? []) as Customer[];
    const customer = customers.find(
      (c) => (c.email ?? "").toLowerCase() === target
    );
    if (!customer) return { ok: false, error: "Email belum punya akun. Pesan dulu yuk." };

    const acts = (state.pointsActivities ?? []) as PointsActivity[];
    const today = new Date().toISOString().slice(0, 10);
    const already = acts.find(
      (a) =>
        (a.customerEmail ?? "").toLowerCase() === target &&
        a.kind === "checkin" &&
        a.ts.slice(0, 10) === today
    );
    if (already)
      return { ok: false, error: "Sudah check-in hari ini. Balik besok ya!", streak: 0 };

    // streak: hitung berturut-turut hari sebelumnya
    let streak = 1;
    for (let d = 1; d < 14; d++) {
      const ymd = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
      const found = acts.find(
        (a) =>
          (a.customerEmail ?? "").toLowerCase() === target &&
          a.kind === "checkin" &&
          a.ts.slice(0, 10) === ymd
      );
      if (found) streak++;
      else break;
    }
    const earned = streak >= 7 ? 5 : streak >= 3 ? 3 : 1;
    state.pointsActivities = state.pointsActivities ?? [];
    state.pointsActivities.push({
      id: `pts-${Date.now()}-checkin`,
      ts: new Date().toISOString(),
      customerEmail: customer.email,
      customerName: customer.name,
      kind: "checkin",
      points: earned,
      refOrderId: "",
      note: `Check-in harian (streak ${streak})`,
    });
    await writeState(state);
    return { ok: true, points: earned, streak };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Gagal check-in.",
    };
  }
}

export type RsvpEntry = {
  id: string;
  ts: string;
  name: string;
  wa: string;
  city: string;
  email?: string;
  guests: number;
  eventSlug: string;
  notes?: string;
};

export async function pushRsvp(
  entry: Omit<RsvpEntry, "id" | "ts">
): Promise<{ ok: boolean; error?: string }> {
  if (!ENABLED) return { ok: false, error: "ERP disabled" };
  try {
    const state = await fetchState();
    const list = (state.rsvps ?? []) as RsvpEntry[];
    list.push({
      ...entry,
      id: `RSVP-${Date.now()}`,
      ts: new Date().toISOString(),
    });
    state.rsvps = list;
    await writeState(state);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export type WishlistEntry = {
  id: string;
  ts: string;
  email: string;
  name?: string;
  wa?: string;
  sku: string;
  pname: string;
  notify: "stock" | "price" | "general";
};

export async function pushWishlist(
  entry: Omit<WishlistEntry, "id" | "ts">
): Promise<{ ok: boolean; error?: string }> {
  if (!ENABLED) return { ok: false, error: "ERP disabled" };
  try {
    const state = await fetchState();
    const list = (state.wishlists ?? []) as WishlistEntry[];
    // dedupe by email + sku + notify
    const exists = list.find(
      (w) =>
        w.email.toLowerCase() === entry.email.toLowerCase() &&
        w.sku === entry.sku &&
        w.notify === entry.notify
    );
    if (!exists) {
      list.push({
        ...entry,
        id: `WL-${Date.now()}`,
        ts: new Date().toISOString(),
      });
      state.wishlists = list;
      await writeState(state);
    }
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchWishlistByEmail(
  email: string
): Promise<WishlistEntry[]> {
  if (!ENABLED) return [];
  try {
    const state = await fetchState();
    const list = (state.wishlists ?? []) as WishlistEntry[];
    return list.filter(
      (w) => w.email.toLowerCase() === email.trim().toLowerCase()
    );
  } catch {
    return [];
  }
}

export type ReviewEntry = {
  id: string;
  ts: string;
  sku: string;
  pname: string;
  rating: number;
  customer: string;
  email: string;
  comment: string;
};

export async function pushReview(
  entry: Omit<ReviewEntry, "id" | "ts">
): Promise<{ ok: boolean; error?: string }> {
  if (!ENABLED) return { ok: false, error: "ERP disabled" };
  try {
    const state = await fetchState();
    const list = (state.reviews ?? []) as ReviewEntry[];
    list.push({
      ...entry,
      id: `RV-${Date.now()}`,
      ts: new Date().toISOString(),
    });
    state.reviews = list;
    await writeState(state);
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function fetchReviewsBySku(sku: string): Promise<ReviewEntry[]> {
  if (!ENABLED) return [];
  try {
    const state = await fetchState();
    const list = (state.reviews ?? []) as ReviewEntry[];
    return list
      .filter((r) => r.sku === sku)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  } catch {
    return [];
  }
}
