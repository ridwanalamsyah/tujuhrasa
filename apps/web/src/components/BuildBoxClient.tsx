"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type P = {
  id: number;
  slug: string;
  sku: string;
  name: string;
  priceCents: number;
  stock: number;
  accentHex: string;
  bgHex: string;
  cat: string;
  photo: string;
};

const SIZES = [
  { label: "6 botol", count: 6, discount: 0.05 },
  { label: "12 botol", count: 12, discount: 0.12 },
];

export function BuildBoxClient({ products }: { products: P[] }) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);

  const total = Object.values(picks).reduce((s, n) => s + n, 0);
  const subtotal = Object.entries(picks).reduce((s, [pid, qty]) => {
    const p = products.find((x) => x.id === Number(pid));
    return s + (p?.priceCents ?? 0) * qty;
  }, 0);
  const discountAmount = Math.round(subtotal * selectedSize.discount);
  const finalTotal = subtotal - discountAmount;
  const remaining = selectedSize.count - total;

  const change = (id: number, delta: number) => {
    setPicks((prev) => {
      const cur = prev[id] ?? 0;
      const next = Math.max(0, cur + delta);
      const product = products.find((p) => p.id === id);
      const stockCap = product?.stock ?? 0;
      const otherTotal = total - cur;
      const wantedNext = Math.min(next, stockCap, selectedSize.count - otherTotal);
      const newMap = { ...prev };
      if (wantedNext === 0) delete newMap[id];
      else newMap[id] = wantedNext;
      return newMap;
    });
  };

  const sortedProducts = useMemo(
    () =>
      products
        .slice()
        .sort((a, b) => (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)),
    [products]
  );

  const addAllToCart = async () => {
    if (total !== selectedSize.count) return;
    setBusy(true);
    try {
      for (const [pid, qty] of Object.entries(picks)) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ productId: Number(pid), quantity: qty }),
        });
      }
      router.push("/cart");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div className="flex gap-2 mb-6">
          {SIZES.map((s) => (
            <button
              key={s.count}
              onClick={() => {
                setSelectedSize(s);
                setPicks({});
              }}
              className={
                "rounded-full px-4 py-2 text-sm font-mono lowercase border transition " +
                (selectedSize.count === s.count
                  ? "bg-ink text-cream border-ink"
                  : "bg-cream text-ink border-ink/30 hover:border-ink")
              }
            >
              {s.label} · hemat {Math.round(s.discount * 100)}%
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {sortedProducts.map((p) => {
            const qty = picks[p.id] ?? 0;
            const habis = p.stock <= 0;
            return (
              <div
                key={p.id}
                className={
                  "rounded-2xl border p-4 transition " +
                  (habis
                    ? "border-ink/15 opacity-50"
                    : qty > 0
                    ? "border-orange bg-orange/5"
                    : "border-ink/15")
                }
              >
                <div className="flex gap-3">
                  <div
                    className="w-16 h-20 rounded-xl shrink-0 grid place-items-center"
                    style={{ background: p.bgHex }}
                  >
                    {p.photo && /^https?:\/\//.test(p.photo) ? (
                      <img src={p.photo} alt={p.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">🥤</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] opacity-60 lowercase">
                      {p.cat || "menu"}
                    </p>
                    <p className="font-serif italic text-lg leading-tight">
                      {p.name}
                    </p>
                    <p className="font-mono text-xs">
                      Rp {p.priceCents.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] font-mono opacity-50">
                      stok {p.stock}
                    </p>
                  </div>
                </div>
                <div className="mt-3 inline-flex items-center rounded-full border border-ink overflow-hidden">
                  <button
                    onClick={() => change(p.id, -1)}
                    disabled={qty === 0}
                    className="px-3 py-1 hover:bg-ink hover:text-cream disabled:opacity-50 text-sm"
                  >
                    −
                  </button>
                  <span className="px-3 font-mono text-sm w-8 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => change(p.id, +1)}
                    disabled={habis || total >= selectedSize.count}
                    className="px-3 py-1 hover:bg-ink hover:text-cream disabled:opacity-50 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="lg:sticky lg:top-28 self-start rounded-3xl border border-ink/20 bg-paper p-6 card-shadow">
        <p className="eyebrow mb-2">/ kotak kamu</p>
        <p className="font-serif italic text-2xl mb-4">{selectedSize.label}</p>

        <div className="h-2 rounded-full bg-ink/10 overflow-hidden mb-2">
          <div
            className="h-full bg-orange transition-all"
            style={{ width: `${(total / selectedSize.count) * 100}%` }}
          />
        </div>
        <p className="text-xs font-mono opacity-60 mb-4">
          {remaining > 0
            ? `${remaining} botol lagi sampai lengkap.`
            : `Sip, kotaknya sudah lengkap!`}
        </p>

        <ul className="space-y-1 text-sm mb-4 max-h-48 overflow-auto">
          {Object.keys(picks).length === 0 ? (
            <li className="opacity-50 italic">Belum ada pilihan.</li>
          ) : (
            Object.entries(picks).map(([pid, qty]) => {
              const p = products.find((x) => x.id === Number(pid));
              return (
                <li key={pid} className="flex justify-between gap-2">
                  <span className="truncate">
                    {qty}× {p?.name}
                  </span>
                  <span className="font-mono">
                    Rp {((p?.priceCents ?? 0) * qty).toLocaleString("id-ID")}
                  </span>
                </li>
              );
            })
          )}
        </ul>

        <div className="border-t border-ink/15 pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="opacity-70">subtotal</span>
            <span className="font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-70">
              hemat {Math.round(selectedSize.discount * 100)}%
            </span>
            <span className="font-mono text-orange">
              − Rp {discountAmount.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex justify-between font-serif italic text-2xl mt-2">
            <span>total</span>
            <span>Rp {finalTotal.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <button
          onClick={addAllToCart}
          disabled={total !== selectedSize.count || busy}
          className="w-full mt-5 btn-primary justify-center disabled:opacity-50"
        >
          {busy ? "memproses..." : "tambah ke keranjang"}
        </button>
      </aside>
    </div>
  );
}
