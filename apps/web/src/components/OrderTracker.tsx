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
    <div className="card-stamp p-6">
      <p className="eyebrow mb-3">Status pesanan</p>
      <ol className="grid grid-cols-5 gap-2">
        {STAGES.map((s, i) => {
          const reached = i <= idx;
          const current = i === idx;
          return (
            <li key={s.id} className="text-center">
              <div
                className={
                  "w-10 h-10 mx-auto rounded-sm border-2 border-[var(--tr-ink)] grid place-items-center text-xs font-mono font-bold mb-2 transition " +
                  (reached
                    ? "bg-[var(--tr-brick)] text-[var(--tr-paper)] shadow-stamp-sm"
                    : "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)]")
                }
              >
                {reached ? "✓" : i + 1}
              </div>
              <p
                className={
                  "font-mono text-[10px] uppercase tracking-widest " +
                  (current
                    ? "text-[var(--tr-brick)] font-bold"
                    : reached
                      ? "text-[var(--tr-ink)]"
                      : "text-[var(--tr-text-muted)]")
                }
              >
                {s.label}
              </p>
              {current && (
                <p className="text-[10px] text-[var(--tr-text-soft)] mt-1 leading-tight">
                  {s.desc}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-4 h-2 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)] overflow-hidden">
        <div
          className="h-full bg-[var(--tr-brick)] transition-all"
          style={{ width: `${(idx / (STAGES.length - 1)) * 100}%` }}
        />
      </div>
      <p className="text-xs text-[var(--tr-text-muted)] mt-3 font-mono">
        Update otomatis tiap menit · kurir akan menghubungi sebelum sampai
      </p>
    </div>
  );
}
