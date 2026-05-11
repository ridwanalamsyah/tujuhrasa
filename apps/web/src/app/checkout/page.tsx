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
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ checkout</p>
      <h1 className="h-display text-[clamp(36px,5vw,72px)] leading-[1.02] mb-10">
        Hampir sampai.
      </h1>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <CheckoutForm subtotalIdr={totals.subtotalCents} />
        </div>
        <aside className="rounded-3xl border border-ink/20 bg-paper p-8 h-fit lg:sticky lg:top-24">
          <p className="eyebrow mb-3">/ pesanan</p>
          <ul className="space-y-3 text-sm">
            {cart.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span>
                  <span className="font-serif italic text-base">{it.product.name.split("—")[0].trim()}</span>
                  <span className="opacity-50 ml-1 font-mono text-xs">× {it.quantity}</span>
                </span>
                <span className="font-mono text-sm">{formatRp(it.product.priceCents * it.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="my-5 border-t border-ink/20" />
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="opacity-70">Subtotal</span><span>{formatRp(totals.subtotalCents)}</span></li>
            <li className="flex justify-between"><span className="opacity-70">Ongkir</span><span>{totals.shippingCents === 0 ? <span className="text-orange">gratis</span> : formatRp(totals.shippingCents)}</span></li>
            <li className="flex justify-between border-t border-ink/20 pt-3 mt-2 font-serif italic text-2xl"><span>Total</span><span>{formatRp(totals.totalCents)}</span></li>
          </ul>
          <Link href="/cart" className="inline-block mt-5 font-mono text-xs opacity-70 hover:opacity-100">
            ← edit keranjang
          </Link>
        </aside>
      </div>
    </div>
  );
}
