import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRp } from "@/lib/cart";
import { ReorderButton } from "@/components/ReorderButton";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 20,
  });

  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-12">
          <p className="eyebrow mb-3">Akun</p>
          <h1 className="font-display font-black text-[clamp(32px,5vw,56px)] leading-[0.98] tracking-[-0.02em] mb-2">
            Pesanan{" "}
            <em className="text-[var(--tr-brick)]">kamu.</em>
          </h1>
          <p className="text-[var(--tr-text-soft)] max-w-xl leading-relaxed">
            Daftar pesanan terakhir di Tujuh Rasa. Klik nomor pesanan untuk lihat detailnya.
          </p>
        </div>
      </section>

      <div className="container-tr py-12">
        {orders.length === 0 ? (
          <div className="card-stamp p-12 text-center">
            <p className="font-display font-black text-3xl mb-3">
              Belum ada pesanan.
            </p>
            <p className="font-hand text-xl text-[var(--tr-brick-deep)] mb-5">
              ayo mulai kenalan sama botol kami —
            </p>
            <Link href="/shop" className="btn btn-primary">
              Jelajahi botol kami
            </Link>
          </div>
        ) : (
          <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest">No. pesanan</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Tanggal</th>
                  <th className="px-5 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Pelanggan</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Botol</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Total</th>
                  <th className="px-5 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)] transition"
                  >
                    <td className="px-5 py-4 font-mono">
                      <Link href={`/order/${o.orderNumber}`} className="tr-link">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-[var(--tr-text-muted)]">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-display font-bold">{o.customerName}</p>
                      <p className="text-xs text-[var(--tr-text-muted)]">{o.customerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums">
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
                    </td>
                    <td className="px-5 py-4 text-right font-mono tabular-nums">
                      {formatRp(o.totalCents)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <span className="stamp text-[10px]">{o.status}</span>
                        <ReorderButton
                          items={o.items.map((it) => ({
                            productId: it.productId,
                            quantity: it.quantity,
                          }))}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
