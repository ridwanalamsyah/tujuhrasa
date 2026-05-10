"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AddToCart({
  productId,
  accent,
  stock,
}: {
  productId: number;
  accent: string;
  stock?: number;
}) {
  const habis = stock !== undefined && stock <= 0;
  const maxQty = stock !== undefined && stock > 0 ? Math.min(20, stock) : 20;
  const [qty, setQty] = useState(1);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const router = useRouter();

  const add = () => {
    if (habis) return;
    setDone(false);
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      if (res.ok) {
        setDone(true);
        router.refresh();
        // Notify Nav to open the cart drawer
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("tr:cart-open"));
        }
        setTimeout(() => setDone(false), 1800);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center rounded-full border border-ink overflow-hidden">
        <button
          aria-label="kurangi"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={habis}
          className="px-3 py-2 hover:bg-ink hover:text-cream transition disabled:opacity-30"
        >
          −
        </button>
        <span className="px-3 font-mono text-sm w-8 text-center">{qty}</span>
        <button
          aria-label="tambah"
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          disabled={habis || qty >= maxQty}
          className="px-3 py-2 hover:bg-ink hover:text-cream transition disabled:opacity-30"
        >
          +
        </button>
      </div>
      <button
        onClick={add}
        disabled={pending || habis}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: done ? accent : undefined }}
      >
        {habis
          ? "stok habis"
          : pending
          ? "memasukkan…"
          : done
          ? "✓ masuk keranjang"
          : "tambah ke keranjang"}
      </button>
    </div>
  );
}
