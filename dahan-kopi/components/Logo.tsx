import type { SVGProps } from "react";

/**
 * Logo sementara Dahan Kopi: lingkaran berisi cangkir, ranting kecil, dan tulisan DAHAN.
 * Ganti isi SVG ini dengan logo asli bila sudah tersedia (warna mengikuti `currentColor`).
 * `title=""` untuk logo dekoratif (mis. di dalam link yang sudah punya label).
 */
export function Logo({
  title = "Dahan Kopi",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="60" cy="60" r="57" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="51" strokeWidth="0.9" />
        {/* ranting */}
        <path d="M59 47c0-7 2-12.5 7-18" strokeWidth="2" />
        {/* cangkir */}
        <path d="M41 50h38v6c0 10.5-8.5 18-19 18s-19-7.5-19-18z" strokeWidth="2.5" />
        <path d="M79 53.5c7.5 0 7.5 11 -1.2 11" strokeWidth="2.5" />
        <path d="M37 79h46" strokeWidth="2.5" />
      </g>
      <g fill="currentColor">
        <path d="M62.5 35.5c3.5-3.4 8-3.9 10.8-1.6-3.1 3.4-7.6 3.9-10.8 1.6z" />
        <path d="M59.6 41c-3.2-3-7.6-3.3-10.3-.9 3 3.1 7.4 3.4 10.3.9z" />
        <text
          x="61.6"
          y="98"
          textAnchor="middle"
          fontSize="13.5"
          letterSpacing="3.2"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          DAHAN
        </text>
      </g>
    </svg>
  );
}
