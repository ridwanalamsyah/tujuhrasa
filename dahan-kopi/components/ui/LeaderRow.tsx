import type { ReactNode } from "react";

/** Baris ala buku menu: label ....... nilai */
export function LeaderRow({
  label,
  value,
  className = "",
}: {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="min-w-0">{label}</span>
      <span
        aria-hidden="true"
        className="min-w-4 flex-1 -translate-y-[0.25em] border-b border-dotted border-current opacity-35"
      />
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  );
}
