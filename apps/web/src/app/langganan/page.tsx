import { SubscribeForm } from "@/components/SubscribeForm";

export default function LanggananPage() {
  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-10 lg:pt-16 lg:pb-12">
          <p className="eyebrow mb-3">Langganan</p>
          <h1 className="font-display font-black text-[clamp(48px,8vw,120px)] leading-[0.92] tracking-[-0.025em]">
            Tujuh botol,<br />
            <span className="text-[var(--tr-brick)]">tiap rutin.</span>
          </h1>
          <p className="font-hand text-3xl text-[var(--tr-brick-deep)] mt-4">
            kotak datang sendiri tiap minggu —
          </p>
        </div>
      </section>

      <section className="container-tr pt-12 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
          <div>
            <p className="text-base sm:text-lg leading-relaxed max-w-md">
              Kami kirim kotak berisi <span className="tr-highlight">4–14 botol</span> langsung ke
              pintumu, sesuai jadwal yang kamu pilih. Bisa di-pause kapan
              saja, bisa diganti rasa, bisa dibatalkan.
            </p>

            <ul className="mt-10 space-y-0 border-t-2 border-[var(--tr-ink)]">
              {[
                {
                  t: "Diskon 10% otomatis",
                  d: "Pelanggan langganan dapat harga lebih murah, selamanya.",
                },
                {
                  t: "Botol pertama gratis",
                  d: "Botol pertama dari kotak pertama gratis. Dipilih oleh barista kami.",
                },
                {
                  t: "Bisa di-skip",
                  d: "Mau di-pause minggu ini? Cukup balas email reminder.",
                },
                {
                  t: "Botol kaca dijemput",
                  d: "Setiap pengiriman, kurir membawa botol kosongmu kembali.",
                },
              ].map((s, i) => (
                <li
                  key={i}
                  className="flex gap-5 border-b-2 border-[var(--tr-ink)] py-5"
                >
                  <span className="font-mono text-[11px] opacity-50 tracking-widest w-10 mt-2">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-display font-bold text-xl sm:text-2xl text-[var(--tr-ink)]">
                      {s.t}
                    </p>
                    <p className="text-sm sm:text-base text-[var(--tr-text-soft)] mt-1 leading-relaxed">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-stamp bg-[var(--tr-paper)] p-1">
            <SubscribeForm />
          </div>
        </div>
      </section>
    </>
  );
}
