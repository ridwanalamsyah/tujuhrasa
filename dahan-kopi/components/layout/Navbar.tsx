"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Logo } from "@/components/Logo";
import { CloseIcon, InstagramIcon, MenuIcon } from "@/components/ui/icons";
import { address, contact, features, navigation, openingHours } from "@/data/site";
import { formatRange } from "@/lib/hours";
import { isExternal, reservationHref } from "@/lib/links";

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

function useScrolled(offset = 24) {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > offset,
    () => false,
  );
}

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled();
  // Menu mobile otomatis tertutup saat pindah halaman.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const overlay = pathname === "/" && !scrolled && !open;
  const reservation = reservationHref();
  const reservationIsExternal = isExternal(reservation);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenOn(null);
        toggleRef.current?.focus();
      }
    };
    // Tutup otomatis bila layar melebar ke ukuran desktop (menu mobile disembunyikan).
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onResize = () => desktop.matches && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          overlay
            ? "bg-transparent text-cream"
            : "border-b border-line/80 bg-cream/95 text-espresso backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-(--header-h) w-full max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" className="-m-1 rounded-full p-1" aria-label="Dahan Kopi — Home">
            <Logo className="h-11 w-11 sm:h-12 sm:w-12" title="" />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-9 md:flex">
            <ul className="flex items-center gap-8">
              {navigation.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative py-2 text-sm font-medium tracking-wide transition-opacity duration-300 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 hover:opacity-100 ${
                        active
                          ? "after:scale-x-100"
                          : "opacity-80 after:scale-x-0 hover:after:scale-x-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <a
              href={reservation}
              {...(reservationIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold tracking-wide transition-colors duration-300 ${
                overlay
                  ? "bg-cream text-espresso hover:bg-white"
                  : "bg-espresso text-cream hover:bg-coffee"
              }`}
            >
              {features.reservation.label}
            </a>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            onClick={() => setOpenOn(open ? null : pathname)}
          >
            {open ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Di luar <header>: backdrop-filter pada header akan "mengurung" elemen fixed di dalamnya. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        inert={!open}
        className={`fixed inset-x-0 bottom-0 top-(--header-h) z-45 overflow-y-auto bg-cream text-espresso duration-300 md:hidden ${
          // Saat dibuka, visibility langsung aktif agar link pertama bisa langsung difokus.
          open
            ? "visible opacity-100 transition-opacity"
            : "invisible opacity-0 transition-[opacity,visibility]"
        }`}
      >
        <nav aria-label="Navigasi mobile" className="flex min-h-full flex-col px-5 pb-10 pt-8">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  onClick={() => setOpenOn(null)}
                  className="heading-display block py-2 text-5xl aria-[current=page]:text-coffee"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <a
            href={reservation}
            {...(reservationIsExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-espresso px-6 text-sm font-semibold tracking-wide text-cream"
          >
            {features.reservation.label}
            {reservationIsExternal ? " via WhatsApp" : ""}
          </a>

          <div className="mt-auto space-y-4 border-t border-line pt-6 text-sm text-muted">
            <p>{address.short}</p>
            <ul className="space-y-1">
              {openingHours.map((rule) => (
                <li key={rule.label} className="flex justify-between gap-4">
                  <span>{rule.label}</span>
                  <span className="tabular-nums">{formatRange(rule)}</span>
                </li>
              ))}
            </ul>
            <a
              href={contact.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-1 font-medium text-espresso"
            >
              <InstagramIcon className="h-5 w-5" />@{contact.instagram.handle}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
