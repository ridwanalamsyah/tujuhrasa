import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { home, literSeries } from "@/data/site";
import { formatPrice } from "@/lib/format";

/** Liter Series: foto botol asli + harga. */
export function Liter() {
  return (
    <section aria-labelledby="liter-judul" className="bg-paper">
      <div className="mx-auto grid max-w-[90rem] lg:grid-cols-2">
        <div className="relative aspect-[1400/982] self-center">
          <Image
            src={home.liter.image}
            alt={home.liter.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <Container className="flex flex-col justify-center py-14 lg:max-w-[36rem] lg:px-16">
          <h2 id="liter-judul" className="display-1">
            {literSeries.title}
          </h2>
          <p className="mt-3 max-w-md text-muted">{literSeries.intro}</p>
          <ul className="mt-8 space-y-4">
            {literSeries.items.map((it) => (
              <li key={it.id}>
                <Link href={`/shop/${it.slug}`} className="group block">
                  <span className="font-medium group-hover:underline group-hover:underline-offset-4">
                    {it.name}
                  </span>
                  <span className="block text-small text-muted">
                    {it.prices.map((p) => `${p.label} ${formatPrice(p.price)}`).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/shop"
            className="mt-10 inline-flex min-h-12 w-fit items-center bg-espresso px-6 font-medium text-white transition-opacity hover:opacity-85"
          >
            Pesan Liter Series
          </Link>
        </Container>
      </div>
    </section>
  );
}
