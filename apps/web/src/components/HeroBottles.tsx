"use client";
import Link from "next/link";
import { motion } from "framer-motion";
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

export function HeroBottles({ items }: { items: Featured[] }) {
  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
      {items.map((p, i) => {
        const rot = i % 2 === 0 ? -7 : 5;
        const left = [4, 28, 14, 44][i % 4];
        const top = [2, 14, 30, 6][i % 4];
        const zIndex = 10 - i;
        const delay = i * 0.08;
        const dur = 5 + i * 0.7;
        return (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: "44%",
              zIndex,
            }}
            initial={{ opacity: 0, y: 30, rotate: rot * 1.5 }}
            animate={{
              opacity: 1,
              y: [0, -12, 0],
              rotate: rot,
            }}
            transition={{
              opacity: { duration: 0.6, delay },
              rotate: { duration: 0.6, delay },
              y: {
                duration: dur,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay + 0.5,
              },
            }}
            whileHover={{
              y: -22,
              rotate: rot - 3,
              transition: { type: "spring", stiffness: 280, damping: 18 },
            }}
          >
            <Link
              href={`/shop/${p.slug}`}
              aria-label={`Lihat ${p.name}`}
              className="block"
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
              />
            </Link>
          </motion.div>
        );
      })}
      {/* Hand-drawn note at top right */}
      <motion.div
        initial={{ opacity: 0, x: 12, rotate: -2 }}
        animate={{ opacity: 1, x: 0, rotate: 4 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="hidden sm:block absolute -top-2 right-2 hand-caption text-[var(--tr-orange-deep)] z-20"
      >
        <span className="inline-block bg-[var(--tr-paper)] px-3 py-1.5 rounded-full border border-[var(--tr-orange)] shadow-[1px_2px_0_var(--tr-ink)]">
          klik botolnya 👆
        </span>
      </motion.div>
    </div>
  );
}
