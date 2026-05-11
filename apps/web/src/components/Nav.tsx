"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Menu, ShoppingBag, Search, X, ChevronDown } from "lucide-react";

const MAIN = [
  { href: "/shop", label: "Menu" },
  { href: "/cerita", label: "Cerita" },
  { href: "/langganan", label: "Langganan" },
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
  { href: "/tentang", label: "Tentang" },
];

export function Nav({ cartCount }: { cartCount: number }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [akunOpen, setAkunOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAkunOpen(false);
  }, [path]);

  useEffect(() => {
    const onOpen = () => setCartOpen(true);
    window.addEventListener("tr:cart-open", onOpen);
    return () => window.removeEventListener("tr:cart-open", onOpen);
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("tr:cmdk-open"));
  };

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-40 transition-all duration-300 " +
        (scrolled
          ? "backdrop-blur-xl bg-[var(--tr-bg)]/80 border-b border-[var(--tr-border)]"
          : "bg-transparent")
      }
    >
      <div className="container-tr flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Tujuh Rasa - beranda"
        >
          <span className="text-[var(--tr-ink)] transition-transform group-hover:rotate-[-4deg]">
            <svg
              viewBox="0 0 40 40"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M14 8 v6 a6 6 0 0 0 1.5 4 l1.5 1.6 a4 4 0 0 1 1 2.6 v8.8 a3 3 0 0 0 3 3 h0 a3 3 0 0 0 3 -3 v-8.8 a4 4 0 0 1 1 -2.6 l1.5 -1.6 a6 6 0 0 0 1.5 -4 v-6 z" />
              <line x1="13" y1="8" x2="29" y2="8" />
            </svg>
          </span>
          <span className="h-display text-xl leading-none">Tujuh Rasa</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-[15px]">
          {MAIN.map((l) => {
            const active = path === l.href || path?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  "px-3.5 py-2 rounded-full transition " +
                  (active
                    ? "bg-[var(--tr-paper-2)] text-[var(--tr-ink)] font-medium"
                    : "text-[var(--tr-text-soft)] hover:bg-[var(--tr-paper-2)]/60 hover:text-[var(--tr-ink)]")
                }
              >
                {l.label}
              </Link>
            );
          })}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAkunOpen((v) => !v)}
              className="px-3.5 py-2 rounded-full inline-flex items-center gap-1 text-[var(--tr-text-soft)] hover:bg-[var(--tr-paper-2)]/60 hover:text-[var(--tr-ink)] transition"
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
                className="absolute right-0 mt-2 w-52 rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] shadow-[var(--tr-shadow-card-hover)] p-2 z-50 animate-[tr-fade-up_.18s_ease]"
              >
                {AKUN.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    role="menuitem"
                    className="block px-3 py-2 rounded-lg hover:bg-[var(--tr-paper-2)] text-[var(--tr-text)] text-sm"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:inline-flex items-center gap-2 rounded-full px-3 h-9 border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] text-[var(--tr-text-muted)] hover:text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] transition text-sm"
            aria-label="cari (cmd+k)"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="text-xs">Cari</span>
            <kbd className="hidden lg:inline px-1.5 py-0.5 rounded font-mono text-[10px] bg-[var(--tr-paper-2)] text-[var(--tr-text-soft)] border border-[var(--tr-border)]">
              ⌘K
            </kbd>
          </button>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] hover:-translate-y-[1px] transition"
            aria-label={`Keranjang (${cartCount} item)`}
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] grid place-items-center px-1 rounded-full bg-[var(--tr-orange)] text-white text-[10px] font-bold">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[var(--tr-ink)] hover:bg-[var(--tr-paper-2)] transition"
            aria-label="menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-[var(--tr-border)] bg-[var(--tr-bg)]">
          <nav className="container-tr py-4 flex flex-col gap-1">
            {MAIN.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2.5 px-3 rounded-xl hover:bg-[var(--tr-paper-2)] text-[var(--tr-ink)]"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-[var(--tr-border)]" />
            <p className="px-3 eyebrow">Akun</p>
            {AKUN.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2 px-3 rounded-xl hover:bg-[var(--tr-paper-2)] text-[var(--tr-text-soft)] text-sm"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-[var(--tr-border)]" />
            <p className="px-3 eyebrow">Lain-lain</p>
            {FOOTER_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="py-2 px-3 rounded-xl hover:bg-[var(--tr-paper-2)] text-[var(--tr-text-soft)] text-sm"
              >
                {l.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                openSearch();
              }}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] text-sm"
            >
              <Search className="h-3.5 w-3.5" /> Cari halaman / produk
            </button>
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
