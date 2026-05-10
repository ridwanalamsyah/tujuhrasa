"use client";

import { useEffect, useState } from "react";

type Activity = {
  buyer: string;
  city: string;
  pname: string;
  qty: number;
  agoMin: number;
};

export function LiveActivityStrip({ initial }: { initial: Activity[] }) {
  const [items, setItems] = useState<Activity[]>(initial);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (items.length > 0 ? (i + 1) % items.length : 0));
    }, 4000);
    return () => clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/erp/live", { cache: "no-store" });
        if (!r.ok) return;
        const json = await r.json();
        if (Array.isArray(json.recentActivities)) {
          setItems(json.recentActivities);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 text-sm font-mono opacity-70 px-4 py-2 rounded-full bg-paper border border-ink/15">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange" />
        </span>
        <span>siap mengantar pesananmu</span>
      </div>
    );
  }

  const a = items[idx];
  const ago =
    a.agoMin < 1
      ? "baru saja"
      : a.agoMin < 60
      ? `${a.agoMin} menit lalu`
      : a.agoMin < 60 * 48
      ? `${Math.round(a.agoMin / 60)} jam lalu`
      : `${Math.round(a.agoMin / (60 * 24))} hari lalu`;

  return (
    <div
      className="inline-flex items-center gap-3 text-xs sm:text-sm px-4 py-2 rounded-full bg-paper border border-ink/15 card-shadow"
      role="status"
      aria-live="polite"
      key={idx}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange" />
      </span>
      <span className="font-serif italic">
        {a.buyer} dari {a.city}
      </span>
      <span className="opacity-60">baru pesan</span>
      <span className="font-mono">
        {a.qty} botol {a.pname}
      </span>
      <span className="opacity-50">· {ago}</span>
    </div>
  );
}
