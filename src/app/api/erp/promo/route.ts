import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { erpEnabled, lookupErpPromo } from "@/lib/erp";

const Schema = z.object({
  code: z.string().min(1),
  subtotal: z.number().int().nonnegative(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, reason: "Bad request" }, { status: 400 });
  }
  const code = parsed.data.code.trim().toUpperCase();
  const subtotal = parsed.data.subtotal;

  // Try ERP first
  if (erpEnabled) {
    const erp = await lookupErpPromo(code, subtotal);
    if (erp.ok) {
      return NextResponse.json({
        ok: true,
        source: "erp",
        code,
        kind: erp.kind,
        value: erp.value,
        discount: erp.discountIdr,
      });
    }
  }
  // Fallback to local promo table
  const local = await prisma.promoCode.findUnique({ where: { code } });
  if (!local || !local.active) {
    return NextResponse.json({ ok: false, reason: "Kode tidak ditemukan." });
  }
  if (subtotal < local.minSubtotal) {
    return NextResponse.json({
      ok: false,
      reason: `Minimum belanja Rp ${local.minSubtotal.toLocaleString("id-ID")}.`,
    });
  }
  if (local.maxRedemption > 0 && local.redeemedCount >= local.maxRedemption) {
    return NextResponse.json({ ok: false, reason: "Kuota promo habis." });
  }
  const discount =
    local.kind === "percent"
      ? Math.round((subtotal * local.value) / 100)
      : local.value;
  return NextResponse.json({
    ok: true,
    source: "local",
    code,
    kind: local.kind,
    value: local.value,
    discount,
  });
}
