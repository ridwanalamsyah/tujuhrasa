import Link from "next/link";
import { Stamp, ArrowRight } from "lucide-react";

const SAMPLE_STAMPS = [
  { label: "Aceh Gayo", color: "var(--tr-cocoa)", unlocked: true },
  { label: "Pandan", color: "var(--tr-leaf)", unlocked: true },
  { label: "Matcha", color: "var(--tr-leaf-deep)", unlocked: true },
  { label: "Taro", color: "var(--tr-plum)", unlocked: false },
  { label: "Brown Sugar", color: "var(--tr-cocoa)", unlocked: false },
  { label: "Toraja", color: "var(--tr-brick-deep)", unlocked: false },
];

export function CoffeePassportTeaser() {
  return (
    <section className="container-tr py-16 sm:py-24">
      <div className="grid lg:grid-cols-[2fr_1fr] gap-10 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 stamp mb-4">
            <Stamp className="h-3.5 w-3.5" /> Baru · Loyalti
          </div>
          <h2 className="font-display font-black text-[clamp(32px,4.5vw,56px)] leading-[0.98] tracking-tight">
            Coffee passport,<br />
            <span className="tr-highlight">koleksi stempelmu.</span>
          </h2>
          <p className="mt-5 max-w-lg text-[var(--tr-text-soft)] leading-relaxed">
            Tiap rasa yang kamu coba, dapat satu stempel digital. Penuhi
            semua 7 rasa untuk dapat <em>botol kenangan</em> dengan namamu
            terukir di label. Plus diskon 7% untuk semua order setelahnya.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/poin" className="btn btn-primary">
              Lihat paspormu <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/shop" className="btn btn-secondary">
              Mulai koleksi
            </Link>
          </div>
        </div>
        <div className="card-stamp p-6 bg-[var(--tr-paper)]">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)] mb-1">
            Passport No. 0142
          </p>
          <p className="font-display font-bold text-2xl text-[var(--tr-ink)] mb-5">
            Bu Rini
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {SAMPLE_STAMPS.map((s) => (
              <div
                key={s.label}
                className={
                  "aspect-square rounded-full grid place-items-center text-center text-[10px] font-bold border-2 leading-tight px-1 " +
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
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-dashed border-[var(--tr-border-strong)] flex justify-between text-xs">
            <span className="text-[var(--tr-text-muted)] font-mono uppercase tracking-widest">progres</span>
            <span className="font-display font-bold text-[var(--tr-ink)]">
              3 / 7 stempel
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
