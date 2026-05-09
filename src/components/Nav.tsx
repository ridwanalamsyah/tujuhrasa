"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";

const links = [
  { href: "/shop", label: "Botol" },
  { href: "/build-box", label: "Box" },
  { href: "/langganan", label: "Langganan" },
  { href: "/poin", label: "Poin" },
  { href: "/jelajah", label: "Jelajah" },
  { href: "/cerita", label: "Cerita" },
];

const moreLinks = [
  { href: "/event", label: "Event" },
  { href: "/grosir", label: "Grosir" },
  { href: "/referral", label: "Referral" },
  { href: "/transparansi", label: "Transparansi" },
  { href: "/tentang", label: "Tentang" },
];

export function Nav({ cartCount }: { cartCount: number }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    const onOpen = () => setCartOpen(true);
    window.addEventListener("tr:cart-open", onOpen);
    return () => window.removeEventListener("tr:cart-open", onOpen);
  }, []);

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-40 transition " +
        (scrolled
          ? "bg-cream/85 backdrop-blur-md border-b border-ink/10"
          : "bg-transparent")
      }
    >
      <div className="container-tr flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-ink">
            <svg viewBox="0 0 40 40" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 8 v6 a6 6 0 0 0 1.5 4 l1.5 1.6 a4 4 0 0 1 1 2.6 v8.8 a3 3 0 0 0 3 3 h0 a3 3 0 0 0 3 -3 v-8.8 a4 4 0 0 1 1 -2.6 l1.5 -1.6 a6 6 0 0 0 1.5 -4 v-6 z" />
              <line x1="13" y1="8" x2="29" y2="8" />
            </svg>
          </span>
          <span className="font-serif italic text-lg leading-none">
            Tujuh Rasa
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 font-mono text-xs lowercase">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "tr-link " +
                (path?.startsWith(l.href) ? "opacity-100" : "opacity-70 hover:opacity-100")
              }
            >
              {l.label}
            </Link>
          ))}
          <details className="relative group">
            <summary className="cursor-pointer list-none opacity-70 hover:opacity-100 select-none">
              lainnya ▾
            </summary>
            <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-ink/15 bg-cream shadow-lg p-2 z-50">
              {moreLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-3 py-2 rounded-lg hover:bg-ink/5 lowercase"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </details>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-full border border-ink px-3 py-1.5 font-mono text-xs lowercase hover:bg-ink hover:text-cream transition"
            aria-label={`Keranjang (${cartCount} item)`}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 6h18l-2 12H5z" strokeLinejoin="round"/>
              <path d="M8 10v-2a4 4 0 0 1 8 0v2" />
            </svg>
            <span>keranjang</span>
            <span
              className={
                "ml-1 inline-grid place-items-center w-5 h-5 rounded-full text-[10px] " +
                (cartCount > 0 ? "bg-orange text-cream" : "bg-ink/10 text-ink")
              }
            >
              {cartCount}
            </span>
          </button>
          <button
            className="md:hidden text-ink"
            aria-label="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              {open ? <><path d="M6 6l12 12"/><path d="M18 6L6 18"/></> : <><path d="M3 7h18"/><path d="M3 12h18"/><path d="M3 17h18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink/10 bg-cream">
          <nav className="container-tr py-4 flex flex-col gap-3 font-mono text-sm lowercase">
            {[...links, ...moreLinks].map((l) => (
              <Link key={l.href} href={l.href} className="py-1">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        initialCount={cartCount}
      />
    </header>
  );
}
