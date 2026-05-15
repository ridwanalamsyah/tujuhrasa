"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingBag } from "lucide-react";

type WishlistItem = {
  email: string;
  sku: string;
  pname: string;
  notify: string;
  createdAt?: string;
};

export default function WishlistPage() {
  const [email, setEmail] = useState("");
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("tr_loyalty_email") ?? ""
        : "";
    setEmail(saved);
    if (saved) void load(saved);
  }, []);

  const load = async (e: string) => {
    setBusy(true);
    try {
      const r = await fetch(
        `/api/wishlist?email=${encodeURIComponent(e)}`
      );
      const j = await r.json();
      if (r.ok) setItems(j.items ?? []);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (sku: string) => {
    const next = items.filter((i) => i.sku !== sku);
    setItems(next);
    const local = JSON.parse(
      localStorage.getItem("tr_wishlist") ?? "[]"
    ) as string[];
    localStorage.setItem(
      "tr_wishlist",
      JSON.stringify(local.filter((s) => !s.startsWith(sku + ":")))
    );
  };

  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-12">
          <p className="eyebrow mb-3">Akun</p>
          <h1 className="font-display font-black text-[clamp(32px,5vw,56px)] leading-[0.98] tracking-[-0.02em] mb-2 flex items-center gap-3">
            <Heart className="h-9 w-9 text-[var(--tr-brick)]" />
            <span>Wishlist</span>
          </h1>
          <p className="text-[var(--tr-text-soft)] max-w-xl leading-relaxed">
            Daftar minuman yang kamu mau dikabari saat restock atau diskon.
          </p>
        </div>
      </section>

      <div className="container-tr py-12 space-y-8">
        <div className="card-stamp p-5 max-w-md">
          <label className="block">
            <span className="eyebrow mb-1.5 block">Email kamu</span>
            <div className="flex gap-2 mt-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="input flex-1"
              />
              <button
                onClick={() => email && load(email)}
                disabled={!email || busy}
                className="btn btn-primary"
              >
                {busy ? "Muat…" : "Muat"}
              </button>
            </div>
          </label>
        </div>

        {items.length === 0 ? (
          <div className="rounded-md border-2 border-dashed border-[var(--tr-ink)] p-10 text-center bg-[var(--tr-paper-2)]">
            <Heart className="h-10 w-10 mx-auto text-[var(--tr-text-muted)] mb-3" />
            <p className="font-display font-black text-2xl mb-1">
              Belum ada wishlist
            </p>
            <p className="font-hand text-xl text-[var(--tr-brick-deep)] mb-5">
              tekan hati di halaman produk —
            </p>
            <Link href="/shop" className="btn btn-primary">
              <ShoppingBag className="h-4 w-4" /> Lihat menu
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map((it) => (
              <div
                key={it.sku + it.notify}
                className="card-stamp p-4 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-display font-bold text-lg">{it.pname}</p>
                  <p className="text-xs text-[var(--tr-text-muted)] font-mono mt-1">
                    SKU {it.sku} · kabari saat {it.notify}
                  </p>
                </div>
                <button
                  onClick={() => remove(it.sku)}
                  aria-label={`Hapus ${it.pname} dari wishlist`}
                  className="w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] grid place-items-center bg-[var(--tr-paper)] hover:bg-[var(--tr-brick)] hover:text-[var(--tr-paper)] transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
