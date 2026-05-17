"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReorderButton({
  items,
}: {
  items: { productId: number; quantity: number }[];
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const reorder = async () => {
    setBusy(true);
    try {
      for (const it of items) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            productId: it.productId,
            quantity: it.quantity,
          }),
        });
      }
      setDone(true);
      router.push("/cart");
    } catch {
      setDone(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={reorder}
      disabled={busy}
      className="text-[10px] font-mono uppercase tracking-widest border-2 border-[var(--tr-ink)] hover:bg-[var(--tr-ink)] hover:text-[var(--tr-paper)] rounded-sm px-3 py-1 transition disabled:opacity-50"
      aria-label="ulang pesanan"
    >
      {busy ? "…" : done ? "✓ di keranjang" : "↻ pesan ulang"}
    </button>
  );
}
