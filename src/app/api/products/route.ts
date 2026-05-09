import { NextResponse } from "next/server";
import { getProductsForDisplay } from "@/lib/products";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rasa = url.searchParams.get("rasa");
  const cat = url.searchParams.get("cat");
  const products = await getProductsForDisplay({ rasa, cat });
  return NextResponse.json(products);
}
