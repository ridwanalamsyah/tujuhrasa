import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { isExternal } from "@/lib/links";

type Props = Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string };

/** Link biasa untuk halaman sendiri, tab baru untuk situs lain, dan unduhan langsung untuk PDF. */
export function SmartLink({ href, ...props }: Props) {
  if (href.endsWith(".pdf")) return <a href={href} download {...props} />;
  if (isExternal(href)) return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
  return <Link href={href} {...props} />;
}
