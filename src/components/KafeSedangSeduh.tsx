"use client";

import { useEffect, useState } from "react";

type InProgress = {
  pname: string;
  qty: number;
  etaMin: number;
  tempC: number;
  sop: string;
} | null;

type Barista = { name: string; emoji: string } | null;

export function KafeSedangSeduh({
  initial,
  todayBarista,
  open,
  openHourLabel,
}: {
  initial: InProgress;
  todayBarista: Barista;
  open: boolean;
  openHourLabel: string;
}) {
  const [data, setData] = useState<InProgress>(initial);
  const [barista, setBarista] = useState<Barista>(todayBarista);
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const r = await fetch("/api/erp/live", { cache: "no-store" });
        if (!r.ok) return;
        const json = await r.json();
        setData(json.inProgress ?? null);
        setBarista(json.todayBarista ?? null);
        setIsOpen(json.open ?? false);
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="rounded-3xl border border-ink/20 bg-paper p-6 lg:p-8 card-shadow">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="eyebrow mb-2">/ kafe sedang seduh</p>
          <p className="font-serif italic text-2xl">Lihat ke dapur kami.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono " +
              (isOpen
                ? "bg-leaf/15 text-leaf border border-leaf/40"
                : "bg-ink/10 text-ink border border-ink/30")
            }
          >
            <span
              className={
                "h-2 w-2 rounded-full " + (isOpen ? "bg-leaf" : "bg-ink/40")
              }
            />
            {isOpen ? "buka" : "tutup"}
          </span>
          <span className="font-mono text-[10px] opacity-60">{openHourLabel}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          {data ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                lagi diseduh
              </p>
              <p className="font-serif italic text-2xl leading-tight">
                {data.qty} botol {data.pname}
              </p>
              <p className="text-sm opacity-70 mt-2 line-clamp-2">{data.sop}</p>
              <div className="mt-4 flex items-center gap-3 text-xs font-mono">
                <span className="rounded-full border border-ink/20 px-2 py-1">
                  ☕ {data.tempC}°C
                </span>
                <span className="rounded-full border border-orange text-orange px-2 py-1">
                  ETA {data.etaMin} mnt
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-60 mb-1">
                kafe lagi tenang
              </p>
              <p className="font-serif italic text-2xl leading-tight">
                Tidak ada antrean — pesan sekarang langsung dibuat.
              </p>
            </>
          )}
        </div>

        {barista && (
          <div className="rounded-2xl border border-ink/20 bg-cream p-4 text-center min-w-[140px]">
            <div className="text-4xl mb-1">{barista.emoji}</div>
            <p className="font-mono text-[10px] opacity-60 uppercase tracking-widest">
              barista hari ini
            </p>
            <p className="font-serif italic text-lg mt-1">{barista.name}</p>
          </div>
        )}
      </div>
    </section>
  );
}
