import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  pushOrderToErp,
  erpEnabled,
  type WebOrderPayload,
} from "@/lib/erp";

// erp.ts fetches Supabase via global fetch. Kita kontrol semua respons
// dengan mock fetch:
// - GET ?key=eq.tr_erp_v3:state  → state awal (terprogram per test)
// - POST table (writeState)      → 204, body kita simpan untuk assert
type Captured = { state?: Record<string, unknown> };

function setupFetch(initialState: Record<string, unknown>): Captured {
  const captured: Captured = {};
  const mock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : input.toString();
      if (!init || (init.method ?? "GET").toUpperCase() === "GET") {
        // fetchState returns array of { value }
        return new Response(JSON.stringify([{ value: initialState }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      // writeState
      const body = JSON.parse(init.body as string);
      captured.state = body.value as Record<string, unknown>;
      return new Response(null, { status: 204 });
    }
  );
  vi.stubGlobal("fetch", mock);
  return captured;
}

function basePayload(
  overrides: Partial<WebOrderPayload> = {}
): WebOrderPayload {
  return {
    webOrderNumber: "TR1234567",
    buyer: "Asep Setiawan",
    wa: "08123456789",
    email: "asep@example.com",
    city: "Bandung",
    items: [
      {
        sku: "TR-GULA-AREN",
        name: "Manis Gula Aren",
        rasa: "manis",
        qty: 2,
        sellIdr: 12_000,
        grosIdr: 6_000,
      },
    ],
    ongkirIdr: 15_000,
    discountIdr: 0,
    totalIdr: 39_000,
    paymentMethod: "xendit-ewallet",
    paymentChannel: "GOPAY",
    status: "paid",
    ...overrides,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-05-17T12:34:56.000Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("erpEnabled flag", () => {
  it("is true when ERP_SUPABASE_URL and ANON_KEY are set", () => {
    expect(erpEnabled).toBe(true);
  });
});

describe("pushOrderToErp — single item, new customer, member path", () => {
  it("creates customer with isMember=true, order row, payment, stock decrement, points", async () => {
    const captured = setupFetch({
      products: [
        {
          id: "P0001",
          sku: "TR-GULA-AREN",
          name: "Manis Gula Aren",
          sell: 12_000,
          stock: 10,
        },
      ],
      orders: [],
      payments: [],
      customers: [],
      pointsActivities: [],
    });

    const result = await pushOrderToErp(basePayload({ isMember: true }));

    expect(result.ok).toBe(true);
    expect(result.erpOrderIds).toHaveLength(1);
    expect(result.customerId).toMatch(/^C\d{4}$/);

    const s = captured.state as {
      customers: Array<{
        id: string;
        name: string;
        email: string;
        totalSpend: number;
        orderCount: number;
        isMember?: boolean;
        isGuest?: boolean;
      }>;
      orders: Array<{
        id: string;
        pid: string;
        qty: number;
        sell: number;
        total: number;
        ongkir: number;
        status: string;
      }>;
      payments: Array<{ orderId: string; amount: number; method: string }>;
      products: Array<{ sku: string; stock: number }>;
      pointsActivities: Array<{ kind: string; points: number }>;
    };

    // Customer baru, ditandai member
    expect(s.customers).toHaveLength(1);
    expect(s.customers[0]).toMatchObject({
      name: "Asep Setiawan",
      email: "asep@example.com",
      totalSpend: 39_000,
      orderCount: 1,
      isMember: true,
    });
    expect(s.customers[0].isGuest).toBeUndefined();

    // Order row mengacu ke ERP product id (bukan WEB-* fallback)
    expect(s.orders).toHaveLength(1);
    expect(s.orders[0]).toMatchObject({
      pid: "P0001",
      qty: 2,
      sell: 12_000,
      total: 24_000, // sell*qty - disc
      ongkir: 15_000,
      status: "paid",
    });

    // Payment dibuat untuk status paid
    expect(s.payments).toHaveLength(1);
    expect(s.payments[0]).toMatchObject({
      amount: 24_000,
      method: "xendit-ewallet",
      orderId: s.orders[0].id,
    });

    // Stok produk berkurang 2
    expect(s.products.find((p) => p.sku === "TR-GULA-AREN")?.stock).toBe(8);

    // Points: newCustomer (10) + revenuePerMillion (round(0.039 * 2) = 0)
    const newCustPts = s.pointsActivities.find((p) => p.kind === "newCustomer");
    expect(newCustPts?.points).toBe(10);
  });
});

describe("pushOrderToErp — guest path", () => {
  it("creates customer with isGuest=true & isMember=false (no member flag)", async () => {
    const captured = setupFetch({
      products: [
        {
          id: "P0001",
          sku: "TR-GULA-AREN",
          name: "Manis Gula Aren",
          sell: 12_000,
          stock: 5,
        },
      ],
    });

    const result = await pushOrderToErp(basePayload({ isMember: false }));

    expect(result.ok).toBe(true);
    const s = captured.state as {
      customers: Array<{
        isMember?: boolean;
        isGuest?: boolean;
      }>;
    };
    expect(s.customers[0]).toMatchObject({
      isMember: false,
      isGuest: true,
    });
  });

  it("treats undefined isMember as guest (default)", async () => {
    const captured = setupFetch({ products: [], customers: [] });
    await pushOrderToErp(basePayload({ isMember: undefined }));
    const s = captured.state as {
      customers: Array<{ isMember?: boolean; isGuest?: boolean }>;
    };
    expect(s.customers[0].isMember).toBe(false);
    expect(s.customers[0].isGuest).toBe(true);
  });
});

describe("pushOrderToErp — existing customer promote guest → member", () => {
  it("flips isMember to true when repeat order arrives in member mode", async () => {
    const captured = setupFetch({
      customers: [
        {
          id: "C0001",
          name: "Asep Setiawan",
          wa: "08123456789",
          email: "asep@example.com",
          city: "Bandung",
          totalSpend: 24_000,
          orderCount: 1,
          joinedAt: "2026-05-01T00:00:00.000Z",
          isMember: false,
          isGuest: true,
        },
      ],
      products: [],
    });

    const result = await pushOrderToErp(basePayload({ isMember: true }));
    expect(result.ok).toBe(true);

    const s = captured.state as {
      customers: Array<{
        id: string;
        totalSpend: number;
        orderCount: number;
        isMember?: boolean;
      }>;
    };
    expect(s.customers).toHaveLength(1);
    expect(s.customers[0]).toMatchObject({
      id: "C0001",
      totalSpend: 24_000 + 39_000,
      orderCount: 2,
      isMember: true,
    });
  });
});

describe("pushOrderToErp — multi-item ongkir allocation", () => {
  it("splits ongkir proportionally across items and creates one order row per item", async () => {
    const captured = setupFetch({
      products: [
        { id: "P0001", sku: "A", name: "A", sell: 10_000, stock: 10 },
        { id: "P0002", sku: "B", name: "B", sell: 30_000, stock: 10 },
      ],
    });

    const payload = basePayload({
      items: [
        {
          sku: "A",
          name: "A",
          rasa: "manis",
          qty: 1,
          sellIdr: 10_000,
          grosIdr: 5_000,
        },
        {
          sku: "B",
          name: "B",
          rasa: "pahit",
          qty: 1,
          sellIdr: 30_000,
          grosIdr: 12_000,
        },
      ],
      ongkirIdr: 16_000,
      totalIdr: 56_000,
    });

    await pushOrderToErp(payload);
    const s = captured.state as {
      orders: Array<{ pid: string; ongkir: number; total: number }>;
    };

    expect(s.orders).toHaveLength(2);
    const a = s.orders.find((o) => o.pid === "P0001");
    const b = s.orders.find((o) => o.pid === "P0002");
    // 10000 / 40000 = 0.25 * 16000 = 4000
    expect(a?.ongkir).toBe(4_000);
    // 30000 / 40000 = 0.75 * 16000 = 12000
    expect(b?.ongkir).toBe(12_000);
    // jumlah ongkir per item sama dengan total ongkir
    expect((a?.ongkir ?? 0) + (b?.ongkir ?? 0)).toBe(16_000);
  });
});

describe("pushOrderToErp — unknown SKU auto-creates virtual product", () => {
  it("inserts WEB-SKU product row with stock 0 when ERP product not found", async () => {
    const captured = setupFetch({ products: [] });

    await pushOrderToErp(
      basePayload({
        items: [
          {
            sku: "BARU-99",
            name: "Rasa Eksperimen",
            rasa: "test",
            qty: 1,
            sellIdr: 10_000,
            grosIdr: 4_000,
          },
        ],
      })
    );

    const s = captured.state as {
      products: Array<{ id: string; sku: string; name: string; stock: number }>;
      orders: Array<{ pid: string }>;
    };
    const virtual = s.products.find((p) => p.sku === "BARU-99");
    expect(virtual).toBeDefined();
    expect(virtual?.id).toBe("WEB-BARU-99");
    expect(virtual?.stock).toBe(0);
    expect(s.orders[0].pid).toBe("WEB-BARU-99");
  });
});

describe("pushOrderToErp — unpaid (COD) does not create payment row", () => {
  it("skips payment when status=unpaid", async () => {
    const captured = setupFetch({
      products: [
        { id: "P0001", sku: "TR-GULA-AREN", name: "Manis Gula Aren", sell: 12_000, stock: 10 },
      ],
    });

    await pushOrderToErp(
      basePayload({ status: "unpaid", paymentMethod: "cod", paymentChannel: "COD" })
    );

    const s = captured.state as { payments: unknown[] };
    expect(s.payments).toHaveLength(0);
  });
});

describe("pushOrderToErp — error path", () => {
  it("returns { ok: false, error } when fetch throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );
    const result = await pushOrderToErp(basePayload());
    expect(result.ok).toBe(false);
    expect(result.error).toContain("network down");
  });
});
