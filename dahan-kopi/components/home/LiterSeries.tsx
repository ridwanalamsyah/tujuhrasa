"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { literSeries } from "@/data/site";
import { formatPrice } from "@/lib/format";

/** Liter Series: pilih rasa, ilustrasi gedung Dahan (dari label botol di Canva) ikut berganti. */
export function LiterSeries() {
  const items = literSeries.items;
  const [active, setActive] = useState(0);
  const item = items[active];

  return (
    <section aria-labelledby="liter-judul" className="border-t border-line">
      <Container className="grid gap-10 py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <div className="relative aspect-[1100/1412] w-full overflow-hidden bg-paper lg:col-span-5">
          {items.map((it, i) => (
            <Image
              key={it.id}
              src={it.scene}
              alt={i === active ? `Ilustrasi gedung Dahan Kopi, label ${it.name}` : ""}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={`object-cover transition-opacity duration-500 ease-soft ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col lg:col-span-6 lg:col-start-7">
          <h2 id="liter-judul" className="display-1">
            {literSeries.title}
          </h2>
          <p className="mt-3 max-w-md text-muted">{literSeries.intro}</p>

          <ul className="mt-10 border-t border-line">
            {items.map((it, i) => (
              <li key={it.id} className="border-b border-line">
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex min-h-16 w-full flex-wrap items-center justify-between gap-x-4 gap-y-1 py-4 text-left transition-colors ${
                    i === active ? "text-espresso" : "text-muted hover:text-espresso"
                  }`}
                >
                  <span className="display-3">{it.name}</span>
                  <span className="text-small">
                    {it.prices.map((p) => `${p.label} ${formatPrice(p.price)}`).join(" · ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-md">{item.text}</p>
          <Link
            href={`/shop/${item.slug}`}
            className="mt-6 inline-flex min-h-12 w-fit items-center bg-espresso px-6 text-[0.9375rem] font-medium text-cream hover:bg-espresso-2"
          >
            Pesan {item.name}
          </Link>
        </div>
      </Container>
    </section>
  );
}
