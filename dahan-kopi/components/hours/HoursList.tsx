"use client";

import { LeaderRow } from "@/components/ui/LeaderRow";
import { openingHours } from "@/data/site";
import { formatRange, getRuleForDay, getZonedNow } from "@/lib/hours";
import { useNow } from "@/lib/use-now";

/** Jam buka lengkap ala buku menu; baris hari ini ditebalkan setelah halaman dimuat. */
export function HoursList({ className = "" }: { className?: string }) {
  const now = useNow();
  const today = now ? getRuleForDay(getZonedNow(now).day) : undefined;

  return (
    <ul className={className}>
      {openingHours.map((rule) => {
        const isToday = rule === today;
        return (
          <li
            key={rule.label}
            className={`py-1.5 ${now ? (isToday ? "font-semibold" : "opacity-80") : ""}`}
          >
            <LeaderRow
              label={
                <>
                  {rule.label}
                  {isToday && <span className="sr-only"> (hari ini)</span>}
                </>
              }
              value={formatRange(rule)}
            />
          </li>
        );
      })}
    </ul>
  );
}
