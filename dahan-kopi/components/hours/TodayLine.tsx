"use client";

import { DAY_LABELS, formatRange, getRuleForDay, getZonedNow, hoursSummary } from "@/lib/hours";
import { useNow } from "@/lib/use-now";

/** "Hari ini, Sabtu · 08.00–23.00". Sebelum dimuat: ringkasan jam buka. */
export function TodayLine({ className = "" }: { className?: string }) {
  const now = useNow();
  if (!now) return <p className={`tabular-nums ${className}`}>{hoursSummary()}</p>;
  const { day } = getZonedNow(now);
  const rule = getRuleForDay(day);
  return (
    <p className={`tabular-nums ${className}`}>
      Hari ini, {DAY_LABELS[day]} · {rule ? formatRange(rule) : "libur"}
    </p>
  );
}
