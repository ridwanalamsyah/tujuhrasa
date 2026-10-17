import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isExternal } from "@/lib/links";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  children: ReactNode;
  /** Di dalam kalimat: tanpa tinggi minimum 44px. */
  inline?: boolean;
  /** Di atas latar espresso (footer). */
  onDark?: boolean;
  /** Tambahkan "↗" (hanya untuk link Google Maps). */
  maps?: boolean;
};

/** Link teks bergaris bawah: aksi utama di seluruh website. */
export function TextLink({
  href,
  children,
  inline = false,
  onDark = false,
  maps = false,
  className = "",
  ...props
}: Props) {
  const classes = `font-medium underline decoration-1 underline-offset-[0.3em] transition-[text-decoration-color,text-decoration-thickness] duration-150 hover:decoration-2 focus-visible:decoration-2 ${
    onDark
      ? "decoration-cream/50 hover:decoration-cream"
      : "decoration-coffee/50 hover:decoration-espresso"
  } ${inline ? "" : "inline-flex min-h-11 items-center"} ${className}`;

  const content = (
    <>
      {children}
      {maps && <span aria-hidden="true">&nbsp;↗</span>}
    </>
  );

  if (isExternal(href) || href.startsWith("tel:") || props.download !== undefined) {
    const external = isExternal(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {content}
        {external && <span className="sr-only"> (buka di tab baru)</span>}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
