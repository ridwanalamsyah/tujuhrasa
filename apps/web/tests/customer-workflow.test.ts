import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Skenario customer end-to-end (mock storage). Tujuannya:
// menggambarkan jalur pembeli dari menambahkan ke cart sampai ERP
// menerima order — keduanya untuk path "member" dan path "guest".
//
// Bukan E2E browser; ini integration test pada library layer:
//   cartTotals  →  CheckoutSchema.parse  →  pushOrderToErp
// dengan Supabase ERP di-stub via global.fetch.

vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => undefined, set: () => undefined }),
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { cartTotals, type CartWithItems } from "@/lib/cart";
import { CheckoutSchema } from "@/lib/checkout-schema";
import { pushOrderToErp } from "@/lib/erp";

function mkCart(items: { qty: number; price: number; sku: string; name: string }[]) {
  return {
    id: "cart-test",
    items: items.map((it, i) => ({
      id: `i${i}`,
      cartId: "cart-test",
      productId: `p${i}`,
      quantity: it.qty,
      addedAt: new Date(),
      product: {
        id: `p${i}`,
        slug: `prod-${i}`,
        sku: it.sku,
        name: it.name,
        rasa: "manis",
        priceCents: it.price,
        gros: Math.floor(it.price * 0.4),
      },
    })),
  } as unknown as CartWithItems;
}

