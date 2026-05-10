"use client";

import { useEffect, useState } from "react";

const STAGES = [
  { id: "received", label: "diterima", desc: "kasir terima pesanan kamu" },
  { id: "roasted", label: "disangrai", desc: "biji baru disangrai pagi tadi" },
  { id: "bottled", label: "dibotolkan", desc: "barista mengisi & menyegel botol" },
  { id: "out", label: "dikirim", desc: "kurir berangkat dari kafe" },
  { id: "done", label: "sampai", desc: "selamat menikmati!" },
];

function stageFromOrder(createdAt: string): number {
  const t = new Date(createdAt).getTime();
  const now = Date.now();
  const ageMin = (now - t) / 60000;
  if (ageMin < 5) return 0;
  if (ageMin < 25) return 1;
  if (ageMin < 60) return 2;
  if (ageMin < 180) return 3;
  return 4;
}

export function OrderTracker({
  createdAt,
  status,
}: {
  createdAt: string;
  status: string;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(i);
  }, []);
  const _ = now; // re-render hook tick
  void _;
  const idx = status === "delivered" ? 4 : stageFromOrder(createdAt);

  return (
    <div className="rounded-3xl border border-ink/20 bg-paper p-6">
      <p className="eyebrow mb-3">/ status pesanan · live</p>
      <ol className="grid grid-cols-5 gap-2">
        {STAGES.map((s, i) => {
          const reached = i <= idx;
          const current = i === idx;
          return (
            <li key={s.id} className="text-center">
              <div
                className={
                  "w-10 h-10 mx-auto rounded-full grid place-items-center text-xs font-mono mb-2 transition " +
                  (reached ? "bg-orange text-cream" : "bg-ink/10 text-ink/40") +
                  (current ? " ring-4 ring-orange/30" : "")
                }
              >
                {reached ? "✓" : i + 1}
              </div>
              <p
                className={
                  "font-mono text-[10px] uppercase tracking-widest " +
                  (current ? "text-orange" : reached ? "" : "opacity-40")
                }
              >
                {s.label}
              </p>
              {current && (
                <p className="text-[10px] opacity-70 mt-1 leading-tight">
                  {s.desc}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-1 rounded-full bg-ink/10 overflow-hidden">
        <div
          className="h-full bg-orange transition-all"
          style={{ width: `${(idx / (STAGES.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-xs opacity-60 mt-3 font-mono">
        update otomatis tiap menit · kurir akan menghubungi sebelum sampai
      </p>
    </div>
  );
}
