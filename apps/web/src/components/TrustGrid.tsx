import { ShieldCheck, Leaf, Clock, Truck } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Halal & BPOM",
    desc: "Sertifikat resmi, bahan aman untuk keluarga.",
  },
  {
    icon: Leaf,
    title: "Tanpa pengawet",
    desc: "Dibotolkan hari ini, simpan dingin maksimal 3 hari.",
  },
  {
    icon: Clock,
    title: "Antar hari yang sama",
    desc: "Pesan sebelum 14:00, sampai sebelum sore.",
  },
  {
    icon: Truck,
    title: "Gratis di atas 150rb",
    desc: "Untuk wilayah Jabodetabek. Lain ongkir hemat.",
  },
];

export function TrustGrid() {
  return (
    <section className="container-tr py-10 sm:py-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] rounded-md overflow-hidden">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={
              "p-5 sm:p-6 " +
              (i < 2 ? "border-b-2 lg:border-b-0 " : "") +
              (i % 2 === 0 ? "border-r-2 " : "") +
              ((i === 0 || i === 2) ? "lg:border-r-2 " : "") +
              ((i === 1) ? "lg:border-r-2 " : "") +
              "border-[var(--tr-ink)]"
            }
          >
            <div className="w-9 h-9 rounded-sm bg-[var(--tr-mustard-soft)] border-2 border-[var(--tr-ink)] grid place-items-center text-[var(--tr-ink)] mb-3">
              <item.icon className="h-4 w-4" />
            </div>
            <p className="font-display font-bold text-base sm:text-lg leading-tight text-[var(--tr-ink)]">
              {item.title}
            </p>
            <p className="text-xs sm:text-sm text-[var(--tr-text-muted)] mt-1.5 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
