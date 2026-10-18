"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { hero, literSeries, site } from "@/data/site";
import { formatPrice } from "@/lib/format";

const AUTOPLAY_MS = 5000;

/**
 * Layar pertama: ilustrasi gedung Dahan dari label Liter Series di Canva.
 * Pilih rasa, langit, warna latar, dan label ikut berganti (berganti sendiri sampai pengunjung memilih).
 */
export function Hero() {
  const items = literSeries.items;
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const item = items[active];

  useEffect(() => {
    if (touched || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % items.length), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [touched, items.length]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length;
    pick(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  return (
    <section
      aria-labelledby="hero-judul"
      className="relative overflow-hidden transition-colors duration-700 ease-soft"
      style={{ backgroundColor: item.sky }}
    >
      <div className="mx-auto grid max-w-[75rem] gap-10 px-4 pb-14 pt-8 sm:px-6 lg:min-h-[calc(100svh-var(--header-h))] lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-10 lg:py-12">
        <div className="lg:col-span-6">
          <p className="label">{hero.kicker}</p>
          <h1 id="hero-judul" lang="en" className="display-hero mt-4 max-w-xl">
            {site.tagline}
          </h1>

          <div
            role="tablist"
            aria-label="Pilih rasa Liter Series"
            onKeyDown={onKey}
            className="mt-10 flex flex-wrap gap-2"
          >
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                id={`hero-tab-${it.id}`}
                aria-selected={i === active}
                aria-controls="hero-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => pick(i)}
                className={`group inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-espresso py-1 pl-1 pr-5 text-[0.9375rem] font-semibold transition-colors ${
                  i === active ? "bg-espresso text-cream" : "hover:bg-espresso/10"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="h-9 w-9 shrink-0 rounded-full border-2 border-current transition-transform duration-300 ease-soft group-hover:rotate-12"
                  style={{ backgroundColor: it.sky }}
                />
                {it.name}
              </button>
            ))}
          </div>

          <div
            id="hero-panel"
            role="tabpanel"
            aria-labelledby={`hero-tab-${item.id}`}
            className="mt-6 max-w-md"
          >
            <p lang="en" className="label">
              {item.notes}
            </p>
            <p className="body-lg mt-2">{item.text}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`/shop/${item.slug}`}
                className="inline-flex min-h-12 items-center rounded-full bg-espresso px-6 font-semibold text-cream transition-transform duration-200 ease-soft hover:-translate-y-0.5"
              >
                Pesan {item.name} · {formatPrice(item.prices[0].price)}
              </Link>
              <Link href="/shop" className="label underline underline-offset-4 hover:no-underline">
                Lihat semua produk
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <button
            type="button"
            onClick={() => pick((active + 1) % items.length)}
            aria-label={`Ganti rasa, sekarang ${item.name}`}
            className="relative mx-auto block aspect-[1100/1412] w-full max-w-[26rem] rotate-[1.5deg] overflow-hidden rounded-[1.75rem] border-[3px] border-espresso shadow-[10px_12px_0_0_var(--color-espresso)] transition-transform duration-500 ease-soft hover:rotate-0 lg:max-w-[30rem]"
          >
            {items.map((it, i) => (
              <Image
                key={it.id}
                src={it.scene}
                alt={i === active ? `Ilustrasi gedung Dahan Kopi, label ${it.name}` : ""}
                fill
                sizes="(min-width: 1024px) 30rem, 90vw"
                preload={i === 0}
                className={`object-cover transition-opacity duration-700 ease-soft ${
                  i === active ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </button>
          <p className="label mt-6 text-center">{hero.footnote}</p>
        </div>
      </div>
    </section>
  );
}
