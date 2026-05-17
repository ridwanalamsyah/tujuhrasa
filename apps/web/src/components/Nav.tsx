"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Menu, ShoppingBag, X, ChevronDown } from "lucide-react";

const MAIN = [
  { href: "/shop", label: "Menu" },
  { href: "/cerita", label: "Cerita" },
  { href: "/langganan", label: "Langganan" },
  { href: "/tentang", label: "Tentang" },
];

const AKUN = [
  { href: "/account/orders", label: "Pesanan saya" },
  { href: "/poin", label: "Poin & loyalti" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/referral", label: "Referral" },
];

const FOOTER_LINKS = [
  { href: "/build-box", label: "Build a box" },
  { href: "/jelajah", label: "Jelajah" },
  { href: "/event", label: "Event" },
  { href: "/grosir", label: "Grosir" },
  { href: "/transparansi", label: "Transparansi" },
];

export function Nav({ cartCount }: { cartCount: number }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [akunOpen, setAkunOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setAkunOpen(false);
  }, [path]);

  useEffect(() => {
    const onOpen = () => setCartOpen(true);
    window.addEventListener("tr:cart-open", onOpen);
    return () => window.removeEventListener("tr:cart-open", onOpen);
  }, []);

  return (
    <header className="sticky top-0 inset-x-0 z-40 bg-[var(--tr-cream)] border-b-2 border-[var(--tr-ink)]">
      <div className="container-tr flex items-center justify-between h-14 sm:h-16">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="Tujuh Rasa — beranda"
        >
          <span
            className="grid place-items-center w-9 h-9 rounded-sm bg-[var(--tr-brick)] text-[var(--tr-paper)] border-2 border-[var(--tr-ink)] font-display font-black text-base leading-none"
            aria-hidden
          >
            7
          </span>
          <span className="hidden sm:inline font-display font-black text-lg leading-none tracking-tight">
            Tujuh Rasa
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 text-[14px]">
          {MAIN.map((l) => {
            const active = path === l.href || path?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "px-3 py-1.5 rounded-sm font-medium transition " +
                  (active
                    ? "bg-[var(--tr-ink)] text-[var(--tr-paper)]"
                    : "text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)]")
                }
              >
                {l.label}
              </Link>
            );
          })}
          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => setAkunOpen((v) => !v)}
              className="px-3 py-1.5 rounded-sm inline-flex items-center gap-1 font-medium text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] transition"
              aria-expanded={akunOpen}
              aria-haspopup="menu"
            >
              Akun
              <ChevronDown
                className={
                  "h-3.5 w-3.5 transition-transform " +
                  (akunOpen ? "rotate-180" : "")
                }
              />
            </button>
            {akunOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 rounded-md border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] shadow-stamp p-1.5 z-50"
              >
                {AKUN.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className="block px-3 py-1.5 rounded-sm hover:bg-[var(--tr-paper-2)] text-[var(--tr-ink)] text-sm font-medium"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-sm border-2 border-[var(--tr-ink)] bg-[var(--tr-paper)] text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-stamp-sm transition-all"
            aria-label={`Keranjang (${cartCount} item)`}
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] grid place-items-center px-1 rounded-sm bg-[var(--tr-brick)] text-[var(--tr-paper)] text-[10px] font-bold border border-[var(--tr-ink)]">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-sm text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] transition border-2 border-transparent"
            aria-label="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t-2 border-[var(--tr-ink)] bg-[var(--tr-paper)]">
          <nav className="container-tr py-4 flex flex-col gap-1">
            {MAIN.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2.5 px-3 rounded-sm hover:bg-[var(--tr-paper-2)] text-[var(--tr-ink)] font-medium"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 rule-soft" />
            <p className="px-3 eyebrow">Akun</p>
            {AKUN.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2 px-3 rounded-sm hover:bg-[var(--tr-paper-2)] text-[var(--tr-text-soft)] text-sm"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 rule-soft" />
            <p className="px-3 eyebrow">Lain-lain</p>
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2 px-3 rounded-sm hover:bg-[var(--tr-paper-2)] text-[var(--tr-text-soft)] text-sm"
              >
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
