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
    location: "Booth Tujuh Rasa · Cibiru, Bandung",
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
    location: "Booth Tujuh Rasa · Cibiru, Bandung",
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
    location: "Booth Tujuh Rasa · Cibiru, Bandung",
    description:
      "Sesi nongkrong gratis. Datang aja, kenalan sama pelanggan lain, sharing cerita kopi nusantara.",
    capacity: 30,
    fee: "Gratis (beli minum di tempat)",
  },
];

export default function EventPage() {
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Event kafe</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              mari mampir sore-sore —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Datang ke{" "}
            <em className="text-[var(--tr-brick)]">kafe.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Setiap bulan kami bikin acara di kafe untuk pelanggan tetap.
            RSVP-nya langsung lewat sini, datanya masuk ke ERP kami.
          </p>
        </div>
      </section>

      <section className="container-tr py-12 sm:py-16">
        <div className="grid lg:grid-cols-3 gap-5">
          {EVENTS.map((e) => (
            <article key={e.slug} className="card-stamp p-6 flex flex-col">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--tr-brick)] font-bold">
                {e.date} · {e.time}
              </p>
              <h2 className="font-display font-bold text-2xl mt-2 leading-tight">
                {e.title}
              </h2>
              <p className="text-sm text-[var(--tr-text-muted)] mt-2">{e.location}</p>
              <p className="text-sm text-[var(--tr-text-soft)] mt-3 flex-1 leading-relaxed">
                {e.description}
              </p>
              <div className="mt-3 text-xs font-mono text-[var(--tr-text-muted)] border-t-2 border-[var(--tr-ink)]/15 pt-3">
                Kapasitas {e.capacity} orang · {e.fee}
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer btn btn-secondary inline-block list-none">
                  RSVP sekarang
                </summary>
                <div className="mt-3">
                  <RsvpForm eventSlug={e.slug} eventTitle={e.title} />
                </div>
              </details>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
