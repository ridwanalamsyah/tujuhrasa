import Link from "next/link";
import { getOrCreateCart, cartTotals, formatRp } from "@/lib/cart";
import { CartItemRow } from "@/components/CartItemRow";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const totals = cartTotals(cart);

  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ keranjang</p>
      <h1 className="h-display text-[clamp(36px,5vw,72px)] leading-[1.02] mb-10">
        Keranjangmu.
      </h1>

      {!cart || cart.items.length === 0 ? (
        <div className="rounded-3xl border border-ink/20 bg-paper p-12 text-center">
          <p className="text-6xl mb-4">🪴</p>
          <p className="font-serif italic text-3xl mb-3">Masih kosong.</p>
          <p className="opacity-70 mb-6">Belum ada botol di sini. Coba jelajahi rak kami.</p>
          <Link href="/shop" className="btn-primary">lihat semua botol</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
          <div>
            {cart.items.map((it) => (
              <CartItemRow
                key={it.id}
                itemId={it.id}
                quantity={it.quantity}
                product={it.product}
              />
            ))}
            <Link href="/shop" className="inline-flex items-center gap-2 mt-6 font-mono text-xs opacity-70 hover:opacity-100">
              ← lanjut belanja
            </Link>
          </div>

          <aside className="rounded-3xl bg-ink text-cream p-8 h-fit lg:sticky lg:top-24">
            <p className="eyebrow text-cream/60 mb-3">/ ringkasan</p>
            <h2 className="h-display text-3xl mb-6">Sebelum checkout.</h2>

            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="opacity-70">Subtotal ({totals.itemCount} botol)</span>
                <span>{formatRp(totals.subtotalCents)}</span>
              </li>
              <li className="flex justify-between">
                <span className="opacity-70">Ongkir</span>
                <span>
                  {totals.shippingCents === 0 ? (
                    <span className="text-orange">gratis</span>
                  ) : (
                    formatRp(totals.shippingCents)
                  )}
                </span>
              </li>
              {totals.subtotalCents > 0 && totals.subtotalCents < 150000 && (
                <li className="text-xs opacity-60 italic">
                  + Rp {(150000 - totals.subtotalCents).toLocaleString("id-ID")} lagi untuk gratis ongkir
                </li>
              )}
              <li className="flex justify-between border-t border-cream/20 pt-3 mt-2">
                <span className="font-serif italic text-2xl">Total</span>
                <span className="font-serif italic text-2xl">{formatRp(totals.totalCents)}</span>
              </li>
            </ul>

            <Link
              href="/checkout"
              className="mt-6 w-full inline-flex justify-center items-center gap-2 rounded-full bg-orange text-cream py-3 font-medium hover:bg-orange-2 transition"
            >
              lanjut ke checkout →
            </Link>

            <p className="mt-4 text-xs opacity-60 leading-relaxed">
              Pesanan diproses setelah pembayaran terkonfirmasi. Antar hari yang sama untuk pesanan sebelum 14:00.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
