"use client";

import { cart, useCart } from "@/lib/cart";

export function CartButton({ className = "" }: { className?: string }) {
  const count = useCart().reduce((n, l) => n + l.qty, 0);
  return (
    <button
      type="button"
      onClick={() => cart.openDrawer()}
      className={`label inline-flex min-h-11 items-center ${className}`}
      aria-label={`Keranjang, ${count} barang`}
    >
      Keranjang ({count})
    </button>
  );
}
