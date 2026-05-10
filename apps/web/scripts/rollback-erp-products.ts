/**
 * Rollback: hapus 7 produk TR-* yang sebelumnya di-backfill ke ERP.
 * Hanya menghapus produk dengan SKU diawali "TR-".
 */
import * as fs from "node:fs";
import * as path from "node:path";

// Lightweight .env loader (no dotenv dependency)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      let v = m[2].trim();
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

const URL = process.env.ERP_SUPABASE_URL!;
const KEY = process.env.ERP_SUPABASE_ANON_KEY!;
const TABLE = process.env.ERP_TABLE ?? "kv_store";
const STATE_KEY = process.env.ERP_STATE_KEY ?? "tr_erp_v3:state";

async function main() {
  const headers = {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
  };

  const getRes = await fetch(
    `${URL}/rest/v1/${TABLE}?key=eq.${STATE_KEY}&select=value`,
    { headers }
  );
  if (!getRes.ok) {
    throw new Error(`get failed: ${getRes.status} ${await getRes.text()}`);
  }
  const rows = await getRes.json();
  if (!rows.length) {
    throw new Error("ERP state not found");
  }
  const state = rows[0].value;
  const before = state.products.length;
  state.products = state.products.filter(
    (p: { sku?: string }) => !(p.sku ?? "").startsWith("TR-")
  );
  const after = state.products.length;

  console.log(`removed ${before - after} products (TR-* sku); kept ${after}`);
  for (const p of state.products) {
    console.log(`  ${p.sku} | ${p.name} | stok=${p.stock}`);
  }

  const upRes = await fetch(`${URL}/rest/v1/${TABLE}?key=eq.${STATE_KEY}`, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ value: state }),
  });
  if (!upRes.ok) {
    throw new Error(`patch failed: ${upRes.status} ${await upRes.text()}`);
  }
  console.log("✓ ERP updated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
