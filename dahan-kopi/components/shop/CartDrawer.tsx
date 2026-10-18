"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { CartLines } from "@/components/shop/CartLines";
import { CloseIcon } from "@/components/ui/icons";
import { shop } from "@/data/products";
import { cart, useCart, useCartDrawer } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { priceOrder } from "@/lib/order";

export function CartDrawer() {
  const open = useCartDrawer();
  const order = priceOrder(useCart());
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Tutup saat pindah halaman.
  useEffect(() => {
    cart.closeDrawer();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = document.activeElement as HTMLElement | null;
    root.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cart.closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus({ preventScroll: true });
    };
  }, [open]);

  const remaining = shop.shipping.freeOver - order.subtotal;

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "visible" : "invisible"}`} inert={!open}>
      <div
        aria-hidden="true"
        onClick={() => cart.closeDrawer()}
        className={`absolute inset-0 bg-espresso/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang"
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream transition-transform duration-300 ease-soft ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-(--header-h) items-center justify-between border-b border-line px-5">
          <p className="label">Keranjang</p>
          <button
            type="button"
            aria-label="Tutup keranjang"
            className="-mr-3 inline-flex h-11 w-11 items-center justify-center"
            onClick={() => cart.closeDrawer()}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {order.items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-5">
            <p className="text-muted">Keranjang masih kosong.</p>
            <Link href="/shop" className="label underline underline-offset-4">
              Lihat produk
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <CartLines items={order.items} />
            </div>
            <div className="border-t border-line px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
              {shop.shipping.freeOver > 0 && remaining > 0 && (
                <p className="mb-3 text-small text-muted">
                  Tambah {formatPrice(remaining)} lagi untuk gratis ongkir.
                </p>
              )}
              <div className="flex justify-between font-semibold">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="mt-4 flex h-12 items-center justify-center bg-espresso text-[0.9375rem] font-semibold text-cream hover:bg-coffee"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
