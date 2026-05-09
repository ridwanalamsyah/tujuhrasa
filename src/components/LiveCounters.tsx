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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card label="botol terjual hari ini" value={fmt(s.bottlesToday)} icon="🍶" />
      <Card label="pelanggan tetap" value={fmt(s.totalCustomers)} icon="🧑‍🤝‍🧑" />
      <Card label="menu aktif" value={fmt(s.activeMenu)} icon="📋" />
      <Card label="revenue 7 hari" value={fmtRp(s.revenueWeek)} icon="💰" />
    </div>
  );
}

function Card({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-ink/20 bg-paper p-5 card-shadow">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="font-serif italic text-3xl tabular-nums">{value}</p>
      <p className="font-mono text-[10px] opacity-60 mt-1 lowercase tracking-wider">
        {label}
      </p>
    </div>
  );
}
