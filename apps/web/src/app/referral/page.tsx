import { ReferralClient } from "@/components/ReferralClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ajak Tetangga — Tujuh Rasa",
  description: "Ajak teman, dapat diskon Rp 10.000 untuk berdua.",
};

export default function ReferralPage() {
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Referral</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              berdua untung berdua —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Ajak{" "}
            <em className="text-[var(--tr-brick)]">tetanggamu.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Kasih teman kamu kode referral di bawah. Kalau dia order pertama,
            kalian berdua dapat <strong className="font-display">diskon Rp 10.000</strong>{" "}
            di pesanan berikutnya.
          </p>
        </div>
      </section>
      <section className="container-tr py-12 sm:py-16">
        <ReferralClient />
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {[
            { n: "01", t: "Salin kode", d: "klik tombol di atas, kode kamu otomatis tersimpan ke clipboard." },
            { n: "02", t: "Bagikan", d: "kirim via WA / IG / Twitter — atau cetak QR-nya untuk gathering offline." },
            { n: "03", t: "Dapat diskon", d: "kalau temanmu order, otomatis kalian berdua dapat Rp 10rb." },
          ].map((s) => (
            <article key={s.n} className="card-stamp p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-[var(--tr-brick)] font-bold">
                {s.n}
              </p>
              <p className="font-display font-bold text-xl mt-1">{s.t}</p>
              <p className="text-sm mt-2 text-[var(--tr-text-soft)] leading-relaxed">
                {s.d}
              </p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
