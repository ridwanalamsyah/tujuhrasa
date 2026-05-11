import { NextResponse } from "next/server";
import { fetchLoyaltyData } from "@/lib/erp";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email") ?? "";
  if (!email) return NextResponse.json({ found: false }, { status: 400 });
  const data = await fetchLoyaltyData(email);
  return NextResponse.json(data);
}
