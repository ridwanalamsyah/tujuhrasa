import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchReviewsBySku, pushReview } from "@/lib/erp";

const Schema = z.object({
  sku: z.string().min(1),
  pname: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  customer: z.string().min(2),
  email: z.string().email(),
  comment: z.string().min(5).max(500),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }
  const result = await pushReview(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sku = url.searchParams.get("sku") ?? "";
  if (!sku) return NextResponse.json({ items: [] }, { status: 400 });
  const items = await fetchReviewsBySku(sku);
  return NextResponse.json({ items });
}
