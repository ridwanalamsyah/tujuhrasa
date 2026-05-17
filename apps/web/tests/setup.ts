// Vitest global setup for apps/web.
// Sets ERP env vars BEFORE the erp.ts module is imported so its
// module-level constants (URL_ROOT, ANON_KEY, ENABLED) pick them up.
process.env.ERP_SUPABASE_URL ||= "https://test.supabase.co";
process.env.ERP_SUPABASE_ANON_KEY ||= "test-anon-key";
process.env.ERP_STATE_KEY ||= "tr_erp_v3:state";
process.env.ERP_TABLE ||= "kv_store";
process.env.ERP_BATCH_NAME ||= "Batch Test";
process.env.ERP_SYNC_ENABLED ||= "true";
