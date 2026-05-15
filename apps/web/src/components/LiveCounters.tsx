"use client";

import { useEffect, useState } from "react";

type Stats = {
  bottlesToday: number;
  ordersToday: number;
  revenueWeek: number;
  activeMenu: number;
  totalCustomers: number;
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtRp = (n: number) => "Rp " + Math.round(n / 1000) + "rb";

export function LiveCounters({ initial }: { initial: Stats }) {
  const [s, setS] = useState<Stats>(initial);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/erp/live", { cache: "no-store" });
        if (!r.ok) return;
        const json = await r.json();
        setS({
          bottlesToday: json.bottlesToday ?? 0,
          ordersToday: json.ordersToday ?? 0,
          revenueWeek: json.revenueWeek ?? 0,
          activeMenu: json.activeMenu ?? 0,
          totalCustomers: json.totalCustomers ?? 0,
        });
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card label="Botol hari ini" value={fmt(s.bottlesToday)} />
      <Card label="Pelanggan tetap" value={fmt(s.totalCustomers)} />
      <Card label="Menu aktif" value={fmt(s.activeMenu)} />
      <Card label="Revenue 7 hari" value={fmtRp(s.revenueWeek)} />
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] p-5 shadow-stamp-sm">
      <p className="font-display font-black text-3xl sm:text-4xl tabular-nums leading-none text-[var(--tr-ink)]">
        {value}
      </p>
      <p className="font-mono text-[10px] text-[var(--tr-text-muted)] mt-3 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}
