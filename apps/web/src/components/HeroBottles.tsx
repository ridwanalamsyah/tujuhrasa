"use client";
import Link from "next/link";
import { Bottle } from "@/components/Bottle";

type Featured = {
  id: string | number;
  slug: string;
  name: string;
  sku?: string;
  cat?: string;
  bottleSvg: string;
  photo?: string | null;
  accentHex: string;
  bgHex: string;
  liquidHex: string;
  labelHex: string;
  inkHex: string;
  liquidPct: number;
};

/**
 * Static hero arrangement — bold, no float / wobble / framer-motion.
 * One featured bottle takes center stage, others sit as a quiet row below.
 */
export function HeroBottles({ items }: { items: Featured[] }) {
  if (items.length === 0) {
    return (
      <div className="aspect-[5/6] grid place-items-center rounded-md border-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)]">
        <p className="font-hand text-3xl text-[var(--tr-text-muted)]">
          menu menyusul…
        </p>
      </div>
    );
  }

  const hero = items[0];
  const rest = items.slice(1, 4);

  return (
    <div className="relative">
      {/* Date stamp */}
      <div className="absolute -top-3 left-4 z-10 stamp bg-[var(--tr-paper)] rotate-[-3deg]">
        <span aria-hidden>●</span> Hari ini
      </div>

      {/* Hero bottle card */}
      <Link
        href={`/shop/${hero.slug}`}
        className="block card-stamp p-6 lg:p-8"
        style={{ background: hero.bgHex }}
        aria-label={`Lihat ${hero.name}`}
      >
        <Bottle
          svg={hero.bottleSvg}
          name={hero.name}
          sku={hero.sku}
          cat={hero.cat}
          photo={hero.photo ?? undefined}
          accentHex={hero.accentHex}
          bgHex={hero.bgHex}
          liquidHex={hero.liquidHex}
          labelHex={hero.labelHex}
          inkHex={hero.inkHex}
          liquidPct={hero.liquidPct}
          className="aspect-[5/7] flex items-center justify-center max-w-[280px] mx-auto"
        />
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest opacity-60">
              {hero.cat || "Spesial"}
            </p>
            <p className="font-display font-black text-2xl leading-tight mt-1">
              {hero.name}
            </p>
          </div>
          <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
            sruput →
          </span>
        </div>
      </Link>

      {/* Quiet row of secondary bottles */}
      {rest.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {rest.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="block card-stamp p-3"
              style={{ background: p.bgHex }}
              aria-label={`Lihat ${p.name}`}
            >
              <Bottle
                svg={p.bottleSvg}
                name={p.name}
                sku={p.sku}
                cat={p.cat}
                photo={p.photo ?? undefined}
                accentHex={p.accentHex}
                bgHex={p.bgHex}
                liquidHex={p.liquidHex}
                labelHex={p.labelHex}
                inkHex={p.inkHex}
                liquidPct={p.liquidPct}
                className="aspect-[4/5] flex items-center justify-center"
              />
              <p className="font-display font-bold text-xs mt-2 leading-tight line-clamp-1">
                {p.name}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
