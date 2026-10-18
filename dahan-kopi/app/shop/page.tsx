import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopFilter } from "@/components/shop/ShopFilter";
import { Container } from "@/components/ui/Container";
import { categories, products, shop } from "@/data/products";
import { stores } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Shop",
  description:
    "Pesan Liter Series Dahan Kopi: Dahan Iced, Helena, dan Greentea Latte. Produk lain di Tokopedia dan Shopee.",
  path: "/shop",
});

const marketplaces = [
  { name: "Tokopedia", href: stores.tokopedia },
  { name: "Shopee", href: stores.shopee },
].filter((m) => m.href);

export default function ShopPage() {
  const grid = (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-10 lg:grid-cols-3">
      {products.map((p) => (
        <li key={p.slug}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
  return (
    <Container className="pb-24 pt-10 lg:pt-16">
      <h1 className="display-hero">{shop.title}</h1>
      <p className="mt-3 max-w-xl text-muted">{shop.intro}</p>
      <div className="mt-10">
        {categories.length > 1 ? (
          <ShopFilter
            categories={categories}
            items={products.map((p) => ({
              key: p.slug,
              category: p.category,
              node: <ProductCard product={p} />,
            }))}
          />
        ) : (
          grid
        )}
      </div>
      {marketplaces.length > 0 && (
        <section aria-labelledby="toko-judul" className="mt-20 border-t border-line pt-10">
          <h2 id="toko-judul" className="display-2">
            Toko resmi Dahan
          </h2>
          <ul className="mt-6 border-t border-line">
            {marketplaces.map((m) => (
              <li key={m.name} className="border-b border-line">
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-14 items-center justify-between py-3"
                >
                  <span className="font-medium">{m.name}</span>
                  <span className="text-small text-muted">
                    dahanindonesia{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block text-espresso transition-transform group-hover:translate-x-1"
                    >
                      ↗
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
