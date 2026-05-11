import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchWishlistByEmail, pushWishlist } from "@/lib/erp";

const Schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  wa: z.string().optional(),
  sku: z.string().min(1),
  pname: z.string().min(1),
  notify: z.enum(["stock", "price", "general"]).default("general"),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }
  const result = await pushWishlist(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  if (!email)
    return NextResponse.json({ items: [] }, { status: 400 });
  const items = await fetchWishlistByEmail(email);
  return NextResponse.json({ items });
}
