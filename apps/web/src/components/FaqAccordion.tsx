"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    a: "Saat ini kami melayani via pengiriman saja, dari dapur kafe pusat di Bandung. Tapi sering nongol di event pop-up — pantau IG @tujuhrasa.id.",
  },
  {
    q: "Cara dapat poin & reward?",
    a: "Tiap pesanan otomatis dapat poin (1 botol = 7 poin). Kumpulkan untuk redeem diskon, voucher gratis ongkir, atau botol cuma-cuma. Login dengan email yang sama tiap order.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="container-tr py-16 sm:py-20">
      <div className="grid lg:grid-cols-[1fr_2fr] gap-8 lg:gap-12">
        <div>
          <p className="eyebrow mb-3">/ pertanyaan tetangga</p>
          <h2 className="h-display text-[clamp(32px,4.5vw,52px)]">
            FAQ &<br />
            <em className="text-[var(--tr-text-soft)]">jawaban jujur.</em>
          </h2>
          <p className="mt-4 text-[var(--tr-text-soft)] max-w-md leading-relaxed">
            Belum ketemu jawaban? WhatsApp tim kami atau lihat di halaman{" "}
            <a href="/transparansi" className="tr-link text-[var(--tr-orange-deep)]">
              transparansi
            </a>{" "}
            untuk info lengkap.
          </p>
        </div>
        <div className="space-y-2">
          {FAQS.map((f, i) => {
            const open = openIdx === i;
            return (
              <div
                key={f.q}
                className="rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  aria-expanded={open}
                  className="flex items-center justify-between gap-4 w-full text-left px-5 py-4 hover:bg-[var(--tr-paper-2)] transition"
                >
                  <span className="font-medium text-[var(--tr-ink)] text-[15px]">
                    {f.q}
                  </span>
                  <span
                    className={
                      "w-7 h-7 rounded-full grid place-items-center shrink-0 transition " +
                      (open
                        ? "bg-[var(--tr-orange)] text-white"
                        : "bg-[var(--tr-paper-2)] text-[var(--tr-ink)]")
                    }
                  >
                    {open ? (
                      <Minus className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <p className="px-5 pb-4 text-sm text-[var(--tr-text-soft)] leading-relaxed">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
