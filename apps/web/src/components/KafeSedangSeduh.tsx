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
    <section className="card-stamp p-6 lg:p-8 bg-[var(--tr-paper)]">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <p className="eyebrow mb-1.5">Kafe sedang seduh</p>
          <p className="font-display font-bold text-2xl leading-tight">Lihat ke dapur kami</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={
              "inline-flex items-center gap-2 rounded-sm px-2.5 py-1 text-[11px] font-mono uppercase tracking-widest border-2 " +
              (isOpen
                ? "bg-[var(--tr-leaf-soft)] text-[var(--tr-leaf-deep)] border-[var(--tr-leaf-deep)]"
                : "bg-[var(--tr-paper-2)] text-[var(--tr-ink-soft)] border-[var(--tr-ink)]")
            }
          >
            <span
              className={
                "h-2 w-2 rounded-full " +
                (isOpen ? "bg-[var(--tr-leaf-deep)]" : "bg-[var(--tr-ink-soft)]")
              }
            />
            {isOpen ? "buka" : "tutup"}
          </span>
          <span className="font-mono text-[10px] text-[var(--tr-text-muted)]">{openHourLabel}</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          {data ? (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)] mb-2">
                lagi diseduh
              </p>
              <p className="font-display font-black text-2xl sm:text-3xl leading-tight">
                {data.qty} botol {data.pname}
              </p>
              <p className="text-sm text-[var(--tr-text-soft)] mt-3 line-clamp-2">{data.sop}</p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono">
                <span className="pill">☕ {data.tempC}°C</span>
                <span className="pill text-[var(--tr-brick)] border-[var(--tr-brick)]">
                  ETA {data.etaMin} mnt
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)] mb-2">
                kafe lagi tenang
              </p>
              <p className="font-display-italic text-xl sm:text-2xl leading-tight">
                Tidak ada antrean — pesan sekarang langsung dibuat.
              </p>
            </>
          )}
        </div>

        {barista && (
          <div className="rounded-md border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)] p-4 text-center min-w-[140px] shadow-stamp-sm">
            <div className="text-4xl mb-1" aria-hidden>{barista.emoji}</div>
            <p className="font-mono text-[10px] text-[var(--tr-text-muted)] uppercase tracking-widest">
              barista hari ini
            </p>
            <p className="font-display font-bold text-base mt-1">{barista.name}</p>
          </div>
        )}
      </div>
    </section>
  );
}
