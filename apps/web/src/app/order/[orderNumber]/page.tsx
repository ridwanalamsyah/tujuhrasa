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
    <div className="container-tr pt-10 pb-20">
      <div className="rounded-md border-2 border-[var(--tr-ink)] shadow-stamp bg-[var(--tr-mustard-soft)]/35 p-8 sm:p-10 text-center mb-10">
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-[var(--tr-brick)]">
          Pesanan terkonfirmasi
        </p>
        <h1 className="font-display font-black text-[clamp(36px,5.5vw,72px)] leading-[0.98] tracking-[-0.02em] mt-3">
          Terima kasih,{" "}
          <em className="text-[var(--tr-brick)]">
            {order.customerName.split(" ")[0]}.
          </em>
        </h1>
        <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-2">
          sruput hangat-hangat —
        </p>
        <p className="text-[var(--tr-text-soft)] mt-3 max-w-xl mx-auto">
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

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-10">
        <div>
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-5">
            Botol-botol kamu.
          </h2>
          <ul className="divide-y-2 divide-[var(--tr-ink)] border-y-2 border-[var(--tr-ink)]">
            {order.items.map((it) => (
              <li key={it.id} className="py-4 flex justify-between items-baseline gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                    {it.productRasa}
                  </p>
                  <p className="font-display font-bold text-xl sm:text-2xl">
                    {it.productName}
                  </p>
                  <p className="font-mono text-xs text-[var(--tr-text-muted)] mt-1">
                    × {it.quantity}
                  </p>
                </div>
                <p className="font-display font-black text-xl sm:text-2xl tabular-nums">
                  {formatRp(it.unitPriceCents * it.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <h2 className="font-display font-black text-3xl sm:text-4xl mt-10 mb-5">
            Pengiriman.
          </h2>
          <div className="card-stamp p-6 grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="eyebrow mb-1">Alamat</p>
              <p className="leading-relaxed">
                {order.shippingAddress}<br/>{order.shippingCity} {order.shippingZip}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-1">Kontak</p>
              <p className="leading-relaxed">
                {order.customerName}<br/>{order.customerPhone}<br/>{order.customerEmail}
              </p>
            </div>
            {order.notes && (
              <div className="sm:col-span-2 pt-3 border-t-2 border-[var(--tr-ink)]/15">
                <p className="eyebrow mb-1">Catatan</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-secondary">Belanja lagi</Link>
            <Link href="/account/orders" className="btn btn-primary">
              Lihat semua pesanan →
            </Link>
            <WhatsappShare
              text={`Aku barusan pesan kopi botolan dari Tujuh Rasa pesanan #${order.orderNumber}, total ${formatRp(order.totalCents)}.`}
            />
          </div>
        </div>

        <aside className="rounded-md border-2 border-[var(--tr-ink)] shadow-stamp bg-[var(--tr-ink)] text-[var(--tr-paper)] p-7 sm:p-8 h-fit lg:sticky lg:top-24">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-3">
            Ringkasan
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="opacity-70">Subtotal</span>
              <span className="font-mono">{formatRp(order.subtotalCents)}</span>
            </li>
            <li className="flex justify-between">
              <span className="opacity-70">Ongkir</span>
              <span className="font-mono">
                {order.shippingCents === 0 ? "gratis" : formatRp(order.shippingCents)}
              </span>
            </li>
            <li className="flex justify-between border-t-2 border-[var(--tr-paper)]/20 pt-3 mt-2">
              <span className="font-display font-bold text-xl">Total</span>
              <span className="font-display font-black text-xl tabular-nums">
                {formatRp(order.totalCents)}
              </span>
            </li>
          </ul>
          <div className="mt-6 rounded-sm border-2 border-[var(--tr-paper)]/20 bg-[var(--tr-paper)]/5 p-4 text-sm">
            <p className="opacity-70 font-mono text-[10px] uppercase tracking-widest mb-1">
              Pembayaran
            </p>
            <p className="font-display font-bold text-lg">
              {paymentLabels[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <p className="text-xs opacity-60 mt-2">
              Status: <span className="text-[var(--tr-mustard-soft)] font-bold">terbayar</span>
            </p>
          </div>

          <p className="mt-6 text-xs opacity-70 leading-relaxed">
            Mau melacak kurirnya? Cek{" "}
            <Link href="/account/orders" className="underline decoration-[var(--tr-mustard)] underline-offset-2 hover:text-[var(--tr-mustard-soft)]">
              /account/orders
            </Link>. Kami juga akan kirim email konfirmasi ke {order.customerEmail}.
          </p>
        </aside>
      </div>
    </div>
  );
}
