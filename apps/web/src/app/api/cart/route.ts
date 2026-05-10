import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, cartTotals } from "@/lib/cart";

const AddSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(50).default(1),
});

export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json({ cart, ...cartTotals(cart) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = AddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cart = await getOrCreateCart();
  if (!cart) return NextResponse.json({ error: "no cart" }, { status: 500 });

  const existing = cart.items.find((i) => i.productId === parsed.data.productId);
  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + parsed.data.quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: parsed.data.productId,
        quantity: parsed.data.quantity,
      },
    });
  }
  const fresh = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } },
  });
  return NextResponse.json({ cart: fresh, ...cartTotals(fresh) });
}
