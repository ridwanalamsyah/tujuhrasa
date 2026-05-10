import { NextResponse } from "next/server";
import { z } from "zod";
import { dailyCheckin } from "@/lib/erp";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
  }
  const result = await dailyCheckin(parsed.data.email);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json(result);
}
