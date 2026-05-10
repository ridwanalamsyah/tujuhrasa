import { NextResponse } from "next/server";
import { fetchLiveStats } from "@/lib/erp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const stats = await fetchLiveStats();
  return NextResponse.json(stats);
}
