import type { CSSProperties, SVGProps } from "react";
import { BADGE_PATH, MARK_PATH } from "@/components/logo-paths";

/**
 * Logo Dahan: rumah berisi ranting (dari file logo asli di Canva).
 * Rumah memakai `currentColor`; ranting berlubang, jadi warnanya mengikuti latar.
 * Isi `cut` untuk memberi warna ranting sendiri.
 */
export function LogoMark({ cut, ...props }: SVGProps<SVGSVGElement> & { cut?: string }) {
  return (
    <svg viewBox="0 0 1000 1317" aria-hidden="true" focusable="false" {...props}>
      {cut && <path d="M500 80 80 330v930h840V330z" fill={cut} />}
      <path d={MARK_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Lencana bulat "DAHAN KOPI", seperti di gelas dan buku menu. */
export function LogoBadge(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 1600 1600" aria-hidden="true" focusable="false" {...props}>
      <path d={BADGE_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Logo untuk header dan footer. */
export function LogoLockup({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`inline-flex items-center ${className}`} style={style}>
      <LogoBadge className="h-full w-auto" />
      <span className="sr-only">Dahan Kopi</span>
    </span>
  );
}
