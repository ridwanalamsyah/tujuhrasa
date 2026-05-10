import { QuizClient } from "@/components/QuizClient";
import { MoodPlayer } from "@/components/MoodPlayer";
import { OriginMap } from "@/components/OriginMap";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Jelajah Rasa — Tujuh Rasa",
  description:
    "Quiz minuman cocok, mood player, peta origin biji, glossary, pairing makanan, BTS produksi, dan catatan founder.",
};

const PAIRINGS = [
  {
    drink: "Kopi Susu Gula Aren",
    foods: ["pisang goreng", "donat empuk", "roti bakar selai srikaya"],
    note: "manis-manis pekat berimbang dengan pahit kopi.",
  },
  {
    drink: "Matcha Latte",
    foods: ["mochi", "cookies butter", "biskuit oat"],
    note: "umami matcha cocok dengan tekstur kenyal & buttery.",
  },
  {
    drink: "Brown Sugar Milk",
    foods: ["bolu kukus", "klepon", "pisang rebus"],
    note: "manis hangat — paling enak sore hujan.",
  },
  {
    drink: "Taro Latte",
    foods: ["onde-onde wijen", "kue lapis", "pisang molen"],
    note: "ungu-vanilla — pasangin sama jajanan tradisional.",
  },
  {
    drink: "Pandan Latte",
    foods: ["lapis legit", "klappertart", "kue putu"],
    note: "harum pandan menggandakan aroma jajan kelapa.",
  },
];

const GLOSSARY = [
  { term: "ekstraksi", def: "proses pengeluaran zat dari biji kopi pakai air panas." },
  { term: "tubruk", def: "metode seduh kopi tradisional Indonesia: bubuk + air panas, langsung diminum." },
  { term: "single origin", def: "biji kopi dari satu kebun / satu desa — tidak campuran." },
  { term: "washed", def: "proses pengolahan kopi: lendir biji dicuci, hasilkan rasa bersih & cerah." },
  { term: "natural", def: "biji kopi dijemur utuh dengan kulit — rasa lebih buah & manis." },
  { term: "roast", def: "tingkat sangrai biji. light/medium/dark, tiap tingkat beda karakter." },
  { term: "crema", def: "busa cokelat keemasan di atas espresso, indikator ekstraksi bagus." },
  { term: "third wave", def: "gerakan kopi spesialti: anggap kopi seperti wine, fokus origin & farmer." },
  { term: "matcha grade upacara", def: "matcha kualitas tertinggi dari Jepang, dipakai upacara teh." },
  { term: "gula aren", def: "gula nira pohon aren (Arenga pinnata) — manis pekat, smoky." },
];

const BTS_STEPS = [
  { step: "01", title: "Biji kopi dari petani", desc: "Aceh Gayo, Toraja, Bali Kintamani — kontrak langsung dengan koperasi tani." },
  { step: "02", title: "Sangrai harian", desc: "Profil sangrai diset per origin, tiap pagi mesin sangrai dipanaskan dulu 30 menit." },
  { step: "03", title: "Brewing pakai V60 / Aeropress", desc: "Tiap batch 2 liter, suhu air 90°C, ratio 1:15." },
  { step: "04", title: "Pasteurisasi flash 95°C", desc: "Cepat-cepat dipanaskan biar mikroba mati, lalu diturunkan ke 4°C." },
  { step: "05", title: "Filling botol kaca steril", desc: "Volume 300 ml, tutup crown cap food-grade, label kraft hand-stamped." },
  { step: "06", title: "Cold chain ke kurir", desc: "Botol selalu di bawah 8°C dari pabrik sampai tangan kamu (maks 4 jam)." },
];

