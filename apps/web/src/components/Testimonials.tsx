"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const ITEMS = [
  {
    quote:
      "Halal jelas, harga 10rban, rasa kafe. Buat bekal ke kelas pagi enak banget, gak perlu mampir kantin lagi.",
    author: "Salma",
    role: "Mahasiswi · Cibiru, Bandung",
  },
  {
    quote:
      "Order siang, sore sampai kos pakai GoSend. Matcha-nya beneran fresh, gak terlalu manis. Wajib banget pas weekend.",
    author: "Faris",
    role: "Mahasiswa Tel-U · Dayeuhkolot",
  },
  {
    quote:
      "Saya cari kopi yang halal MUI dan gak ada perasa buatan. Tujuh Rasa pas banget, dan ramah kantong anak kos.",
    author: "Hanif",
    role: "Mahasiswa ITB · Lembong",
  },
  {
    quote:
      "Kopi susu gula arennya juara. Tim kampusnya juga responsif di WA. Senang dukung produk mahasiswa Bandung.",
    author: "Bu Lia",
    role: "Dosen · Bandung",
  },
];

export function Testimonials() {
  const [i, setI] = useState(0);
  const item = ITEMS[i];
  const prev = () => setI((v) => (v - 1 + ITEMS.length) % ITEMS.length);
  const next = () => setI((v) => (v + 1) % ITEMS.length);

  return (
    <section className="container-tr py-16 sm:py-24">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-14 items-start">
        <div>
          <p className="eyebrow mb-3">Kata tetangga</p>
          <h2 className="font-display font-black text-[clamp(32px,4.5vw,56px)] leading-[0.98] tracking-tight">
            Suara dari<br />
            <span className="tr-highlight">meja sebelah.</span>
          </h2>
          <p className="font-hand text-[var(--tr-brick-deep)] text-2xl mt-4">
            200+ pelanggan tetap.
          </p>
          <p className="mt-3 text-[var(--tr-text-soft)] max-w-md leading-relaxed text-sm sm:text-base">
            Yang mereka bilang tentang kopi botolan kami — apa adanya,
            tidak di-filter.
          </p>
        </div>
        <div>
          <div className="card-stamp p-7 sm:p-9 min-h-[260px] bg-[var(--tr-paper)]">
            <Quote className="h-7 w-7 text-[var(--tr-brick)] mb-4" />
            <p
              key={i}
              className="font-display-italic text-xl sm:text-2xl leading-snug text-[var(--tr-ink)] animate-fade-up"
            >
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-6 flex items-end justify-between gap-3 flex-wrap">
              <div>
                <p className="font-display font-bold text-[var(--tr-ink)]">
                  {item.author}
                </p>
                <p className="text-sm text-[var(--tr-text-muted)]">
                  {item.role}
                </p>
              </div>
              <div className="flex gap-0.5 text-[var(--tr-brick)] text-lg">
                {Array.from({ length: 5 }).map((_, k) => (
                  <span key={k} aria-hidden>★</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex gap-1.5">
              {ITEMS.map((_, k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setI(k)}
                  aria-label={`testimoni ${k + 1}`}
                  className={
                    "h-2 transition-all rounded-sm border border-[var(--tr-ink)] " +
                    (i === k
                      ? "w-8 bg-[var(--tr-brick)]"
                      : "w-2 bg-[var(--tr-paper)]")
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="sebelumnya"
                className="w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] grid place-items-center hover:bg-[var(--tr-paper-2)] hover:shadow-stamp-sm hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="berikutnya"
                className="w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] grid place-items-center hover:bg-[var(--tr-paper-2)] hover:shadow-stamp-sm hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all"
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
