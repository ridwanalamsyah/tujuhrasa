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
      className="text-xs font-mono lowercase border border-ink/30 hover:bg-ink hover:text-cream rounded-full px-3 py-1 transition disabled:opacity-50"
      aria-label="ulang pesanan"
    >
      {busy ? "..." : done ? "✓ di keranjang" : "↻ pesan ulang"}
    </button>
  );
}
