import { SubscribeForm } from "@/components/SubscribeForm";

export default function LanggananPage() {
  return (
    <div className="container-tr pt-32 pb-20">
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
        <div>
          <p className="eyebrow mb-3">/ langganan</p>
          <h1 className="h-display text-[clamp(40px,6vw,80px)] leading-[1.02]">
            Tujuh botol,<br/>
            <span className="text-ink-soft">tiap rutin.</span>
          </h1>
          <p className="mt-5 max-w-md leading-relaxed">
            Kami kirim kotak berisi 4–14 botol langsung ke pintumu, sesuai jadwal yang kamu pilih. Bisa di-pause kapan saja, bisa diganti rasa, bisa dibatalkan.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { t: "Diskon 10% otomatis", d: "Pelanggan langganan dapat harga lebih murah, selamanya." },
              { t: "Botol pertama gratis", d: "Botol pertama dari kotak pertama gratis. Dipilih oleh barista kami." },
              { t: "Bisa di-skip", d: "Mau di-pause minggu ini? Cukup balas email reminder." },
              { t: "Botol kaca dijemput", d: "Setiap pengiriman, kurir membawa botol kosongmu kembali." },
            ].map((s, i) => (
              <li key={i} className="flex gap-4 border-t border-ink/20 pt-4">
                <span className="font-mono text-xs opacity-50 w-8">0{i + 1}</span>
                <div>
                  <p className="font-serif italic text-2xl">{s.t}</p>
                  <p className="text-sm opacity-80 mt-1">{s.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
