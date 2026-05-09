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
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ grosir & group buy</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Pesan banyak. Dapat diskon banyak.
      </h1>
      <p className="max-w-2xl opacity-80 mb-10">
        Untuk acara, gathering, kantor, sekolah, atau komunitas. Pesan dari 12 botol
        sudah dapat diskon. Kalau lebih dari 100 botol, kami bisa custom label.
      </p>

      <section className="mb-12">
        <p className="eyebrow mb-3">/ tiered diskon</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((t) => (
            <article
              key={t.qty}
              className="rounded-2xl border border-ink/20 bg-paper p-5"
            >
              <p className="font-serif italic text-xl">{t.qty}</p>
              <p className="text-3xl font-display text-orange mt-2">{t.disc}</p>
              <p className="text-xs mt-2 opacity-70">{t.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-12 grid lg:grid-cols-2 gap-6">
        <article className="rounded-3xl border border-orange/40 bg-orange/5 p-6">
          <p className="eyebrow mb-2 text-orange">/ pre-order spesial</p>
          <p className="font-serif italic text-2xl">{PREORDER.title}</p>
          <p className="opacity-80 mt-2 text-sm">{PREORDER.desc}</p>
          <p className="font-mono text-sm mt-3">{PREORDER.price}</p>
          <p className="font-mono text-xs opacity-70">{PREORDER.deadline}</p>
          <details className="mt-4">
            <summary className="cursor-pointer btn-primary inline-block">
              ikut pre-order
            </summary>
            <div className="mt-4">
              <GrosirForm type="pre-order" />
            </div>
          </details>
        </article>

        <article className="rounded-3xl border border-leaf/40 bg-leaf/5 p-6">
          <p className="eyebrow mb-2 text-leaf">/ group buy</p>
          <p className="font-serif italic text-2xl">
            Kumpulin tetangga, pesan barengan
          </p>
          <p className="opacity-80 mt-2 text-sm">
            Buat grup WA, kumpulkan minimum 24 botol antar tetangga RT/kantor.
            Otomatis dapat diskon 8%, gratis ongkir untuk satu titik antar.
          </p>
          <details className="mt-4">
            <summary className="cursor-pointer btn-secondary inline-block">
              daftar group buy
            </summary>
            <div className="mt-4">
              <GrosirForm type="group-buy" />
            </div>
          </details>
        </article>
      </section>

      <section className="mb-12">
        <p className="eyebrow mb-3">/ pesan grosir reguler</p>
        <div className="rounded-3xl border border-ink/20 bg-paper p-6">
          <GrosirForm type="grosir" />
        </div>
      </section>
    </div>
  );
}
