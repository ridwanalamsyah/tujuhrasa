import { NextResponse } from "next/server";
import { z } from "zod";
import { pushRsvp } from "@/lib/erp";

// Reuse RSVP-style structure for grosir/group-buy/pre-order
const Schema = z.object({
  type: z.enum(["grosir", "group-buy", "pre-order"]),
  name: z.string().min(2),
  wa: z.string().min(7),
  city: z.string().min(2),
  email: z.string().email().optional(),
  qty: z.number().int().min(1).max(1000),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }
  const result = await pushRsvp({
    name: parsed.data.name,
    wa: parsed.data.wa,
    city: parsed.data.city,
    email: parsed.data.email,
    guests: parsed.data.qty,
    eventSlug: parsed.data.type,
    notes: parsed.data.notes,
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
