import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getOrCreateCart, cartTotals } from "@/lib/cart";

const PatchSchema = z.object({
  quantity: z.number().int().min(0).max(50),
});

export async function PATCH(req: Request, { params }: { params: { itemId: string } }) {
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const id = Number(params.itemId);
  if (parsed.data.quantity === 0) {
    await prisma.cartItem.delete({ where: { id } }).catch(() => {});
  } else {
    await prisma.cartItem.update({
      where: { id },
      data: { quantity: parsed.data.quantity },
    });
  }
  const cart = await getOrCreateCart();
  return NextResponse.json({ cart, ...cartTotals(cart) });
}

export async function DELETE(_req: Request, { params }: { params: { itemId: string } }) {
  const id = Number(params.itemId);
  await prisma.cartItem.delete({ where: { id } }).catch(() => {});
  const cart = await getOrCreateCart();
  return NextResponse.json({ cart, ...cartTotals(cart) });
}