type FetchMockState = { state?: Record<string, unknown> };
function stubErpFetch(initial: Record<string, unknown>): FetchMockState {
  const cap: FetchMockState = {};
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_: unknown, init?: RequestInit) => {
      if (!init || (init.method ?? "GET").toUpperCase() === "GET") {
        return new Response(JSON.stringify([{ value: initial }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      cap.state = JSON.parse(init.body as string).value;
      return new Response(null, { status: 204 });
    })
  );
  return cap;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-17T13:00:00.000Z"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const FORM_BASE = {
  customerName: "Asep Mahasiswa",
  customerEmail: "asep@example.com",
  customerPhone: "08123456789",
  shippingAddress: "Jl. A.H. Nasution No. 105, Cibiru",
  shippingCity: "Bandung",
  shippingZip: "40614",
  paymentMethod: "gopay" as const,
};

describe("Customer workflow — member path", () => {
  it("cart → schema valid → ERP sync flags isMember=true", async () => {
    // 1. Customer membangun cart 2 botol matcha @ 13k = 26k → di bawah 150k → 15k ongkir.
    const cart = mkCart([
      { qty: 2, sku: "TR-MATCHA", name: "Matcha Latte", price: 13_000 },
    ]);
    const t = cartTotals(cart);
    expect(t.subtotalCents).toBe(26_000);
    expect(t.shippingCents).toBe(15_000);
    expect(t.totalCents).toBe(41_000);

    // 2. Form di-submit dengan mode "member"
    const parsed = CheckoutSchema.safeParse({
      ...FORM_BASE,
      accountMode: "member",
    });
    expect(parsed.success).toBe(true);

    // 3. ERP push — customer baru, member
    const captured = stubErpFetch({
      products: [
        {
          id: "P0001",
          sku: "TR-MATCHA",
          name: "Matcha Latte",
          sell: 13_000,
          stock: 20,
        },
      ],
    });
    const result = await pushOrderToErp({
      webOrderNumber: "TR9000001",
      buyer: FORM_BASE.customerName,
      wa: FORM_BASE.customerPhone,
      email: FORM_BASE.customerEmail,
      city: FORM_BASE.shippingCity,
      items: cart.items.map((it) => ({
        sku: it.product.sku,
        name: it.product.name,
        rasa: it.product.rasa,
        qty: it.quantity,
        sellIdr: it.product.priceCents,
        grosIdr: it.product.gros ?? 0,
      })),
      ongkirIdr: t.shippingCents,
      discountIdr: 0,
      totalIdr: t.totalCents,
      paymentMethod: "xendit-ewallet",
      paymentChannel: "GOPAY",
      status: "paid",
      isMember: true,
    });

    expect(result.ok).toBe(true);
    const s = captured.state as {
      customers: Array<{ email: string; isMember?: boolean; isGuest?: boolean }>;
      products: Array<{ sku: string; stock: number }>;
      orders: Array<{ pname: string; qty: number }>;
    };
    expect(s.customers[0].email).toBe(FORM_BASE.customerEmail);
    expect(s.customers[0].isMember).toBe(true);
    expect(s.customers[0].isGuest).toBeUndefined();
    expect(s.products[0].stock).toBe(18); // 20 - 2
    expect(s.orders[0]).toMatchObject({ pname: "Matcha Latte", qty: 2 });
  });
});

describe("Customer workflow — guest path", () => {
  it("free-shipping order (>=150k) tetap auto-create customer ERP dengan isGuest=true", async () => {
    // 1. Cart 15 botol gula aren @ 10k = 150k → free ongkir.
    const cart = mkCart([
      { qty: 15, sku: "TR-GULA-AREN", name: "Manis Gula Aren", price: 10_000 },
    ]);
    const t = cartTotals(cart);
    expect(t.subtotalCents).toBe(150_000);
    expect(t.shippingCents).toBe(0);
    expect(t.totalCents).toBe(150_000);

    // 2. Form submit guest
    const parsed = CheckoutSchema.safeParse({
      ...FORM_BASE,
      paymentMethod: "cod",
      accountMode: "guest",
    });
    expect(parsed.success).toBe(true);

    // 3. ERP push — status unpaid (COD), guest customer
    const captured = stubErpFetch({
      products: [
        {
          id: "P0002",
          sku: "TR-GULA-AREN",
          name: "Manis Gula Aren",
          sell: 10_000,
          stock: 30,
        },
      ],
    });
    const result = await pushOrderToErp({
      webOrderNumber: "TR9000002",
      buyer: FORM_BASE.customerName,
      wa: FORM_BASE.customerPhone,
      email: FORM_BASE.customerEmail,
      city: FORM_BASE.shippingCity,
      items: cart.items.map((it) => ({
        sku: it.product.sku,
        name: it.product.name,
        rasa: it.product.rasa,
        qty: it.quantity,
        sellIdr: it.product.priceCents,
        grosIdr: it.product.gros ?? 0,
      })),
      ongkirIdr: t.shippingCents,
      discountIdr: 0,
      totalIdr: t.totalCents,
      paymentMethod: "cod",
      paymentChannel: "COD",
      status: "unpaid",
      isMember: false,
    });

    expect(result.ok).toBe(true);
    const s = captured.state as {
      customers: Array<{ isMember?: boolean; isGuest?: boolean }>;
      payments: unknown[];
      products: Array<{ sku: string; stock: number }>;
    };
    // Guest path: order tetap sampai ke ERP, customer ditandai isGuest.
    expect(s.customers[0]).toMatchObject({ isMember: false, isGuest: true });
    // COD belum bayar → tidak ada payment row.
    expect(s.payments).toHaveLength(0);
    // Stok ERP berkurang 15.
    expect(s.products[0].stock).toBe(15);
  });
});

describe("Customer workflow — payment error path (network)", () => {
  it("ERP unreachable returns ok:false; client should fall back to retry UI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      })
    );
    const result = await pushOrderToErp({
      webOrderNumber: "TR9000003",
      buyer: FORM_BASE.customerName,
      wa: FORM_BASE.customerPhone,
      email: FORM_BASE.customerEmail,
      city: FORM_BASE.shippingCity,
      items: [
        {
          sku: "TR-MATCHA",
          name: "Matcha Latte",
          rasa: "manis",
          qty: 1,
          sellIdr: 13_000,
          grosIdr: 6_000,
        },
      ],
      ongkirIdr: 15_000,
      discountIdr: 0,
      totalIdr: 28_000,
      paymentMethod: "xendit-ewallet",
      paymentChannel: "GOPAY",
      status: "paid",
      isMember: false,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain("fetch failed");
  });
});
