import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

const tagStyles = {
  HOT: "border-coffee/30 text-coffee",
  ICE: "border-leaf/35 text-leaf",
} as const;

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <article className="flex h-full gap-5 rounded-card bg-white p-5 shadow-soft sm:p-6">
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Dengan foto, harga turun ke bawah nama agar nama tidak terlalu sempit di layar kecil. */}
        <div
          className={
            item.image
              ? "flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
              : "flex items-baseline justify-between gap-4"
          }
        >
          <h3 className="text-lg font-semibold leading-snug">{item.name}</h3>
          <p className="shrink-0 font-semibold tabular-nums text-coffee">
            <span className="sr-only">Harga </span>
            {formatPrice(item.price)}
          </p>
        </div>
        {item.description && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>
        )}
        {item.tags && item.tags.length > 0 && (
          <ul className="mt-auto flex gap-1.5 pt-4" aria-label="Pilihan penyajian">
            {item.tags.map((tag) => (
              <li
                key={tag}
                className={`rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-[0.14em] ${tagStyles[tag]}`}
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
      {item.image && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-sand sm:h-28 sm:w-28">
          <Image src={item.image} alt={item.name} fill sizes="112px" className="object-cover" />
        </div>
      )}
    </article>
  );
}
