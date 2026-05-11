"use client";

import { useEffect, useState } from "react";

export function StickyCta({
  productId,
  name,
  priceCents,
  stock,
  accent,
}: {
  productId: number;
  name: string;
  priceCents: number;
  stock: number;
  accent: string;
}) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onScroll = () => setShow(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const add = async () => {
    if (stock <= 0 || busy) return;
    setBusy(true);
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={
        "md:hidden fixed left-3 right-3 bottom-[64px] z-30 transition-all " +
        (show ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none")
      }
      aria-hidden={!show}
    >
      <button
        onClick={add}
        disabled={stock <= 0 || busy}
        className="w-full inline-flex items-center justify-between rounded-full px-5 py-3 font-mono text-xs uppercase tracking-widest text-cream card-shadow disabled:opacity-50"
        style={{ background: accent }}
      >
        <span className="truncate text-left">
          {ok ? "✓ ditambahkan" : stock <= 0 ? "stok habis" : `+ ${name}`}
        </span>
        <span className="font-serif italic text-base normal-case ml-3">
          Rp {priceCents.toLocaleString("id-ID")}
        </span>
      </button>
    </div>
  );
}
