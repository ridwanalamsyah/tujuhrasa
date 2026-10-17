"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { StatusLine } from "@/components/hours/StatusLine";
import { LogoLockup } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { TextLink } from "@/components/ui/TextLink";
import { about, address, contact, features, navigation } from "@/data/site";
import { reservationHref } from "@/lib/links";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  // Navigasi mobile otomatis tertutup saat pindah halaman.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  // Kembalikan fokus ke tombol menu hanya bila ditutup dengan Escape / tombol tutup.
  const restoreFocus = useRef(false);
  const reservation = reservationHref();

  const close = (returnFocus: boolean) => {
    restoreFocus.current = returnFocus;
    setOpenOn(null);
  };

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const toggle = toggleRef.current;
    root.style.overflow = "hidden";
    overlayRef.current?.querySelector<HTMLElement>("nav a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocus.current = true;
        setOpenOn(null);
      }
    };
    // Tutup otomatis bila layar melebar ke ukuran desktop.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => desktop.matches && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      // Berjalan setelah header tidak lagi `inert`, jadi fokus bisa dipindahkan.
      if (restoreFocus.current) toggle?.focus();
      restoreFocus.current = false;
    };
  }, [open]);

  const bar = (isOverlay: boolean) => (
    <div className="mx-auto flex h-(--header-h) w-full max-w-[75rem] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
      <Link
        href="/"
        aria-label="Dahan Kopi, halaman utama"
        className="-mx-1 inline-flex min-h-11 items-center px-1"
        onClick={isOverlay ? () => close(false) : undefined}
      >
        <LogoLockup />
      </Link>

      {!isOverlay && (
        <nav aria-label="Navigasi utama" className="hidden items-center gap-8 lg:flex">
          <ul className="flex items-center gap-8">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className="inline-flex min-h-11 items-center text-[0.9375rem] font-medium decoration-1 underline-offset-[6px] hover:underline aria-[current=page]:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Button href={reservation} className="h-10!">
            {features.reservation.label}
          </Button>
        </nav>
      )}

      <div className="flex items-center gap-2 lg:hidden">
        {!isOverlay && (
          <TextLink href={reservation} className="px-1 text-[0.875rem] font-semibold">
            {features.reservation.label}
          </TextLink>
        )}
        <button
          ref={isOverlay ? undefined : toggleRef}
          type="button"
          className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
          aria-expanded={open}
          aria-controls="navigasi-mobile"
          aria-label={isOverlay ? "Tutup navigasi" : "Buka navigasi"}
          onClick={() => (isOverlay ? close(true) : setOpenOn(pathname))}
        >
          {isOverlay ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-cream" inert={open}>
        {bar(false)}
      </header>

      <div
        id="navigasi-mobile"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi"
        inert={!open}
        className={`fixed inset-0 z-50 flex flex-col overflow-y-auto bg-cream duration-200 lg:hidden ${
          // Saat dibuka, visibility langsung aktif agar link pertama bisa langsung difokus.
          open
            ? "visible opacity-100 transition-opacity"
            : "invisible opacity-0 transition-[opacity,visibility]"
        }`}
      >
        <div className="border-b border-line">{bar(true)}</div>
        <div className="flex flex-1 flex-col px-4 sm:px-6">
          <nav aria-label="Navigasi mobile" className="pt-10">
            <ul>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    onClick={() => close(false)}
                    className="display-1 flex min-h-14 items-center leading-[1.1] decoration-2 underline-offset-[0.12em] aria-[current=page]:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Button href={reservation} tone="solid" className="mt-10">
            {about.contactButton}
          </Button>

          <div className="mt-auto space-y-1 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10 text-small">
            <StatusLine />
            <p className="text-muted">{address.short}</p>
            <TextLink href={contact.instagram.url}>@{contact.instagram.handle}</TextLink>
          </div>
        </div>
      </div>
    </>
  );
}
