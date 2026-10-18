import type { CSSProperties, SVGProps } from "react";

/**
 * Logo Dahan (digambar ulang dari logo di gelas & buku menu): rumah berisi ranting.
 * Rumah memakai `currentColor`; ranting memakai warna `cut` (default krem).
 * Ganti dengan file logo asli bila sudah tersedia.
 */
export function LogoMark({
  cut = "#f2eee8",
  ...props
}: SVGProps<SVGSVGElement> & { cut?: string }) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M60 6 110 42v72H10V42z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <g fill="none" stroke={cut} strokeWidth="6" strokeLinecap="round">
        <path d="M60 104V36" />
        <path d="M60 92c-10-4-18-12-22-24M60 92c10-4 18-12 22-24" />
        <path d="M60 74c-8-4-13-10-16-19M60 74c8-4 13-10 16-19" />
        <path d="M60 56c-5-3-8-8-9-14M60 56c5-3 8-8 9-14" />
      </g>
    </svg>
  );
}

/** Logo + wordmark tulisan tangan "Dahan Kopi". */
export function LogoLockup({
  className = "",
  cut,
  style,
}: {
  className?: string;
  cut?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`} style={style}>
      <LogoMark cut={cut} className="h-7 w-7 shrink-0" />
      <span className="font-hand text-[1.625rem] leading-none">Dahan Kopi</span>
    </span>
  );
}
