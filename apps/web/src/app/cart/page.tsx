import Link from "next/link";
import { getOrCreateCart, cartTotals, formatRp } from "@/lib/cart";
import { CartItemRow } from "@/components/CartItemRow";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getOrCreateCart();
  const totals = cartTotals(cart);
  const isEmpty = !cart || cart.items.length === 0;

  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-8 lg:pt-16">
          <p className="eyebrow mb-3">Keranjang</p>
          <h1 className="font-display font-black text-[clamp(40px,7vw,96px)] leading-[0.94] tracking-[-0.025em]">
            Keranjangmu.
          </h1>
          <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-3">
            siap diantar pulang ↓
          </p>
        </div>
      </section>

      <section className="container-tr pt-10 pb-20">
        {isEmpty ? (
          <div className="card-stamp p-12 text-center max-w-xl mx-auto">
            <p className="font-display-italic text-3xl mb-2">Masih kosong.</p>
            <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mb-6">
              ayo isi dulu —
            </p>
            <p className="text-[var(--tr-text-muted)] mb-7 text-sm">
              Belum ada botol di sini. Coba jelajahi rak kami.
            </p>
            <Link href="/shop" className="btn btn-primary">
              Lihat semua botol →
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
            <div>
              <div className="space-y-3">
                {cart.items.map((it) => (
                  <CartItemRow
                    key={it.id}
                    itemId={it.id}
                    quantity={it.quantity}
                    product={it.product}
                  />
                ))}
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 mt-7 font-mono text-[11px] uppercase tracking-widest text-[var(--tr-text-muted)] hover:text-[var(--tr-ink)] transition"
              >
                ← Lanjut belanja
              </Link>
            </div>

            <aside className="card-stamp bg-[var(--tr-ink)] text-[var(--tr-paper)] p-7 sm:p-8 h-fit lg:sticky lg:top-24 border-[var(--tr-ink)]">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-3">
                Ringkasan
              </p>
              <h2 className="font-display font-black text-3xl mb-6">
                Sebelum checkout.
              </h2>

              <ul className="space-y-2.5 text-sm">
                <li className="flex justify-between">
                  <span className="opacity-70">
                    Subtotal ({totals.itemCount} botol)
                  </span>
                  <span className="font-mono">{formatRp(totals.subtotalCents)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="opacity-70">Ongkir</span>
                  <span className="font-mono">
                    {totals.shippingCents === 0 ? (
                      <span className="text-[var(--tr-mustard-soft)] font-bold">gratis</span>
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
                <li className="flex justify-between border-t-2 border-[var(--tr-paper)]/20 pt-4 mt-3">
                  <span className="font-display font-bold text-2xl">Total</span>
                  <span className="font-display font-black text-2xl">{formatRp(totals.totalCents)}</span>
                </li>
              </ul>

              <Link
                href="/checkout"
                className="mt-7 w-full inline-flex justify-center items-center gap-2 rounded-sm bg-[var(--tr-brick)] text-[var(--tr-paper)] py-3 font-semibold text-sm border-2 border-[var(--tr-paper)] hover:bg-[var(--tr-brick-deep)] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_6px_0_var(--tr-paper)] transition-all"
              >
                Lanjut ke checkout →
              </Link>

              <p className="mt-5 text-xs opacity-60 leading-relaxed">
                Pesanan diproses setelah pembayaran terkonfirmasi. Antar hari
                yang sama untuk pesanan sebelum 14:00.
              </p>
            </aside>
          </div>
        )}
      </section>
    </>
  );
}
