import { NextResponse } from "next/server";
import { z } from "zod";
import { pushRsvp } from "@/lib/erp";

const Schema = z.object({
  name: z.string().min(2),
  wa: z.string().min(7),
  city: z.string().min(2),
  email: z.string().email().optional(),
  guests: z.number().int().min(1).max(10),
  eventSlug: z.string().min(1),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }
  const result = await pushRsvp(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
