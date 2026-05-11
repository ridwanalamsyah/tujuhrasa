"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Stamp, ArrowRight } from "lucide-react";

const SAMPLE_STAMPS = [
  { label: "Aceh Gayo", color: "var(--tr-cocoa)", unlocked: true },
  { label: "Pandan", color: "var(--tr-leaf)", unlocked: true },
  { label: "Matcha", color: "var(--tr-leaf-deep)", unlocked: true },
  { label: "Taro", color: "var(--tr-plum)", unlocked: false },
  { label: "Brown Sugar", color: "var(--tr-cocoa)", unlocked: false },
  { label: "Toraja", color: "var(--tr-orange-deep)", unlocked: false },
];

export function CoffeePassportTeaser() {
  return (
    <section className="container-tr py-16 sm:py-20">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-xs eyebrow mb-3">
            <Stamp className="h-3.5 w-3.5" /> baru · fitur loyalti
          </div>
          <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
            Coffee passport,<br />
            <span className="tr-highlight">koleksi stempelmu.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[var(--tr-text-soft)] leading-relaxed">
            Tiap rasa yang kamu coba, dapat satu stempel digital. Penuhi
            semua 7 rasa untuk dapat <em>botol kenangan</em> dengan namamu
            terukir di label. Plus diskon 7% untuk semua order setelahnya.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/poin" className="btn btn-primary">
              Lihat paspormu <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop" className="btn btn-secondary">
              Mulai koleksi
            </Link>
          </div>
        </div>
        <div className="relative">
          <div
            className="rounded-3xl border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] p-6 shadow-[6px_6px_0_var(--tr-ink)]"
            style={{ transform: "rotate(2deg)" }}
          >
            <p className="hand-caption text-[var(--tr-orange-deep)] text-lg mb-3">
              passport No. 0142
            </p>
            <p className="font-serif italic text-2xl text-[var(--tr-ink)] mb-4">
              Bu Rini
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {SAMPLE_STAMPS.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ scale: 0.8, opacity: 0, rotate: -15 }}
                  whileInView={{
                    scale: 1,
                    opacity: 1,
                    rotate: s.unlocked ? (i % 2 ? -6 : 8) : 0,
                  }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={
                    "aspect-square rounded-full grid place-items-center text-center text-[10px] font-bold border-2 " +
                    (s.unlocked ? "" : "opacity-30 border-dashed")
                  }
                  style={{
                    borderColor: s.unlocked ? s.color : "var(--tr-border-strong)",
                    background: s.unlocked
                      ? `${s.color}1f`
                      : "var(--tr-paper-2)",
                    color: s.unlocked ? s.color : "var(--tr-text-muted)",
                  }}
                >
                  {s.label}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-[var(--tr-border-strong)] flex justify-between text-xs">
              <span className="text-[var(--tr-text-muted)]">progres</span>
              <span className="font-semibold text-[var(--tr-ink)]">
                3 / 7 stempel
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
