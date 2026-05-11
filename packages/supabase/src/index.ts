// Low-level adapter to Supabase kv_store for Tujuh Rasa ERP state.
// ERP simpan SELURUH state aplikasi sebagai 1 row JSONB di kv_store.
// Apps (web & erp) sama-sama pakai adapter ini untuk read/modify/write.

import { ERP_STATE_KEY, type ErpState } from "@tujuhrasa/shared";

export type KvStoreConfig = {
  url: string;
  anonKey: string;
  table?: string;
  stateKey?: string;
};

export const createKvStore = (cfg: KvStoreConfig) => {
  const root = cfg.url.replace(/\/$/, "");
  const table = cfg.table ?? "kv_store";
  const key = cfg.stateKey ?? ERP_STATE_KEY;
  const headers: Record<string, string> = {
    apikey: cfg.anonKey,
    Authorization: `Bearer ${cfg.anonKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  async function getState<T = ErpState>(): Promise<T | null> {
    const url = `${root}/rest/v1/${table}?key=eq.${encodeURIComponent(
      key
    )}&select=*`;
    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok)
      throw new Error(`kv_store GET failed: ${res.status} ${res.statusText}`);
    const rows = (await res.json()) as Array<{ value: T }>;
    return rows[0]?.value ?? null;
  }

  async function setState<T = ErpState>(value: T): Promise<void> {
    const url = `${root}/rest/v1/${table}?on_conflict=key`;
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok)
      throw new Error(`kv_store SET failed: ${res.status} ${res.statusText}`);
  }

  async function updateState<T = ErpState>(
    mutator: (curr: T) => T
  ): Promise<T> {
    const curr = (await getState<T>()) as T;
    const next = mutator(curr);
    await setState<T>(next);
    return next;
  }

  return { getState, setState, updateState, key, table, root };
};

export type KvStore = ReturnType<typeof createKvStore>;
