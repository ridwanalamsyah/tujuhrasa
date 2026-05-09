import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { erpEnabled, pushSubscriptionToErp } from "@/lib/erp";

const Schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  plan: z.enum(["weekly", "biweekly", "monthly"]),
  bottlesPerBox: z.number().int().min(2).max(14),
  preference: z.string().min(2),
  address: z.string().min(5),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const data = {
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    customerPhone: parsed.data.customerPhone ?? "",
    plan: parsed.data.plan,
    bottlesPerBox: parsed.data.bottlesPerBox,
    preference: parsed.data.preference,
    address: parsed.data.address,
  };
  const sub = await prisma.subscription.upsert({
    where: { customerEmail: parsed.data.customerEmail },
    create: data,
    update: data,
  });

  if (erpEnabled) {
    const result = await pushSubscriptionToErp({
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      customerPhone: sub.customerPhone,
      plan: sub.plan as "weekly" | "biweekly" | "monthly",
      bottlesPerBox: sub.bottlesPerBox,
      preference: sub.preference,
      address: sub.address,
    });
    await prisma.subscription.update({
      where: { id: sub.id },
      data: result.ok
        ? { erpSyncStatus: "synced", erpSyncedAt: new Date() }
        : { erpSyncStatus: "failed", erpSyncError: result.error ?? "" },
    });
    await prisma.erpSyncLog.create({
      data: {
        resource: "subscription",
        resourceId: sub.id,
        action: "push",
        status: result.ok ? "success" : "error",
        message: result.ok ? `ERP sub id: ${result.erpId}` : (result.error ?? ""),
      },
    });
  } else {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { erpSyncStatus: "skipped" },
    });
  }

  const fresh = await prisma.subscription.findUnique({ where: { id: sub.id } });
  return NextResponse.json({ subscription: fresh ?? sub });
}

export async function GET() {
  const subs = await prisma.subscription.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(subs);
}
