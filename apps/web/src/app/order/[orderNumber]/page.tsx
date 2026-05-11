import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRp } from "@/lib/cart";
import { OrderTracker } from "@/components/OrderTracker";
import { WhatsappShare } from "@/components/WhatsappShare";

export const dynamic = "force-dynamic";

export default async function OrderConfirmation({ params }: { params: { orderNumber: string } }) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: true },
  });
  if (!order) notFound();

  const paymentLabels: Record<string, string> = {
    gopay: "GoPay",
    ovo: "OVO",
    "bca-va": "BCA VA",
    cod: "Bayar di tempat",
  };

  return (
    <div className="container-tr pt-32 pb-20">
      <div className="rounded-3xl bg-orange/10 border border-orange/40 p-10 text-center mb-10">
        <p className="text-5xl">☕</p>
        <p className="eyebrow mt-3 text-orange">/ pesanan terkonfirmasi</p>
        <h1 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.05] mt-2">
          Terima kasih, {order.customerName.split(" ")[0]}.
        </h1>
        <p className="opacity-80 mt-2">
          Pesanan <span className="font-mono">#{order.orderNumber}</span> sudah masuk.
          Kurir akan menghubungi kamu di {order.customerPhone} sebelum berangkat.
        </p>
      </div>

      <div className="mb-8">
        <OrderTracker
          createdAt={order.createdAt.toISOString()}
          status={order.status}
        />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <h2 className="h-display text-3xl mb-5">Botol-botol kamu.</h2>
          <ul className="divide-y divide-ink/15">
            {order.items.map((it) => (
              <li key={it.id} className="py-4 flex justify-between items-baseline">
                <div>
                  <p className="font-mono text-xs opacity-60 lowercase">{it.productRasa}</p>
                  <p className="font-serif italic text-2xl">{it.productName}</p>
                  <p className="font-mono text-sm opacity-60 mt-1">× {it.quantity}</p>
                </div>
                <p className="font-serif italic text-2xl">
                  {formatRp(it.unitPriceCents * it.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="h-display text-3xl mt-10 mb-5">Pengiriman.</h2>
          <div className="rounded-2xl border border-ink/20 bg-paper p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="eyebrow mb-1">alamat</p>
              <p>{order.shippingAddress}<br/>{order.shippingCity} {order.shippingZip}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">kontak</p>
              <p>{order.customerName}<br/>{order.customerPhone}<br/>{order.customerEmail}</p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2">
                <p className="eyebrow mb-1">catatan</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-secondary">belanja lagi</Link>
            <Link href="/account/orders" className="btn-primary">lihat semua pesanan →</Link>
            <WhatsappShare
              text={`Aku barusan pesan kopi botolan dari Tujuh Rasa ☕ pesanan #${order.orderNumber}, total ${formatRp(order.totalCents)}.`}
            />
          </div>
        </div>

        <aside className="rounded-3xl bg-ink text-cream p-8 h-fit lg:sticky lg:top-24">
          <p className="eyebrow text-cream/60 mb-3">/ ringkasan</p>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="opacity-70">Subtotal</span><span>{formatRp(order.subtotalCents)}</span></li>
            <li className="flex justify-between"><span className="opacity-70">Ongkir</span><span>{order.shippingCents === 0 ? "gratis" : formatRp(order.shippingCents)}</span></li>
            <li className="flex justify-between border-t border-cream/20 pt-3 mt-2"><span className="font-serif italic text-2xl">Total</span><span className="font-serif italic text-2xl">{formatRp(order.totalCents)}</span></li>
          </ul>
          <div className="mt-6 rounded-xl bg-cream/10 p-4 text-sm">
            <p className="opacity-70 font-mono text-xs mb-1">pembayaran</p>
            <p className="font-serif italic text-xl">{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
            <p className="text-xs opacity-60 mt-2">Status: <span className="text-orange">terbayar</span></p>
          </div>

          <p className="mt-6 text-xs opacity-60 leading-relaxed">
            Mau melacak kurirnya? Cek <Link href="/account/orders" className="tr-link">/account/orders</Link>. Kami juga akan kirim email konfirmasi ke {order.customerEmail}.
          </p>
        </aside>
      </div>
    </div>
  );
}
