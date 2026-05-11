import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CART_COOKIE, getCart, cartTotals } from "@/lib/cart";
import {
  pushOrderToErp,
  erpEnabled,
  erpBatchName,
  lookupErpPromo,
  getErpStockBySku,
} from "@/lib/erp";

const CheckoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  shippingAddress: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingZip: z.string().min(3),
  notes: z.string().optional(),
  paymentMethod: z.enum(["gopay", "ovo", "bca-va", "cod"]),
  promoCode: z.string().optional(),
  birthDate: z.string().optional(),
});

function nextOrderNumber() {
  return "TR" + Date.now().toString().slice(-7);
}

const PAYMENT_LABELS: Record<string, { method: string; channel: string }> = {
  gopay: { method: "xendit-ewallet", channel: "GOPAY" },
  ovo: { method: "xendit-ewallet", channel: "OVO" },
  "bca-va": { method: "xendit-va", channel: "BCA" },
  cod: { method: "cod", channel: "COD" },
};

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const cart = await getCart();
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }
  const totals = cartTotals(cart);

  // Stock guardrail: sebelum push order, fetch stok terbaru dari ERP dan
  // tolak kalau qty cart > stok yang tersedia. Mencegah race condition
  // antara cache 30 detik web vs. update stok ERP real-time.
  if (erpEnabled) {
    try {
      const erpStock = await getErpStockBySku();
      const insufficient: { name: string; sku: string; want: number; have: number }[] = [];
      for (const it of cart.items) {
        const sku = it.product.sku;
        const have = erpStock[sku];
        if (typeof have === "number" && it.quantity > have) {
          insufficient.push({
            name: it.product.name,
            sku,
            want: it.quantity,
            have,
          });
        }
      }
      if (insufficient.length > 0) {
        return NextResponse.json(
          {
            error: "stok_kurang",
            message:
              "Stok di ERP berkurang sejak kamu memasukkan ke keranjang. Silakan kurangi jumlah atau pilih botol lain.",
            insufficient,
          },
          { status: 409 }
        );
      }
    } catch {
      // ERP unreachable saat guardrail — lanjut tanpa block (degraded mode)
    }
  }

  // Promo: cek dulu ke ERP, kalau ada → potong di total
  let discountIdr = 0;
  let promoCodeApplied: string | null = null;
  if (parsed.data.promoCode && parsed.data.promoCode.trim()) {
    const result = await lookupErpPromo(
      parsed.data.promoCode.trim(),
      totals.subtotalCents
    );
    // fallback: cek juga di tabel web (kalau ERP belum ada)
    if (!result.ok) {
      const local = await prisma.promoCode.findUnique({
        where: { code: parsed.data.promoCode.trim().toUpperCase() },
      });
      if (
        local &&
        local.active &&
        totals.subtotalCents >= local.minSubtotal &&
        (local.maxRedemption === 0 || local.redeemedCount < local.maxRedemption)
      ) {
        discountIdr =
          local.kind === "percent"
            ? Math.round((totals.subtotalCents * local.value) / 100)
            : local.value;
        promoCodeApplied = local.code;
      }
    } else {
      discountIdr = result.discountIdr;
      promoCodeApplied = parsed.data.promoCode.trim().toUpperCase();
    }
    if (discountIdr > totals.subtotalCents) discountIdr = totals.subtotalCents;
  }
  const totalCents = totals.subtotalCents + totals.shippingCents - discountIdr;

  const hppCents = cart.items.reduce(
    (s, it) => s + (it.product.gros ?? 0) * it.quantity,
    0
  );

  const pay = PAYMENT_LABELS[parsed.data.paymentMethod] ?? {
    method: parsed.data.paymentMethod,
    channel: parsed.data.paymentMethod.toUpperCase(),
  };

  const order = await prisma.order.create({
    data: {
      orderNumber: nextOrderNumber(),
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone,
      shippingAddress: parsed.data.shippingAddress,
      shippingCity: parsed.data.shippingCity,
      shippingZip: parsed.data.shippingZip,
      notes: parsed.data.notes,
      paymentMethod: pay.method,
      paymentChannel: pay.channel,
      subtotalCents: totals.subtotalCents,
      shippingCents: totals.shippingCents,
      discountCents: discountIdr,
      hppCents,
      totalCents,
      promoCode: promoCodeApplied,
      status: parsed.data.paymentMethod === "cod" ? "unpaid" : "paid",
      batch: erpBatchName,
      items: {
        create: cart.items.map((it) => ({
          productId: it.productId,
          productSku: it.product.sku,
          productName: it.product.name,
          productRasa: it.product.rasa,
          quantity: it.quantity,
          unitPriceCents: it.product.priceCents,
          unitHppCents: it.product.gros ?? 0,
        })),
      },
      payments:
        parsed.data.paymentMethod === "cod"
          ? undefined
          : {
              create: [
                {
                  amountCents: totalCents,
                  method: pay.method,
                  channel: pay.channel,
                  status: "settled",
                  receivedBy: "web",
                },
              ],
            },
    },
    include: { items: true, payments: true },
  });

  // increment promo usage
  if (promoCodeApplied) {
    await prisma.promoCode
      .update({
        where: { code: promoCodeApplied },
        data: { redeemedCount: { increment: 1 } },
      })
      .catch(() => {});
  }

  // Empty cart, rotate cookie
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  cookies().delete(CART_COOKIE);

  // Push to ERP (best effort, async). Don't block order creation if ERP fails.
  if (erpEnabled) {
    const result = await pushOrderToErp({
      webOrderNumber: order.orderNumber,
      buyer: order.customerName,
      wa: order.customerPhone,
      email: order.customerEmail,
      city: order.shippingCity,
      items: cart.items.map((it) => ({
        sku: it.product.sku,
        name: it.product.name,
        rasa: it.product.rasa,
        qty: it.quantity,
        sellIdr: it.product.priceCents,
        grosIdr: it.product.gros ?? 0,
      })),
      ongkirIdr: totals.shippingCents,
      discountIdr,
      totalIdr: totalCents,
      paymentMethod: pay.method,
      paymentChannel: pay.channel,
      promoCode: promoCodeApplied ?? undefined,
      status: order.status === "paid" ? "paid" : "unpaid",
    });
    if (result.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { erpSyncStatus: "synced", erpSyncedAt: new Date() },
      });
      await prisma.erpSyncLog.create({
        data: {
          resource: "order",
          resourceId: order.orderNumber,
          action: "push",
          status: "success",
          message: `ERP order ids: ${(result.erpOrderIds ?? []).join(", ")}`,
        },
      });
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { erpSyncStatus: "failed", erpSyncError: result.error ?? "" },
      });
      await prisma.erpSyncLog.create({
        data: {
          resource: "order",
          resourceId: order.orderNumber,
          action: "push",
          status: "error",
          message: result.error ?? "",
        },
      });
    }
  } else {
    await prisma.order.update({
      where: { id: order.id },
      data: { erpSyncStatus: "skipped" },
    });
  }

  return NextResponse.json({ order });
}
