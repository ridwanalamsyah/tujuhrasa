import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { isExternal } from "@/lib/links";

type Variant = "primary" | "outline" | "light" | "outline-light";

const variants: Record<Variant, string> = {
  primary: "bg-espresso text-cream hover:bg-coffee",
  outline:
    "border border-espresso/30 text-espresso hover:border-espresso hover:bg-espresso hover:text-cream",
  light: "bg-cream text-espresso hover:bg-white",
  "outline-light":
    "border border-cream/60 text-cream hover:border-cream hover:bg-cream hover:text-espresso",
};

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  variant?: Variant;
  icon?: ReactNode;
  /** Buka di tab baru. Default: otomatis untuk link eksternal (kecuali file di website sendiri). */
  newTab?: boolean;
};

export function ButtonLink({
  href,
  variant = "primary",
  icon,
  newTab,
  className = "",
  children,
  ...props
}: Props) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-6 text-sm font-semibold tracking-wide transition-colors duration-300 ${variants[variant]} ${className}`;
  const external = isExternal(href);
  const openInNewTab = newTab ?? external;
  const content = (
    <>
      {children}
      {icon}
    </>
  );

  if (external || openInNewTab || props.download !== undefined) {
    return (
      <a
        href={href}
        className={classes}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {content}
    </Link>
  );
}
