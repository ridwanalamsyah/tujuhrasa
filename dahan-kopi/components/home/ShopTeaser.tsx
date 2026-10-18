import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";
import { products } from "@/data/products";
import { home } from "@/data/site";

export function ShopTeaser() {
  const picks = home.featuredProducts
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p) => p !== undefined);

  return (
    <Container className="py-20 lg:py-28">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="label text-muted">{home.shopLabel}</p>
          <h2 className="display-1 mt-2">{home.shopTitle}</h2>
        </div>
        <Link href="/shop" className="label shrink-0 underline underline-offset-4">
          Semua produk
        </Link>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {picks.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
