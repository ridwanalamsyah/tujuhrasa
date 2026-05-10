"use client";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Leaf,
  Clock,
  Truck,
  Award,
} from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Halal & BPOM",
    desc: "Sertifikat resmi, bahan aman dikonsumsi keluarga.",
  },
  {
    icon: Leaf,
    title: "Tanpa pengawet",
    desc: "Dibotolkan hari ini, simpan dingin maksimal 3 hari.",
  },
  {
    icon: Clock,
    title: "Antar hari yang sama",
    desc: "Order sebelum 14:00, sampai sebelum sore.",
  },
  {
    icon: Truck,
    title: "Gratis di atas 150k",
    desc: "Untuk wilayah Jabodetabek. Lainnya ongkir hemat.",
  },
];

export function TrustGrid() {
  return (
    <section className="container-tr py-12 sm:py-16">
      <div className="rounded-3xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)]/70 backdrop-blur-md p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <Award className="h-4 w-4 text-[var(--tr-orange)]" />
          <p className="eyebrow">Janji kami ke pelanggan</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] p-4 sm:p-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--tr-orange-soft)]/40 grid place-items-center text-[var(--tr-orange-deep)] mb-3">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="font-serif italic text-lg leading-tight text-[var(--tr-ink)]">
                {item.title}
              </p>
              <p className="text-xs sm:text-sm text-[var(--tr-text-muted)] mt-1.5 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
