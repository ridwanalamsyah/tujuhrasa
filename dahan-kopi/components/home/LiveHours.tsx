"use client";

import { openingHours } from "@/data/site";
import { DAY_LABELS, formatRange, getOpenStatus, getZonedNow, isOpenEveryDay } from "@/lib/hours";
import { useNow } from "@/lib/use-now";

/** Jam buka hari ini (dihitung di browser dengan zona waktu Asia/Jakarta). */
export function TodayHours() {
  const now = useNow();
  if (!now) {
    return (
      <>
        <span className="block text-sm text-muted">
          {isOpenEveryDay() ? "Setiap hari" : "Jam buka"}
        </span>
        <span className="mt-1 block font-medium">
          {openingHours.map((rule) => formatRange(rule)).join(" · ")}
        </span>
      </>
    );
  }
  const { day } = getZonedNow(now);
  const { today } = getOpenStatus(now);
  return (
    <>
      <span className="block text-sm text-muted">Hari ini, {DAY_LABELS[day]}</span>
      <span className="mt-1 block font-medium tabular-nums">
        {today ? formatRange(today) : "Libur"}
      </span>
    </>
  );
}

/** Status "Buka sekarang / Tutup", diperbarui otomatis tiap menit. */
export function OpenStatus() {
  const now = useNow();
  const status = now ? getOpenStatus(now) : null;
  return (
    <span
      aria-live="polite"
      className={`block transition-opacity duration-500 ${status ? "opacity-100" : "opacity-0"}`}
    >
      <span className="flex items-center gap-2.5 font-medium">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${status?.isOpen ? "bg-leaf" : "bg-coffee/50"}`}
        />
        {status ? (status.isOpen ? "Buka sekarang" : "Tutup") : "Memuat status…"}
      </span>
      <span className="mt-1 block text-sm text-muted">{status?.detail ?? " "}</span>
    </span>
  );
}

/** Daftar jam buka lengkap; baris hari ini ditandai setelah halaman dimuat. */
export function OpeningHoursList({ className = "" }: { className?: string }) {
  const now = useNow();
  const todayLabel = now ? getOpenStatus(now).today?.label : undefined;
  return (
    <ul className={`divide-y divide-line border-y border-line ${className}`}>
      {openingHours.map((rule) => {
        const isToday = rule.label === todayLabel;
        return (
          <li key={rule.label} className="flex items-center justify-between gap-4 py-3.5">
            <span className={isToday ? "font-semibold text-espresso" : "text-muted"}>
              {rule.label}
              {isToday && (
                <span className="ml-2.5 rounded-full bg-leaf px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider text-white">
                  Hari ini
                </span>
              )}
            </span>
            <span
              className={`tabular-nums ${isToday ? "font-semibold text-espresso" : "text-espresso"}`}
            >
              {formatRange(rule)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
