import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilter } from "@/components/shop/ShopFilter";
import { Container } from "@/components/ui/Container";
import { categories, products, shop } from "@/data/products";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "Belanja biji kopi, drip bag, dan merch Dahan Kopi. Dikirim dari Banjaran ke seluruh Indonesia.",
  path: "/shop",
});

export default function ShopPage() {
  return (
    <Container className="pb-24 pt-10 lg:pt-16">
      <p className="label text-muted">Bawa pulang</p>
      <h1 className="display-1 mt-2">{shop.title}</h1>
      <p className="mt-3 max-w-xl text-muted">{shop.intro}</p>
      {shop.sampleNotice && (
        <p className="label mt-4 inline-block border border-line px-3 py-1.5 text-coffee">
          Biji kopi, drip bag & merch masih contoh
        </p>
      )}
      <div className="mt-10">
        <ShopFilter
          categories={categories}
          items={products.map((p) => ({
            key: p.slug,
            category: p.category,
            node: <ProductCard product={p} />,
          }))}
        />
      </div>
    </Container>
  );
}
