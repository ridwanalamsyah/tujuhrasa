import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart, cartTotals, formatRp } from "@/lib/cart";
import { CheckoutForm } from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || cart.items.length === 0) redirect("/cart");
  const totals = cartTotals(cart);

  return (
    <>
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-8 lg:pt-16">
          <p className="eyebrow mb-3">Checkout</p>
          <h1 className="font-display font-black text-[clamp(40px,7vw,96px)] leading-[0.94] tracking-[-0.025em]">
            Hampir<br />
            <span className="text-[var(--tr-brick)]">sampai.</span>
          </h1>
          <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-3">
            isi alamatmu —
          </p>
        </div>
      </section>

      <section className="container-tr pt-10 pb-20">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
          <div>
            <CheckoutForm subtotalIdr={totals.subtotalCents} />
          </div>
          <aside className="card-stamp bg-[var(--tr-paper)] p-7 sm:p-8 h-fit lg:sticky lg:top-24">
            <p className="eyebrow mb-3">Pesanan</p>
            <ul className="space-y-3 text-sm">
              {cart.items.map((it) => (
                <li
                  key={it.id}
                  className="flex justify-between gap-3 pb-3 border-b border-[var(--tr-line-strong)] last:border-0 last:pb-0"
                >
                  <span>
                    <span className="font-display font-semibold text-[var(--tr-ink)] text-base">
                      {it.product.name.split("—")[0].trim()}
                    </span>
                    <span className="opacity-50 ml-1 font-mono text-xs">
                      × {it.quantity}
                    </span>
                  </span>
                  <span className="font-mono text-sm tabular-nums">
                    {formatRp(it.product.priceCents * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="my-5 rule-soft" />
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="opacity-70">Subtotal</span>
                <span className="font-mono">{formatRp(totals.subtotalCents)}</span>
              </li>
              <li className="flex justify-between">
                <span className="opacity-70">Ongkir</span>
                <span className="font-mono">
                  {totals.shippingCents === 0 ? (
                    <span className="text-[var(--tr-brick)] font-bold">gratis</span>
                  ) : (
                    formatRp(totals.shippingCents)
                  )}
                </span>
              </li>
              <li className="flex justify-between border-t-2 border-[var(--tr-ink)] pt-4 mt-2">
                <span className="font-display font-bold text-xl">Total</span>
                <span className="font-display font-black text-xl">
                  {formatRp(totals.totalCents)}
                </span>
              </li>
            </ul>
            <Link
              href="/cart"
              className="inline-block mt-5 font-mono text-[11px] uppercase tracking-widest text-[var(--tr-text-muted)] hover:text-[var(--tr-ink)] transition"
            >
              ← Edit keranjang
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
