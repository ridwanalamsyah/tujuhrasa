"use client";

import { useState } from "react";
import { shop } from "@/data/products";
import { cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

/** Pilih ukuran, gilingan, jumlah, lalu masukkan ke keranjang. */
export function AddToCart({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [grind, setGrind] = useState(shop.grindOptions[0]);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  return (
    <div className="space-y-6">
      <p className="text-[1.375rem] font-semibold tabular-nums">{formatPrice(variant.price)}</p>

      {product.variants.length > 1 && (
        <fieldset>
          <legend className="label text-muted">Ukuran</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <label key={v.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="ukuran"
                  value={v.id}
                  checked={v.id === variantId}
                  onChange={() => setVariantId(v.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex min-h-11 items-center border border-line px-4 text-[0.9375rem] peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-cream peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                  {v.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {product.grinds && (
        <label className="block">
          <span className="label text-muted">Gilingan</span>
          <select
            value={grind}
            onChange={(e) => setGrind(e.target.value)}
            className="mt-2 block min-h-11 w-full border border-line bg-cream px-3 text-[0.9375rem] sm:w-72"
          >
            {shop.grindOptions.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      )}

      <div className="flex gap-3">
        <div className="flex items-center border border-line">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            className="h-12 w-11"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span aria-live="polite" className="w-8 text-center tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            className="h-12 w-11"
            onClick={() => setQty((q) => Math.min(99, q + 1))}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="h-12 flex-1 bg-espresso px-6 text-[0.9375rem] font-semibold text-cream transition-colors hover:bg-coffee sm:flex-none sm:px-10"
          onClick={() => {
            cart.add({
              slug: product.slug,
              variantId: variant.id,
              grind: product.grinds ? grind : undefined,
              qty,
            });
            cart.openDrawer();
          }}
        >
          Tambah ke keranjang
        </button>
      </div>
    </div>
  );
}
