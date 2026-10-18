import Image from "next/image";
import Link from "next/link";
import { home, literSeries } from "@/data/site";
import { formatPrice } from "@/lib/format";

/** Liter Series: foto botol asli + harga. */
export function Liter() {
  return (
    <section aria-labelledby="liter-judul" className="bg-paper">
      <div className="mx-auto grid max-w-[75rem] items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
        <div className="lg:order-2">
          <div className="relative aspect-[1400/982]">
            <Image
              src={home.liter.image}
              alt={home.liter.alt}
              fill
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <p lang="en" className="kicker text-coffee">
            {literSeries.label}
          </p>
          <h2 id="liter-judul" className="display-1 mt-4 text-espresso">
            {literSeries.title}
          </h2>
          <p className="body-lg mt-6 max-w-md text-espresso/80">{literSeries.intro}</p>
          <ul className="mt-8 max-w-md divide-y divide-espresso/15 border-y border-espresso/15">
            {literSeries.items.map((it) => (
              <li key={it.id}>
                <Link
                  href={`/shop/${it.slug}`}
                  className="group flex items-baseline justify-between gap-4 py-4"
                >
                  <span className="display-3 text-espresso group-hover:underline group-hover:underline-offset-4">
                    {it.name}
                  </span>
                  <span className="text-small text-muted">
                    {formatPrice(it.prices[0].price)} / {it.prices[0].label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/shop"
            className="kicker mt-10 inline-flex min-h-12 items-center rounded-full bg-espresso px-7 text-white transition-opacity hover:opacity-85"
          >
            Pesan Liter Series
          </Link>
        </div>
      </div>
    </section>
  );
}
