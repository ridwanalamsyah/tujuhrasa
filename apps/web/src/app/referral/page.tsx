import { ReferralClient } from "@/components/ReferralClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ajak Tetangga — Tujuh Rasa",
  description: "Ajak teman, dapat diskon Rp 10.000 untuk berdua.",
};

export default function ReferralPage() {
  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ referral</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Ajak tetanggamu.
      </h1>
      <p className="max-w-2xl opacity-80 mb-10">
        Kasih teman kamu kode referral di bawah. Kalau dia order pertama,
        kalian berdua dapat <strong>diskon Rp 10.000</strong> di pesanan
        berikutnya.
      </p>
      <ReferralClient />
      <section className="mt-12 grid sm:grid-cols-3 gap-6">
        {[
          { n: "01", t: "Salin kode", d: "klik tombol di atas, kode kamu otomatis tersimpan ke clipboard." },
          { n: "02", t: "Bagikan", d: "kirim via WA / IG / Twitter — atau cetak QR-nya untuk gathering offline." },
          { n: "03", t: "Dapat diskon", d: "kalau temanmu order, otomatis kalian berdua dapat Rp 10rb." },
        ].map((s) => (
          <article key={s.n} className="rounded-2xl border border-ink/20 bg-paper p-5">
            <p className="font-mono text-xs opacity-60">{s.n}</p>
            <p className="font-serif italic text-xl mt-1">{s.t}</p>
            <p className="text-sm mt-2 opacity-80">{s.d}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
