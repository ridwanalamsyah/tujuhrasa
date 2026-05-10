import { cookies } from "next/headers";
import { prisma } from "./prisma";

export const CART_COOKIE = "tujuhrasa_cart";

export async function getOrCreateCart() {
  const jar = cookies();
  let cartId = jar.get(CART_COOKIE)?.value;
  try {
    if (cartId) {
      const existing = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } },
      });
      if (existing) return existing;
    }
    const created = await prisma.cart.create({ data: {} });
    jar.set(CART_COOKIE, created.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    return prisma.cart.findUnique({
      where: { id: created.id },
      include: { items: { include: { product: true } } },
    });
  } catch {
    // DB unavailable — return null so UI gracefully shows empty state.
    return null;
  }
}

export async function getCart() {
  const jar = cookies();
  const cartId = jar.get(CART_COOKIE)?.value;
  if (!cartId) return null;
  try {
    return await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: true } } },
    });
  } catch {
    return null;
  }
}

export type CartWithItems = NonNullable<Awaited<ReturnType<typeof getOrCreateCart>>>;

export function cartTotals(cart: CartWithItems | null) {
  if (!cart) return { itemCount: 0, subtotalCents: 0, shippingCents: 0, totalCents: 0 };
  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotalCents = cart.items.reduce(
    (s, i) => s + i.product.priceCents * i.quantity,
    0
  );
  // Free shipping over Rp 150.000, otherwise Rp 15.000 flat
  const shippingCents = subtotalCents === 0 ? 0 : subtotalCents >= 150000 ? 0 : 15000;
  return {
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export function formatRp(cents: number) {
  return "Rp " + cents.toLocaleString("id-ID");
}
