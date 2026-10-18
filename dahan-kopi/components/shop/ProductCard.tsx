import Link from "next/link";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const from = Math.min(...product.variants.map((v) => v.price));
  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <ProductMedia
        product={product}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="transition-transform duration-300 ease-soft group-hover:-translate-y-1"
      />
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
          {product.name}
        </h3>
      </div>
      <p className="mt-0.5 text-small text-muted">{product.tagline}</p>
      <p className="label mt-2 text-espresso">
        {product.variants.length > 1 ? "Mulai " : ""}
        {formatPrice(from)}
      </p>
    </Link>
  );
}
