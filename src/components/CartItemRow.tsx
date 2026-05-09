"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bottle } from "./Bottle";
import { paletteFor } from "@/lib/palette";

export function CartItemRow({
  itemId,
  quantity,
  product,
}: {
  itemId: number;
  quantity: number;
  product: {
    name: string;
    slug: string;
    rasa: string;
    sku?: string;
    cat?: string;
    accentHex?: string;
    priceCents: number;
    bottleSvg: string;
    bgHex: string;
    liquidHex?: string;
    labelHex?: string;
    inkHex?: string;
    liquidPct?: number;
    photo?: string;
  };
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const pal = paletteFor(product.sku ?? "", product.cat ?? "");

  const update = (newQty: number) => {
    start(async () => {
      if (newQty <= 0) {
        await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/cart/${itemId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ quantity: newQty }),
        });
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 py-5 border-b border-ink/15">
      <Link href={`/shop/${product.slug}`} className="shrink-0 rounded-xl p-2" style={{ background: product.bgHex || pal.bg, width: 96 }}>
        <Bottle
          svg={product.bottleSvg}
          name={product.name}
          sku={product.sku}
          cat={product.cat}
          photo={product.photo}
          accentHex={product.accentHex || pal.accent}
          bgHex={product.bgHex || pal.bg}
          liquidHex={product.liquidHex || pal.liquid}
          labelHex={product.labelHex || pal.label}
          inkHex={product.inkHex || pal.ink}
          liquidPct={product.liquidPct ?? 0.7}
        />
      </Link>
      <div className="flex-1">
        <p className="font-mono text-xs opacity-60 lowercase">{product.rasa || product.cat || "menu"}</p>
        <Link href={`/shop/${product.slug}`} className="font-serif italic text-2xl tr-link">
          {product.name}
        </Link>
        <p className="font-mono text-sm mt-1">
          Rp {product.priceCents.toLocaleString("id-ID")} <span className="opacity-50">/ botol</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-full border border-ink overflow-hidden">
          <button
            onClick={() => update(quantity - 1)}
            disabled={pending}
            className="px-3 py-2 hover:bg-ink hover:text-cream disabled:opacity-50"
            aria-label="kurangi"
          >−</button>
          <span className="px-3 font-mono text-sm w-8 text-center">{quantity}</span>
          <button
            onClick={() => update(quantity + 1)}
            disabled={pending}
            className="px-3 py-2 hover:bg-ink hover:text-cream disabled:opacity-50"
            aria-label="tambah"
          >+</button>
        </div>
        <button
          onClick={() => update(0)}
          disabled={pending}
          className="font-mono text-xs opacity-60 hover:opacity-100 hover:text-orange transition lowercase"
        >
          hapus
        </button>
      </div>
      <div className="font-serif italic text-2xl text-right min-w-[110px]">
        Rp {(product.priceCents * quantity).toLocaleString("id-ID")}
      </div>
    </div>
  );
}
