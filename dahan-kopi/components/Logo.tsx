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
    <svg viewBox="0 0 100 130" aria-hidden="true" focusable="false" {...props}>
      <path d="M50 3 93 31v96H7V31z" fill="currentColor" />
      <g fill="none" stroke={cut} strokeWidth="5" strokeLinecap="round">
        <path d="M50 122V24" />
        <path d="M50 104c-9-3-17-11-21-24M50 104c9-3 17-11 21-24" />
        <path d="M50 80c-8-3-14-10-18-21M50 80c8-3 14-10 18-21" />
        <path d="M50 56c-6-3-10-8-13-16M50 56c6-3 10-8 13-16" />
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
      <LogoMark cut={cut} className="h-8 w-[1.6rem] shrink-0" />
      <span className="font-hand text-[1.625rem] leading-none">Dahan Kopi</span>
    </span>
  );
}
