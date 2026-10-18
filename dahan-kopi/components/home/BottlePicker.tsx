"use client";

import { useState, type KeyboardEvent } from "react";
import { literSeries } from "@/data/site";
import { formatPrice } from "@/lib/format";

/**
 * "Dahan in a bottle": pilih rasa, langit ilustrasi gedung Dahan dan warna latar ikut berganti.
 * Ilustrasi diambil dari label botol Liter Series di Canva.
 */
export function BottlePicker() {
  const [active, setActive] = useState(0);
  const items = literSeries.items;
  const item = items[active];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (active + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length;
    setActive(next);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  return (
    <section
      aria-labelledby="liter-judul"
      className="transition-colors duration-700 ease-soft"
      style={{ backgroundColor: item.sky }}
    >
      <div className="mx-auto max-w-[75rem] px-4 py-16 sm:px-6 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-10 lg:py-24">
        <div className="relative aspect-[365/344] w-full max-w-[30rem] overflow-hidden lg:col-span-6">
          {items.map((it, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={it.id}
              src={it.image}
              alt={i === active ? `Ilustrasi gedung Dahan Kopi, label ${it.name}` : ""}
              loading="lazy"
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-soft ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>

        <div className="mt-10 lg:col-span-6 lg:mt-0">
          <p className="label">{literSeries.label}</p>
          <h2 id="liter-judul" className="display-1 mt-2">
            {literSeries.title}
          </h2>
          <p className="mt-3 max-w-md">{literSeries.intro}</p>

          <div
            role="tablist"
            aria-label="Pilih rasa"
            onKeyDown={onKey}
            className="mt-8 flex flex-wrap gap-2"
          >
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                role="tab"
                id={`tab-${it.id}`}
                aria-selected={i === active}
                aria-controls="liter-panel"
                tabIndex={i === active ? 0 : -1}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                className={`font-hand min-h-12 border-2 border-espresso px-5 text-[1.375rem] leading-none transition-colors ${
                  i === active ? "bg-espresso text-cream" : "hover:bg-espresso/10"
                }`}
              >
                {it.name}
              </button>
            ))}
          </div>

          <div
            id="liter-panel"
            role="tabpanel"
            aria-labelledby={`tab-${item.id}`}
            className="mt-6 max-w-md"
          >
            <p lang="en" className="label">
              {item.notes}
            </p>
            <p className="body-lg mt-2">{item.text}</p>
            <ul className="label mt-4 flex gap-6">
              {item.prices.map((p) => (
                <li key={p.label}>
                  {p.label} · {formatPrice(p.price)}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-small">Tersedia di kedai Dahan, Banjaran.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
