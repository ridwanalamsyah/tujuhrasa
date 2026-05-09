// One-time: push 7 produk Tujuh Rasa ke ERP state.products[].
// Idempotent: kalau SKU sudah ada, hanya sinkronkan harga/HPP/min-stok.
//
// Jalankan: npx tsx scripts/backfill-erp-products.ts

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { PrismaClient } from "@prisma/client";
import { ensureErpProducts } from "../src/lib/erp";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ orderBy: { id: "asc" } });
  const items = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    cat: p.cat,
    sat: p.sat,
    sell: p.priceCents,
    gros: p.gros,
    minStk: p.minStk,
    photo: p.photo,
    barista: {
      sop: p.baristaSop,
      tempC: p.baristaTempC,
      timeS: p.baristaTimeS,
      yieldMl: p.baristaYieldMl,
    },
  }));

  console.log(`Pushing ${items.length} produk ke ERP...`);
  const res = await ensureErpProducts(items, 100);
  if (!res.ok) {
    console.error("Gagal:", res.error);
    process.exit(1);
  }
  console.log("Created:", res.created);
  console.log("Updated:", res.updated);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
