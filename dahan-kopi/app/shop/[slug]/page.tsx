import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { AddToCart } from "@/components/shop/AddToCart";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductMedia } from "@/components/shop/ProductMedia";
import { Container } from "@/components/ui/Container";
import { categories, getProduct, products, shop } from "@/data/products";
import { formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/shop/${product.slug}`,
  });
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const category = categories.find((c) => c.id === product.category);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <Container className="pb-20 pt-6 lg:pt-10">
        <nav aria-label="Breadcrumb" className="label text-muted">
          <Link href="/shop" className="hover:text-espresso">
            Shop
          </Link>{" "}
          / {category?.name}
        </nav>

        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-12">
          <ProductMedia
            product={product}
            sizes="(min-width: 1024px) 50vw, 100vw"
            preload
            className="lg:col-span-7"
          />

          <div className="mt-8 lg:col-span-5 lg:mt-0">
            <h1 className="display-1">{product.name}</h1>
            <p className="label mt-3 text-muted">{product.tagline}</p>
            <p className="body-lg mt-6">{product.description}</p>

            {product.details && (
              <dl className="mt-6 divide-y divide-line border-y border-line">
                {product.details.map((d) => (
                  <div key={d.label} className="flex justify-between gap-4 py-2.5 text-small">
                    <dt className="text-muted">{d.label}</dt>
                    <dd className="text-right">{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8">
              <AddToCart product={product} />
            </div>

            <p className="mt-6 text-small text-muted">
              {shop.shipping.note} Ongkir {formatPrice(shop.shipping.flatRate)}
              {shop.shipping.freeOver > 0 &&
                `, gratis untuk belanja di atas ${formatPrice(shop.shipping.freeOver)}`}
              .
            </p>
            {shop.sampleNotice && (
              <p className="label mt-3 text-coffee">Produk & harga masih contoh</p>
            )}
          </div>
        </div>
      </Container>

      {related.length > 0 && (
        <Container className="pb-24">
          <h2 className="label border-t border-line pt-8">Lainnya dari {category?.name}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} />
              </li>
            ))}
          </ul>
        </Container>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          brand: { "@type": "Brand", name: "Dahan Kopi" },
          url: absoluteUrl(`/shop/${product.slug}`),
          offers: product.variants.map((v) => ({
            "@type": "Offer",
            name: v.label,
            price: v.price,
            priceCurrency: "IDR",
            availability: "https://schema.org/InStock",
          })),
        }}
      />
    </>
  );
}
