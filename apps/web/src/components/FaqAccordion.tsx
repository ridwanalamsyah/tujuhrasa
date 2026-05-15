"use client";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "Apakah aman tanpa pengawet?",
    a: "Ya. Botol kami disteril, diisi panas, dan disegel. Wajib disimpan di kulkas (≤4°C). Konsumsi maksimal 3 hari setelah botol dibuka, 5 hari jika belum dibuka.",
  },
  {
    q: "Berapa lama waktu pengiriman?",
    a: "Untuk Jabodetabek, pesan sebelum jam 14:00 WIB → sampai hari yang sama (3-5 jam). Lebih dari 14:00 → besok pagi. Untuk kota lain, 1-2 hari kerja.",
  },
  {
    q: "Apakah ada langganan bulanan?",
    a: "Ada. Pilih paket weekly/biweekly/monthly, 4-12 botol per pengiriman. Bisa pause/cancel kapan saja, otomatis ditagih lewat e-wallet/VA pilihanmu.",
  },
  {
    q: "Botol kosong gimana?",
    a: "Botol kaca kami bisa dikembalikan. Tukar 5 botol kosong = 1 botol gratis (rasa apa saja). Botol disteril ulang untuk batch berikutnya.",
  },
  {
    q: "Bisa kirim ke alamat kantor untuk meeting?",
    a: "Bisa banget. Untuk pesanan 20+ botol, ada diskon grosir 5-15% (cek halaman Grosir). Bisa juga dijadwalkan tanggal tertentu.",
  },
  {
    q: "Pembayaran apa saja yang diterima?",
    a: "BCA Virtual Account, GoPay, OVO, DANA, ShopeePay, kartu kredit/debit, dan COD untuk wilayah Jabodetabek (min Rp 100rb).",
  },
  {
    q: "Apakah ada cabang fisik?",
    a: "Saat ini kami melayani via pengiriman saja, dari dapur kafe pusat. Tapi sering nongol di event pop-up — pantau IG kami.",
  },
  {
    q: "Cara dapat poin & reward?",
    a: "Tiap pesanan otomatis dapat poin (1 botol = 7 poin). Kumpulkan untuk redeem diskon, voucher gratis ongkir, atau botol cuma-cuma.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="container-tr py-16 sm:py-24">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-14">
        <div>
          <p className="eyebrow mb-3">Pertanyaan tetangga</p>
          <h2 className="font-display font-black text-[clamp(32px,4.5vw,56px)] leading-[0.98] tracking-tight">
            FAQ &amp;<br />
            <em className="text-[var(--tr-brick)]">jawaban jujur.</em>
          </h2>
          <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-4">
            tanya saja, kami jawab —
          </p>
          <p className="mt-4 text-[var(--tr-text-soft)] max-w-md leading-relaxed text-sm sm:text-base">
            Belum ketemu jawaban? WhatsApp tim kami atau lihat di halaman{" "}
            <a href="/transparansi" className="tr-link text-[var(--tr-brick-deep)] font-semibold">
              transparansi
            </a>{" "}
            untuk info lengkap.
          </p>
        </div>
        <div className="rounded-md border-2 border-[var(--tr-ink)] overflow-hidden divide-y-2 divide-[var(--tr-ink)] bg-[var(--tr-paper)]">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className={
                    "flex items-center justify-between gap-4 w-full text-left px-5 sm:px-6 py-4 transition " +
                    (open
                      ? "bg-[var(--tr-paper-2)]"
                      : "hover:bg-[var(--tr-paper-2)]")
                  }
                >
                  <span className="font-display font-semibold text-[var(--tr-ink)] text-[15px] sm:text-base">
                    {f.q}
                  </span>
                  <span
                    className={
                      "w-7 h-7 rounded-sm grid place-items-center shrink-0 transition border-2 border-[var(--tr-ink)] " +
                      (open
                        ? "bg-[var(--tr-brick)] text-[var(--tr-paper)]"
                        : "bg-[var(--tr-paper)] text-[var(--tr-ink)]")
                    }
                  >
                    {open ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-5 -mt-1 text-sm sm:text-base text-[var(--tr-text-soft)] leading-relaxed bg-[var(--tr-paper-2)]">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
