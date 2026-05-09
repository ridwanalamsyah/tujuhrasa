"use client";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bottle } from "./Bottle";
import { paletteFor } from "@/lib/palette";

function BottleThumb({
  svg,
  name,
  sku,
  cat,
  accent,
  bgHex,
  liquidHex,
  labelHex,
  inkHex,
  liquidPct,
  photo,
}: {
  svg: string;
  name: string;
  sku?: string;
  cat?: string;
  accent: string;
  bgHex?: string;
  liquidHex?: string;
  labelHex?: string;
  inkHex?: string;
  liquidPct?: number;
  photo?: string;
}) {
  return (
    <div className="w-16 h-20 shrink-0 grid place-items-center" aria-hidden>
      <Bottle
        svg={svg}
        name={name}
        sku={sku}
        cat={cat}
        photo={photo}
        accentHex={accent}
        bgHex={bgHex}
        liquidHex={liquidHex}
        labelHex={labelHex}
        inkHex={inkHex}
        liquidPct={liquidPct}
        className="w-full h-full"
      />
    </div>
  );
}

type Item = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    slug: string;
    name: string;
    rasa: string;
    sku?: string;
    cat?: string;
    priceCents: number;
    accentHex: string;
    bgHex: string;
    liquidHex?: string;
    labelHex?: string;
    inkHex?: string;
    liquidPct?: number;
    photo?: string;
    bottleSvg: string;
  };
};

type CartResp = {
  cart: { items: Item[] } | null;
  itemCount: number;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

const fmt = (c: number) => "Rp " + c.toLocaleString("id-ID");

export function CartDrawer({
  open,
  onClose,
  initialCount,
}: {
  open: boolean;
  onClose: () => void;
  initialCount: number;
}) {
  const [data, setData] = useState<CartResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Load cart when opening
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d: CartResp) => setData(d))
      .finally(() => setLoading(false));
  }, [open]);

  const updateQty = (id: number, qty: number) => {
    startTransition(async () => {
      const r = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity: qty }),
      });
      if (r.ok) {
        const fresh = await fetch("/api/cart").then((x) => x.json());
        setData(fresh);
        router.refresh();
      }
    });
  };
  const removeItem = (id: number) => {
    startTransition(async () => {
      const r = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (r.ok) {
        const fresh = await fetch("/api/cart").then((x) => x.json());
        setData(fresh);
        router.refresh();
      }
    });
  };

  if (!open) return null;
  const items = data?.cart?.items ?? [];
  const subtotal = data?.subtotalCents ?? 0;
  const shipping = data?.shippingCents ?? 0;
  const total = data?.totalCents ?? 0;
  const count = data?.itemCount ?? initialCount;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang belanja"
    >
      <div
        className="drawer-overlay absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="drawer-panel absolute top-0 right-0 h-full w-full sm:max-w-md bg-cream border-l border-ink/15 flex flex-col card-shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
          <div>
            <p className="eyebrow">/ keranjang</p>
            <p className="font-serif italic text-2xl leading-tight">
              {count > 0 ? `${count} botol siap pulang` : "Masih kosong"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="tutup"
            className="rounded-full p-2 hover:bg-ink hover:text-cream transition"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !data ? (
            <p className="text-sm opacity-60 py-8 text-center">memuat…</p>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif italic text-2xl mb-2">
                Mejamu masih sepi.
              </p>
              <p className="text-sm opacity-70 mb-6">
                Pilih satu botol dulu, sisanya kami pikirkan bersama.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="btn-primary"
              >
                jelajah botol →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex gap-3 items-start rounded-2xl p-3 border border-ink/10"
                  style={{ background: it.product.bgHex }}
                >
                  {(() => {
                    const pal = paletteFor(it.product.sku ?? "", it.product.cat ?? "");
                    return (
                      <BottleThumb
                        svg={it.product.bottleSvg}
                        name={it.product.name}
                        sku={it.product.sku}
                        cat={it.product.cat}
                        photo={it.product.photo}
                        accent={it.product.accentHex || pal.accent}
                        bgHex={it.product.bgHex || pal.bg}
                        liquidHex={it.product.liquidHex || pal.liquid}
                        labelHex={it.product.labelHex || pal.label}
                        inkHex={it.product.inkHex || pal.ink}
                        liquidPct={it.product.liquidPct ?? 0.7}
                      />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-[10px] opacity-60 lowercase">
                      {it.product.rasa || it.product.cat || "menu"}
                    </p>
                    <Link
                      href={`/shop/${it.product.slug}`}
                      onClick={onClose}
                      className="font-serif italic text-lg leading-tight tr-link"
                    >
                      {it.product.name}
                    </Link>
                    <p className="font-mono text-xs mt-1">{fmt(it.product.priceCents)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-ink/40 overflow-hidden bg-cream">
                        <button
                          aria-label="kurangi"
                          disabled={pending}
                          onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))}
                          className="px-2 py-1 hover:bg-ink hover:text-cream transition"
                        >−</button>
                        <span className="px-2 font-mono text-xs w-7 text-center">{it.quantity}</span>
                        <button
                          aria-label="tambah"
                          disabled={pending}
                          onClick={() => updateQty(it.id, Math.min(20, it.quantity + 1))}
                          className="px-2 py-1 hover:bg-ink hover:text-cream transition"
                        >+</button>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        disabled={pending}
                        className="ml-auto font-mono text-[10px] uppercase tracking-wider opacity-60 hover:opacity-100 hover:text-orange transition"
                      >
                        hapus
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-ink/10 px-5 py-4 bg-paper">
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="opacity-70">subtotal</span>
              <span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-baseline justify-between text-sm mb-1">
              <span className="opacity-70">ongkir</span>
              <span className="font-mono">
                {shipping === 0 ? "gratis" : fmt(shipping)}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-ink/10">
              <span className="font-serif italic text-lg">total</span>
              <span className="font-mono text-lg">{fmt(total)}</span>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="btn-primary w-full justify-center"
              >
                lanjut ke checkout →
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="text-center font-mono text-xs lowercase opacity-60 hover:opacity-100"
              >
                buka keranjang lengkap
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
