import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/ProductCard";
import { Container } from "@/components/ui/Container";
import { products } from "@/data/products";
import { literSeries } from "@/data/site";

/** Liter Series di beranda: foto botol asli + tiga produk dengan ilustrasi labelnya. */
export function LiterShop() {
  const liter = products.filter((p) => p.category === "liter");
  return (
    <Container className="py-20 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-5">
          <p className="label text-muted">{literSeries.label}</p>
          <h2 className="display-1 mt-2">{literSeries.title}</h2>
          <p className="body-lg mt-4 max-w-md">{literSeries.intro}</p>
          <Link
            href="/shop"
            className="label mt-6 inline-block underline underline-offset-4 hover:no-underline"
          >
            Semua produk
          </Link>
        </div>
        <div className="relative aspect-[1400/982] overflow-hidden rounded-[1.75rem] bg-[#f0f0f0] lg:col-span-7">
          <Image
            src="/images/dahan/liter-bottles.webp"
            alt="Tiga botol Liter Series Dahan: Greentea Latte, Dahan Iced, dan Helena"
            fill
            sizes="(min-width: 1024px) 42rem, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <ul className="mt-12 grid gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6">
        {liter.map((p) => (
          <li key={p.slug}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </Container>
  );
}
