import Image from "next/image";
import { LeaderRow } from "@/components/ui/LeaderRow";
import { formatPrice, formatPriceShort } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

/** "HOT 28 · ICE 28", atau "38" untuk satu harga. */
function Prices({ item }: { item: MenuItem }) {
  return (
    <span className="font-semibold">
      {item.prices.map((p, index) => (
        <span key={p.label ?? index} className="whitespace-nowrap">
          {index > 0 && (
            <span aria-hidden="true" className="px-1.5 font-normal text-muted">
              ·
            </span>
          )}
          {p.label && (
            <span className="mr-1 text-[0.75rem] font-medium tracking-wide text-coffee">
              {p.label}
            </span>
          )}
          <span aria-hidden="true">{formatPriceShort(p.price)}</span>
          <span className="sr-only">{formatPrice(p.price)}</span>
        </span>
      ))}
    </span>
  );
}

/** Satu baris menu ala buku menu: "Dahan Iced ........ ICE 23". */
export function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li>
      <LeaderRow
        label={<h3 className="font-semibold">{item.name}</h3>}
        value={<Prices item={item} />}
      />
      {item.description && <p className="mt-1 pr-12 text-small text-muted">{item.description}</p>}
      {item.image && (
        <div className="relative mt-3 aspect-3/2 w-40 overflow-hidden bg-ph-day">
          <Image src={item.image} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}
    </li>
  );
}
