import { GrosirForm } from "@/components/GrosirForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Grosir & Group Buy — Tujuh Rasa",
  description:
    "Pesan grosir untuk acara, kantor, atau gathering. Group-buy dan pre-order seasonal juga.",
};

const TIERS = [
  { qty: "12 – 23 botol", disc: "5%", note: "cocok untuk meeting kantor / arisan kecil" },
  { qty: "24 – 47 botol", disc: "8%", note: "untuk acara komunitas / kelas / RT" },
  { qty: "48 – 99 botol", disc: "12%", note: "untuk gathering kantor / event" },
  { qty: "100+ botol", disc: "15%", note: "wedding / corporate event / koperasi" },
];

const PREORDER = {
  title: "Pre-order: Batch Juni — Single Origin Toraja Spesial",
  desc: "Edisi terbatas 100 botol, biji dari koperasi tani Tana Toraja musim panen Juni 2026. Notes: dark cherry, syrupy, spicy. Ready dikirim akhir Juni.",
  price: "Rp 18.000 / botol (vs reguler Rp 10rb)",
  deadline: "Tutup: 15 Juni 2026, 23:59 WIB",
};

export default function GrosirPage() {
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Grosir &amp; group buy</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              pesan rame-rame —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Pesan banyak.{" "}
            <em className="text-[var(--tr-brick)]">Diskon banyak.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Untuk acara, gathering, kantor, sekolah, atau komunitas. Pesan dari
            12 botol sudah dapat diskon. Kalau lebih dari 100 botol, kami bisa
            custom label.
          </p>
        </div>
      </section>

      <div className="container-tr py-12 sm:py-16 space-y-12">
        <section>
          <p className="eyebrow mb-3">Tiered diskon</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((t) => (
              <article key={t.qty} className="card-stamp p-5">
                <p className="font-display font-bold text-lg">{t.qty}</p>
                <p className="text-4xl font-display font-black text-[var(--tr-brick)] mt-2 leading-none tabular-nums">
                  {t.disc}
                </p>
                <p className="text-xs mt-2 text-[var(--tr-text-soft)] leading-relaxed">
                  {t.note}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <article className="card-stamp p-6 sm:p-7 bg-[var(--tr-mustard-soft)]/35">
            <p className="eyebrow mb-2">Pre-order spesial</p>
            <p className="font-display font-bold text-2xl leading-snug">{PREORDER.title}</p>
            <p className="text-[var(--tr-text-soft)] mt-2 text-sm leading-relaxed">
              {PREORDER.desc}
            </p>
            <p className="font-mono text-sm mt-3 border-t-2 border-[var(--tr-ink)]/15 pt-3">
              {PREORDER.price}
            </p>
            <p className="font-mono text-xs text-[var(--tr-text-muted)] mt-1">
              {PREORDER.deadline}
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer btn btn-primary inline-block list-none">
                Ikut pre-order
              </summary>
              <div className="mt-4">
                <GrosirForm type="pre-order" />
              </div>
            </details>
          </article>

          <article className="card-stamp p-6 sm:p-7 bg-[var(--tr-paper-2)]">
            <p className="eyebrow mb-2">Group buy</p>
            <p className="font-display font-bold text-2xl leading-snug">
              Kumpulin tetangga, pesan barengan
            </p>
            <p className="text-[var(--tr-text-soft)] mt-2 text-sm leading-relaxed">
              Buat grup WA, kumpulkan minimum 24 botol antar tetangga RT/kantor.
              Otomatis dapat diskon 8%, gratis ongkir untuk satu titik antar.
            </p>
            <details className="mt-4">
              <summary className="cursor-pointer btn btn-secondary inline-block list-none">
                Daftar group buy
              </summary>
              <div className="mt-4">
                <GrosirForm type="group-buy" />
              </div>
            </details>
          </article>
        </section>

        <section>
          <p className="eyebrow mb-3">Pesan grosir reguler</p>
          <div className="card-stamp p-6 sm:p-7">
            <GrosirForm type="grosir" />
          </div>
        </section>
      </div>
    </>
  );
}
