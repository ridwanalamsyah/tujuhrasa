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
    <div className="container-tr pt-28 sm:pt-32 pb-20">
      <p className="eyebrow mb-3">/ akun</p>
      <h1 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.02] mb-2">
        <Heart className="inline-block h-10 w-10 text-[var(--tr-orange)] mr-3" />
        Wishlist
      </h1>
      <p className="text-[var(--tr-text-soft)] max-w-xl mb-8">
        Daftar minuman yang kamu mau dikabari saat restock atau diskon.
      </p>

      <div className="rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] p-5 max-w-md mb-8">
        <label className="block">
          <span className="text-xs font-mono text-[var(--tr-text-muted)] uppercase tracking-wider mb-1.5 block">
            Email kamu
          </span>
          <div className="flex gap-2">
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
        <div className="rounded-2xl border-2 border-dashed border-[var(--tr-border-strong)] p-10 text-center bg-[var(--tr-bg-elev)]/50">
          <Heart className="h-10 w-10 mx-auto text-[var(--tr-text-subtle)] mb-3" />
          <p className="font-serif italic text-xl text-[var(--tr-ink)] mb-1">
            Belum ada wishlist
          </p>
          <p className="text-sm text-[var(--tr-text-muted)] mb-6">
            Tekan tombol hati di halaman produk untuk menambah.
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
              className="rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] p-4 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-serif italic text-lg text-[var(--tr-ink)]">
                  {it.pname}
                </p>
                <p className="text-xs text-[var(--tr-text-muted)]">
                  SKU {it.sku} · kabari saat {it.notify}
                </p>
              </div>
              <button
                onClick={() => remove(it.sku)}
                aria-label={`Hapus ${it.pname} dari wishlist`}
                className="w-10 h-10 rounded-full border border-[var(--tr-border)] grid place-items-center hover:bg-[var(--tr-paper-2)] transition"
              >
                <Trash2 className="h-4 w-4 text-[var(--tr-danger)]" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
