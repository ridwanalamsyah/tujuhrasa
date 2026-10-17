"use client";

import { getOpenStatus, hoursSummary, isOpenEveryDay, lowerFirst } from "@/lib/hours";
import { useNow } from "@/lib/use-now";

/**
 * "● Buka sekarang · tutup pukul 22.00" — dihitung di browser (zona waktu Asia/Jakarta)
 * dan diperbarui tiap menit. Sebelum dimuat: "Buka setiap hari" (satu baris, tanpa geser layout).
 */
export function StatusLine({
  onDark = false,
  className = "",
}: {
  onDark?: boolean;
  className?: string;
}) {
  const now = useNow();
  const status = now ? getOpenStatus(now) : null;

  return (
    <p aria-live="polite" className={className}>
      {status ? (
        <>
          <span
            aria-hidden="true"
            className={`mr-2 inline-block h-2 w-2 -translate-y-px rounded-full ${
              status.isOpen
                ? onDark
                  ? "bg-leaf-soft"
                  : "bg-leaf"
                : onDark
                  ? "bg-cream-muted"
                  : "bg-coffee/50"
            }`}
          />
          <span
            className={`font-semibold ${status.isOpen ? (onDark ? "text-leaf-soft" : "text-leaf") : ""}`}
          >
            {status.isOpen ? "Buka sekarang" : "Tutup"}
          </span>
          {" · "}
          {lowerFirst(status.detail)}
        </>
      ) : isOpenEveryDay() ? (
        "Buka setiap hari"
      ) : (
        hoursSummary()
      )}
    </p>
  );
}
