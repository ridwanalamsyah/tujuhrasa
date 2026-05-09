import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const URL = process.env.ERP_SUPABASE_URL!;
const KEY = process.env.ERP_SUPABASE_ANON_KEY!;

async function main() {
  const r = await fetch(`${URL}/rest/v1/kv_store?key=eq.tr_erp_v3:state&select=value`, {
    headers: { apikey: KEY, Authorization: "Bearer " + KEY },
    cache: "no-store" as RequestCache,
  });
  const rows = await r.json();
  const state = rows[0].value;
  for (const p of state.products) {
    if (p.sku?.startsWith("TR-") && (!p.stock || p.stock < 50)) {
      console.log(`Resetting stock for ${p.sku} (was ${p.stock}) → 100`);
      p.stock = 100;
    }
  }
  const w = await fetch(`${URL}/rest/v1/kv_store?on_conflict=key`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: "Bearer " + KEY,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ key: "tr_erp_v3:state", value: state }),
  });
  console.log("write:", w.status);
}
main();
