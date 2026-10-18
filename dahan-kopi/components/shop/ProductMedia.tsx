import Image from "next/image";
import { ProductArt } from "@/components/shop/ProductArt";
import { imageExists } from "@/lib/image-exists";
import type { Product } from "@/lib/types";

/** Foto produk jika ada, selain itu gambar label berwarna. Selalu persegi. */
export function ProductMedia({
  product,
  sizes,
  preload = false,
  className = "",
}: {
  product: Product;
  sizes: string;
  preload?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative aspect-square overflow-hidden ${className}`}
      style={{ background: product.art.bg }}
    >
      {product.image && imageExists(product.image) ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          preload={preload}
          className="object-cover"
        />
      ) : (
        <ProductArt product={product} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
