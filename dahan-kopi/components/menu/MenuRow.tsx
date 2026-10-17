import Image from "next/image";
import { LeaderRow } from "@/components/ui/LeaderRow";
import { formatPrice, formatPriceShort } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

function Price({ value }: { value: number }) {
  return (
    <>
      <span aria-hidden="true">{formatPriceShort(value)}</span>
      <span className="sr-only">{formatPrice(value)}</span>
    </>
  );
}

/** Satu baris menu ala buku menu: "Kopi Susu Dahan ........ 25". */
export function MenuRow({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  if (compact) {
    return (
      <li className="py-1 text-[0.9375rem] font-medium">
        <LeaderRow label={item.name} value={<Price value={item.price} />} />
      </li>
    );
  }

  return (
    <li>
      <LeaderRow
        label={<h3 className="font-semibold">{item.name}</h3>}
        value={
          <span className="font-semibold">
            <Price value={item.price} />
          </span>
        }
      />
      {(item.description || item.tags?.length) && (
        <p className="mt-1 pr-12 text-small text-muted">
          {item.description}
          {item.tags && item.tags.length > 0 && (
            <span className="text-[0.8125rem] text-coffee">
              {/* Spasi tak terputus: "aren. · HOT / ICE" pindah baris bersama, tanpa "·" di awal baris. */}
              <span className="whitespace-nowrap">
                {item.description ? "\u00a0· " : ""}
                {item.tags.join(" / ")}
              </span>
            </span>
          )}
        </p>
      )}
      {item.image && (
        <div className="relative mt-3 aspect-3/2 w-40 overflow-hidden bg-ph-day">
          <Image src={item.image} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}
    </li>
  );
}