const TIMELINE = [
  { year: "1986", title: "Pak Dirman pulang dari Tana Toraja", desc: "membawa karung biji kopi dan ide buka warung kopi di Tebet." },
  { year: "1992", title: "Warung 'Kopi Pak Dirman' buka", desc: "5 meja kayu, 1 mesin sangrai bekas, kopi tubruk Rp 500." },
  { year: "2008", title: "Anak-anaknya ambil alih", desc: "Mbak Rara & Mas Yudha, fokus ke kafe sehari-hari + jualan biji." },
  { year: "2018", title: "Botol pertama 'Kopi Susu Tetangga'", desc: "1 SKU, 30 botol/hari, awal kopi botolan Tujuh Rasa." },
  { year: "2024", title: "Branding 'Tujuh Rasa'", desc: "Tujuh karakter rasa, lima produk inti, kafe + grosir + retail." },
  { year: "2026", title: "Web e-commerce + ERP terintegrasi", desc: "Website ini. Order langsung jalan ke ERP & sistem produksi." },
];

export default function JelajahPage() {
  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ jelajah</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Cerita di balik tujuh rasa.
      </h1>
      <p className="max-w-2xl opacity-80 mb-12">
        Bukan cuma jualan botol. Kami juga senang cerita — siapa petaninya,
        gimana cara seduh, sampai apa makanan yang cocok pasangannya.
      </p>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ quiz · minuman cocok untukmu</p>
        <QuizClient />
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ origin map · dari mana biji kami</p>
        <OriginMap />
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ pairing · makan sama apa enaknya</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PAIRINGS.map((p) => (
            <article
              key={p.drink}
              className="rounded-2xl border border-ink/20 bg-paper p-5"
            >
              <p className="font-serif italic text-xl">{p.drink}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {p.foods.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-orange">·</span> {f}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs italic opacity-70">{p.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <MoodPlayer />
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ behind the scenes · gimana botol dibuat</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BTS_STEPS.map((s) => (
            <article
              key={s.step}
              className="rounded-2xl border border-ink/20 bg-paper p-5"
            >
              <p className="font-mono text-xs opacity-60">{s.step}</p>
              <p className="font-serif italic text-xl mt-1">{s.title}</p>
              <p className="text-sm mt-2 opacity-80">{s.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ catatan founder</p>
        <article className="rounded-3xl border border-ink/20 bg-paper p-8 max-w-3xl">
          <p className="font-serif italic text-3xl leading-snug mb-4">
            "Kopi paling enak adalah kopi yang dibikin tetangga — bukan kopi paling mahal."
          </p>
          <p className="opacity-80 leading-relaxed mb-3">
            Saya tumbuh di warung Pak Dirman, ayah saya. Tiap pagi sebelum sekolah,
            saya bantu sangrai biji. Aroma asapnya nempel di seragam putih saya.
          </p>
          <p className="opacity-80 leading-relaxed mb-3">
            Tujuh Rasa lahir dari satu observasi: tetangga-tetangga yang dulu mampir
            ke warung ayah saya, sekarang sibuk banget. Mereka butuh kopi yang
            tetap hangat di lidah, walau diminumnya di mobil, di kantor, di kasur.
          </p>
          <p className="opacity-80 leading-relaxed">
            Jadi kami bikin kopi botolan. Tetap pakai biji yang ayah saya pakai.
            Tetap pakai resep yang ibu saya turunkan. Tetap diantar tangan kami sendiri.
          </p>
          <p className="font-serif italic text-lg mt-6 opacity-90">— Mbak Rara, Founder</p>
        </article>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ timeline · perjalanan tujuh rasa</p>
        <ol className="relative border-l-2 border-ink/20 ml-3 space-y-6">
          {TIMELINE.map((t) => (
            <li key={t.year} className="pl-6 relative">
              <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange border-2 border-cream" />
              <p className="font-mono text-sm opacity-70">{t.year}</p>
              <p className="font-serif italic text-xl">{t.title}</p>
              <p className="text-sm opacity-80 mt-1">{t.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <p className="eyebrow mb-3">/ glossary · istilah kopi</p>
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="font-serif italic text-lg">{g.term}</dt>
              <dd className="text-sm opacity-80 mt-1">{g.def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
