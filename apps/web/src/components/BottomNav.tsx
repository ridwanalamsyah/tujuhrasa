"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type CartResp = { itemCount: number };

const NAV = [
  { href: "/", label: "beranda", icon: "🏠" },
  { href: "/shop", label: "menu", icon: "📋" },
  { href: "/cart", label: "keranjang", icon: "🛍" },
  { href: "/account/orders", label: "akun", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/cart")
      .then((r) => r.json())
      .then((d: CartResp) => setCount(d.itemCount ?? 0))
      .catch(() => {});
    const id = setInterval(() => {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((d: CartResp) => setCount(d.itemCount ?? 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, [pathname]);

  // Hide on admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream/95 backdrop-blur border-t border-ink/15 pb-[env(safe-area-inset-bottom)]"
      aria-label="navigasi bawah"
    >
      <div className="grid grid-cols-4">
        {NAV.map((n) => {
          const active =
            pathname === n.href ||
            (n.href !== "/" && pathname?.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={
                "relative flex flex-col items-center justify-center py-2 text-[10px] font-mono lowercase transition " +
                (active ? "text-orange" : "text-ink opacity-60")
              }
            >
              <span className="text-xl leading-none">{n.icon}</span>
              <span className="mt-1">{n.label}</span>
              {n.href === "/cart" && count > 0 && (
                <span className="absolute top-1 right-1/4 -translate-x-1/2 inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-orange text-cream text-[9px] font-mono px-1">
                  {count > 9 ? "9+" : count}
                </span>
              )}
              {active && (
                <span className="absolute top-0 left-0 right-0 h-[2px] bg-orange" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
