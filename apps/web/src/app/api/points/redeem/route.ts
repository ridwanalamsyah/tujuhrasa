import { NextResponse } from "next/server";
import { z } from "zod";
import { redeemPoints } from "@/lib/erp";

const Schema = z.object({
  email: z.string().email(),
  points: z.number().int().min(50).max(10000),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }
  const result = await redeemPoints(parsed.data.email, parsed.data.points);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
