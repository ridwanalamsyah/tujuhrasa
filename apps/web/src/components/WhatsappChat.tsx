"use client";
import { useState, useEffect } from "react";
import { MessageCircle, X, Phone } from "lucide-react";

const WA_NUMBER = "6281234567890"; // ganti via env nanti kalau perlu
const PRESETS = [
  "Halo, mau tanya menu yang tersedia hari ini",
  "Apakah bisa pesan untuk diantar ke daerah X?",
  "Saya tertarik jadi pelanggan langganan",
  "Ada promo group buy untuk kantor?",
];

export function WhatsappChat() {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(t);
  }, []);

  const link = (msg: string) =>
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

  if (!show) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Tutup chat" : "Buka chat WhatsApp"}
        className="fixed bottom-20 md:bottom-6 right-4 z-30 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[2px_4px_0_var(--tr-ink),0_8px_24px_rgba(37,211,102,0.4)] grid place-items-center hover:scale-105 active:scale-100 transition-transform animate-[tr-fade-up_.4s_ease]"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Chat WhatsApp"
          className="fixed bottom-36 md:bottom-24 right-4 z-30 w-[calc(100vw-2rem)] max-w-sm rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] shadow-[var(--tr-shadow-card-hover)] overflow-hidden animate-[tr-fade-up_.18s_ease]"
        >
          <div className="bg-[#075E54] text-white p-4">
            <p className="text-sm opacity-80">Tujuh Rasa Kafe</p>
            <p className="font-semibold flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#25D366]" />
              Online · biasa balas dalam 15 menit
            </p>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-sm text-[var(--tr-text-soft)]">
              Halo! Ada yang bisa kami bantu? Pilih topik untuk chat langsung
              via WhatsApp:
            </p>
            {PRESETS.map((p) => (
              <a
                key={p}
                href={link(p)}
                target="_blank"
                rel="noopener"
                className="block px-3 py-2.5 rounded-xl bg-[var(--tr-paper-2)] hover:bg-[var(--tr-paper-3)] text-sm text-[var(--tr-text)] transition"
              >
                {p}
              </a>
            ))}
            <a
              href={link("Halo, mau tanya...")}
              target="_blank"
              rel="noopener"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-medium hover:bg-[#1ea954] transition"
            >
              <Phone className="h-3.5 w-3.5" /> Tulis sendiri di WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  );
}
