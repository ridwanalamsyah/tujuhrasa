import { RsvpForm } from "@/components/RsvpForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event Kafe — Tujuh Rasa",
  description: "Acara cupping, brewing class, dan ngopi sore di kafe.",
};

const EVENTS = [
  {
    slug: "cupping-mei",
    title: "Cupping Session — Pengenalan 7 origin",
    date: "Sabtu, 18 Mei 2026",
    time: "16:00 – 18:00 WIB",
    location: "Kafe Tujuh Rasa, Tebet",
    description:
      "Cicipi 7 origin biji kopi nusantara — Aceh Gayo, Toraja, Bali Kintamani, Flores, Papua Wamena, Java Preanger, Sumatra Mandheling. Belajar cara identifikasi rasa.",
    capacity: 12,
    fee: "Rp 75.000 / orang (sudah termasuk 1 botol take-away)",
  },
  {
    slug: "brew-class-juni",
    title: "Brew Class — V60, Aeropress, Tubruk",
    date: "Minggu, 9 Juni 2026",
    time: "10:00 – 12:30 WIB",
    location: "Kafe Tujuh Rasa, Tebet",
    description:
      "Belajar 3 metode brewing dari barista kafe. Kamu bawa pulang resep & 1 alat brew (V60 set).",
    capacity: 8,
    fee: "Rp 150.000 / orang",
  },
  {
    slug: "ngopi-sore",
    title: "Ngopi Sore — sesi cerita kopi & komunitas",
    date: "Tiap Jumat sore",
    time: "16:00 – 19:00 WIB",
    location: "Kafe Tujuh Rasa, Tebet",
    description:
      "Sesi nongkrong gratis. Datang aja, kenalan sama pelanggan lain, sharing cerita kopi nusantara.",
    capacity: 30,
    fee: "Gratis (beli minum di tempat)",
  },
];

export default function EventPage() {
  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ event kafe</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Datang ke kafe.
      </h1>
      <p className="max-w-2xl opacity-80 mb-10">
        Setiap bulan kami bikin acara di kafe untuk pelanggan tetap.
        RSVP-nya langsung lewat sini, datanya masuk ke ERP kami.
      </p>

      <div className="grid lg:grid-cols-3 gap-6">
        {EVENTS.map((e) => (
          <article
            key={e.slug}
            className="rounded-3xl border border-ink/20 bg-paper p-6 flex flex-col"
          >
            <p className="font-mono text-xs opacity-60 lowercase">{e.date} · {e.time}</p>
            <h2 className="font-serif italic text-2xl mt-2 leading-tight">
              {e.title}
            </h2>
            <p className="text-sm opacity-70 mt-2">{e.location}</p>
            <p className="text-sm mt-3 flex-1">{e.description}</p>
            <div className="mt-3 text-xs font-mono opacity-70">
              kapasitas {e.capacity} orang · {e.fee}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer btn-secondary inline-block">
                rsvp sekarang
              </summary>
              <div className="mt-3">
                <RsvpForm eventSlug={e.slug} eventTitle={e.title} />
              </div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}
