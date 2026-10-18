import Link from "next/link";
import { dahanLinks } from "@/lib/dahan-links";
import { isExternal } from "@/lib/links";

/** Daftar link Dahan, versi rapi dari Linktree. */
export function LinkList({ className = "" }: { className?: string }) {
  return (
    <ul className={`border-t border-line ${className}`}>
      {dahanLinks().map((link) => {
        const external = isExternal(link.href);
        const content = (
          <>
            <span className="font-medium">{link.label}</span>
            <span className="flex items-center gap-3 text-small text-muted">
              <span className="hidden sm:inline">{link.detail}</span>
              <span
                aria-hidden="true"
                className="text-espresso transition-transform duration-200 ease-soft group-hover:translate-x-1"
              >
                {external ? "↗" : "→"}
              </span>
            </span>
          </>
        );
        const className = "group flex min-h-14 items-center justify-between gap-4 py-3";
        return (
          <li key={link.label} className="border-b border-line">
            {external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
              </a>
            ) : (
              <Link href={link.href} className={className}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
