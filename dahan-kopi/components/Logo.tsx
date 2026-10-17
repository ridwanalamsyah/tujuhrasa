import type { SVGProps } from "react";

/**
 * Logo sementara Dahan Kopi: lingkaran berisi cangkir dan ranting kecil.
 * Ganti isi SVG ini dengan logo asli bila sudah tersedia (warna mengikuti `currentColor`).
 * Versi lengkap dengan tulisan DAHAN ada di app/icon.svg (favicon).
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" {...props}>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="60" cy="60" r="56" strokeWidth="5" />
        <path d="M59 44c0-7 2-12.5 7-18" strokeWidth="5" />
        <path d="M34 52h44v6c0 12-9.8 21-22 21s-22-9-22-21z" strokeWidth="6" />
        <path d="M78 56c9 0 9 13-1.5 13" strokeWidth="6" />
        <path d="M30 89h52" strokeWidth="6" />
      </g>
      <path fill="currentColor" d="M63 32c4-4 9.5-4.6 12.8-1.9-3.7 4-9 4.6-12.8 1.9z" />
    </svg>
  );
}

/** Logo + tulisan "DAHAN KOPI" untuk navbar. */
export function LogoLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="h-6 w-6 shrink-0 lg:h-7 lg:w-7" />
      <span className="wordmark">Dahan Kopi</span>
    </span>
  );
}
