"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusLine } from "@/components/hours/StatusLine";
import { LogoLockup } from "@/components/Logo";
import { CartButton } from "@/components/shop/CartButton";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { address, contact, navigation } from "@/data/site";

const isActive = (pathname: string, href: string) => pathname.startsWith(href);

export function Navbar() {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const toggle = toggleRef.current;
    const overlay = overlayRef.current;
    root.style.overflow = "hidden";
    const outside = [...document.body.children].filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== overlay && !el.inert,
    );
    outside.forEach((el) => (el.inert = true));
    overlay?.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      outside.forEach((el) => (el.inert = false));
      window.removeEventListener("keydown", onKey);
      toggle?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream">
        <div className="mx-auto flex h-(--header-h) max-w-[75rem] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
          <Link
            href="/"
            aria-label="Dahan Kopi, halaman utama"
            className="inline-flex min-h-11 items-center"
          >
            <LogoLockup />
          </Link>
          <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className="label inline-flex min-h-11 items-center underline-offset-[6px] hover:underline aria-[current=page]:underline"
              >
                {item.label}
              </Link>
            ))}
            <CartButton />
          </nav>
          <div className="flex items-center gap-3 lg:hidden">
            <CartButton />
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={open}
              aria-controls="navigasi-mobile"
              aria-label="Buka navigasi"
              className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
              onClick={() => setOpenOn(pathname)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        id="navigasi-mobile"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi"
        inert={!open}
        className={`fixed inset-0 z-50 flex flex-col bg-cream duration-200 lg:hidden ${
          open
            ? "visible opacity-100 transition-opacity"
            : "invisible opacity-0 transition-[opacity,visibility]"
        }`}
      >
        <div className="flex h-(--header-h) items-center justify-between border-b border-line px-4 sm:px-6">
          <LogoLockup />
          <button
            type="button"
            aria-label="Tutup navigasi"
            className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
            onClick={() => setOpenOn(null)}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Navigasi halaman" className="px-4 pt-8 sm:px-6">
          <ul>
            {[{ label: "Home", href: "/" }, ...navigation].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpenOn(null)}
                  className="display-1 flex min-h-16 items-center"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="label mt-auto space-y-1 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] sm:px-6">
          <StatusLine live={false} />
          <p className="text-muted">{address.short}</p>
          <a
            href={contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            @{contact.instagram.handle}
          </a>
        </div>
      </div>
    </>
  );
}
