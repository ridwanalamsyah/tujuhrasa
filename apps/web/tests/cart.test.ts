import { describe, it, expect, vi } from "vitest";

// cart.ts impor `next/headers` + `./prisma` (server-only). Untuk unit test
// fungsi murni (`cartTotals`, `formatRp`) kita stub modul-modul tersebut
// supaya importnya tidak crash di Node runtime.
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => undefined,
  }),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

import { cartTotals, formatRp, type CartWithItems } from "@/lib/cart";

// Helper minimal CartWithItems shape (cuma field yang dipakai cartTotals)
function mkCart(
  items: { qty: number; price: number }[]
): CartWithItems {
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
        sku: `SKU-${i}`,
        name: `Prod ${i}`,
        rasa: "manis",
        priceCents: it.price,
        gros: 0,
        // sisanya tidak diakses oleh cartTotals
      },
    })),
  } as unknown as CartWithItems;
}

describe("cartTotals", () => {
  it("returns zero totals for null/empty cart", () => {
    expect(cartTotals(null)).toEqual({
      itemCount: 0,
      subtotalCents: 0,
      shippingCents: 0,
      totalCents: 0,
    });
  });

  it("counts items and sums subtotal", () => {
    const cart = mkCart([
      { qty: 2, price: 10_000 },
      { qty: 3, price: 12_000 },
    ]);
    const t = cartTotals(cart);
    expect(t.itemCount).toBe(5);
    expect(t.subtotalCents).toBe(2 * 10_000 + 3 * 12_000);
  });

  it("charges flat Rp 15.000 shipping when subtotal < 150k", () => {
    const cart = mkCart([{ qty: 1, price: 12_000 }]);
    const t = cartTotals(cart);
    expect(t.shippingCents).toBe(15_000);
    expect(t.totalCents).toBe(12_000 + 15_000);
  });

  it("free shipping at subtotal >= 150k (boundary)", () => {
    const cart = mkCart([{ qty: 15, price: 10_000 }]);
    const t = cartTotals(cart);
    expect(t.subtotalCents).toBe(150_000);
    expect(t.shippingCents).toBe(0);
    expect(t.totalCents).toBe(150_000);
  });

  it("free shipping clearly above threshold", () => {
    const cart = mkCart([{ qty: 10, price: 30_000 }]);
    const t = cartTotals(cart);
    expect(t.shippingCents).toBe(0);
    expect(t.totalCents).toBe(300_000);
  });

  it("empty items array → 0 shipping (not the 15k flat)", () => {
    const cart = mkCart([]);
    const t = cartTotals(cart);
    expect(t.subtotalCents).toBe(0);
    expect(t.shippingCents).toBe(0);
    expect(t.totalCents).toBe(0);
  });
});

describe("formatRp", () => {
  it("formats Indonesian rupiah with dot separators", () => {
    expect(formatRp(0)).toBe("Rp 0");
    expect(formatRp(10_000)).toBe("Rp 10.000");
    expect(formatRp(1_234_567)).toBe("Rp 1.234.567");
  });
});
