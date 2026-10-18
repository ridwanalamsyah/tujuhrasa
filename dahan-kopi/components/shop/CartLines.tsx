"use client";

import { ProductArt } from "@/components/shop/ProductArt";
import { getProduct } from "@/data/products";
import { cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { PricedLine } from "@/lib/order";

/** Daftar isi keranjang (dipakai di laci keranjang dan halaman checkout). */
export function CartLines({ items, editable = true }: { items: PricedLine[]; editable?: boolean }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => {
        const product = getProduct(item.slug);
        return (
          <li key={item.key} className="flex gap-4 py-4">
            {product && (
              <div className="h-20 w-20 shrink-0" style={{ background: product.art.bg }}>
                <ProductArt product={product} className="h-full w-full" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-3">
                <p className="font-semibold leading-snug">{item.name}</p>
                <p className="shrink-0 tabular-nums">{formatPrice(item.lineTotal)}</p>
              </div>
              <p className="text-small text-muted">{item.variantLabel}</p>
              {editable ? (
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      aria-label={`Kurangi ${item.name}`}
                      className="h-9 w-9"
                      onClick={() => cart.setQty(item.key, item.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-small tabular-nums">{item.qty}</span>
                    <button
                      type="button"
                      aria-label={`Tambah ${item.name}`}
                      className="h-9 w-9"
                      onClick={() => cart.setQty(item.key, item.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-small text-muted underline underline-offset-4 hover:text-espresso"
                    onClick={() => cart.remove(item.key)}
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <p className="text-small text-muted">Jumlah: {item.qty}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
