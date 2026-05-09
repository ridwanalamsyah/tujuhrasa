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
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ akun</p>
      <h1 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.02] mb-2">
        Pesanan kamu.
      </h1>
      <p className="opacity-70 mb-8 max-w-xl">
        Daftar pesanan terakhir di Tujuh Rasa. Klik nomor pesanan untuk lihat detailnya.
        (Demo: tampil semua order, autentikasi belum aktif)
      </p>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-ink/20 bg-paper p-12 text-center">
          <p className="font-serif italic text-3xl mb-3">Belum ada pesanan.</p>
          <Link href="/shop" className="btn-primary">jelajahi botol kami</Link>
        </div>
      ) : (
        <div className="rounded-3xl border border-ink/20 overflow-hidden bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-5 py-3 text-left font-mono text-xs lowercase">no. pesanan</th>
                <th className="px-5 py-3 text-left font-mono text-xs lowercase">tanggal</th>
                <th className="px-5 py-3 text-left font-mono text-xs lowercase">pelanggan</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">botol</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">total</th>
                <th className="px-5 py-3 text-right font-mono text-xs lowercase">status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink/10 hover:bg-ink/5">
                  <td className="px-5 py-4 font-mono">
                    <Link href={`/order/${o.orderNumber}`} className="tr-link">#{o.orderNumber}</Link>
                  </td>
                  <td className="px-5 py-4 opacity-70">
                    {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-serif italic">{o.customerName}</p>
                    <p className="text-xs opacity-60">{o.customerEmail}</p>
                  </td>
                  <td className="px-5 py-4 text-right">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-5 py-4 text-right font-mono">{formatRp(o.totalCents)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <span className="pill bg-orange/10 border-orange/40 text-ink-soft">{o.status}</span>
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
  );
}
