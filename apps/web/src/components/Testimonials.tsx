"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const ITEMS = [
  {
    quote:
      "Botolnya bener-bener kayak baru dibikin di kafe. Matchanya gak pahit, manisnya pas. Anak saya minta tiap minggu.",
    author: "Bu Rini",
    role: "Mama 2 anak · Tebet",
  },
  {
    quote:
      "Order pagi, sebelum jam 3 sore udah sampai kantor. Buat meeting Senin & Kamis, ini wajib.",
    author: "Pak Rio",
    role: "Founder · co-working SCBD",
  },
  {
    quote:
      "Saya alergi susu sapi — barista WA balas dalam 5 menit kasih opsi pakai oat milk. Ini level layanan kafe boutique.",
    author: "Kak Dina",
    role: "Blogger food · Kemang",
  },
  {
    quote:
      "Akhirnya kopi botol Indonesia yang gak terlalu manis tapi tetap khas. Kopi susu gula aren-nya juara.",
    author: "Mas Eko",
    role: "Pelanggan tetap · Bintaro",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const item = ITEMS[i];
  const prev = () => setI((v) => (v - 1 + ITEMS.length) % ITEMS.length);
  const next = () => setI((v) => (v + 1) % ITEMS.length);

  return (
    <section className="container-tr py-16 sm:py-20">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12 items-center">
        <div>
          <p className="eyebrow mb-3">/ kata tetangga kami</p>
          <h2 className="h-display text-[clamp(32px,4.5vw,52px)]">
            Suara dari{" "}
            <span className="tr-highlight">meja sebelah.</span>
          </h2>
          <p className="mt-4 text-[var(--tr-text-soft)] max-w-md leading-relaxed">
            200+ pelanggan tetap tiap bulan. Berikut yang mereka bilang
            tentang kopi botolan kami.
          </p>
        </div>
        <div className="relative">
          <div className="rounded-3xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] shadow-[var(--tr-shadow-card)] p-8 sm:p-10 min-h-[260px]">
            <Quote className="h-8 w-8 text-[var(--tr-orange)] mb-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-serif italic text-xl sm:text-2xl leading-snug text-[var(--tr-ink)]">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[var(--tr-ink)]">
                      {item.author}
                    </p>
                    <p className="text-sm text-[var(--tr-text-muted)]">
                      {item.role}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span
                        key={k}
                        className="text-[var(--tr-orange)]"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {ITEMS.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`testimoni ${k + 1}`}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (i === k
                      ? "w-8 bg-[var(--tr-orange)]"
                      : "w-1.5 bg-[var(--tr-border-strong)]")
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="sebelumnya"
                className="w-10 h-10 rounded-full border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] grid place-items-center hover:bg-[var(--tr-paper-2)] transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="berikutnya"
                className="w-10 h-10 rounded-full border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] grid place-items-center hover:bg-[var(--tr-paper-2)] transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
