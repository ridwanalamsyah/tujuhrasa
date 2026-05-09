import { NextResponse } from "next/server";
import { erpEnabled, getErpStockBySku } from "@/lib/erp";

export async function GET() {
  if (!erpEnabled) {
    return NextResponse.json({ enabled: false, stock: {} });
  }
  const stock = await getErpStockBySku();
  return NextResponse.json({ enabled: true, stock });
}
