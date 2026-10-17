import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isExternal } from "@/lib/links";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  children: ReactNode;
  /** `cream`: garis espresso di latar krem. `espresso`: garis krem di footer. `solid`: blok espresso penuh. */
  tone?: "cream" | "espresso" | "solid";
};

const tones = {
  cream: "h-11 border-espresso text-espresso hover:bg-espresso hover:text-cream",
  espresso: "h-11 border-cream/70 text-cream hover:bg-cream hover:text-espresso",
  solid: "h-13 w-full justify-center border-espresso bg-espresso text-cream hover:bg-coffee",
};

/** Tombol bersudut tegas. Dipakai hemat: Reservasi, unduh PDF, Google Maps. */
export function Button({ href, children, tone = "cream", className = "", ...props }: Props) {
  const classes = `inline-flex items-center gap-2 border px-5 text-[0.875rem] font-semibold tracking-[0.01em] transition-colors duration-150 ${tones[tone]} ${className}`;
  const external = isExternal(href);

  if (external || props.download !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {external && <span className="sr-only"> (buka di tab baru)</span>}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
