import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRp } from "@/lib/cart";
import { erpEnabled } from "@/lib/erp";
import { getProductsForDisplay } from "@/lib/products";
import { AdminLogout } from "@/components/AdminLogout";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, orders, subs, totalRevenue, payments, syncLogs, promos] = await Promise.all([
    getProductsForDisplay(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { items: true, payments: true },
    }),
    prisma.subscription.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.order.aggregate({
      _sum: { totalCents: true, hppCents: true, discountCents: true },
      _count: true,
    }),
    prisma.payment.findMany({ orderBy: { ts: "desc" }, take: 10 }),
    prisma.erpSyncLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.promoCode.findMany({ orderBy: { code: "asc" } }),
  ]);

  const grossRevenue = totalRevenue._sum.totalCents ?? 0;
  const totalHpp = totalRevenue._sum.hppCents ?? 0;
  const grossProfit = grossRevenue - totalHpp;

  return (
    <div className="container-tr pt-32 pb-20">
      <div className="flex items-center gap-3 mb-3">
        <p className="eyebrow">/ admin</p>
        <span
          className={
            "font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full " +
            (erpEnabled ? "bg-olive/20 text-olive" : "bg-ink/10 text-ink/60")
          }
        >
          ERP {erpEnabled ? "tersambung" : "off"}
        </span>
        <a
          href="https://tujuhrasa-erp.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-ink/20 hover:bg-ink hover:text-cream transition"
        >
          buka ERP ↗
        </a>
        <div className="ml-auto">
          <AdminLogout />
        </div>
      </div>
      <h1 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.02] mb-2">
        Dapur belakang.
      </h1>
      <p className="opacity-70 mb-10">
        Pesanan, langganan, & poin pelanggan otomatis ter-push ke ERP-mu di
        Supabase. Produk di bawah dibaca <em>real-time</em> dari{" "}
        <code className="font-mono text-xs">state.products[]</code> ERP.
      </p>

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <Stat label="produk aktif" value={String(products.length)} />
        <Stat label="pesanan" value={String(totalRevenue._count ?? 0)} />
        <Stat label="pendapatan" value={formatRp(grossRevenue)} accent />
        <Stat label="laba kotor" value={formatRp(grossProfit)} />
      </div>

      <section className="mb-12">
        <h2 className="h-display text-2xl mb-4">Produk.</h2>
        <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
          <table className="w-full text-sm">
            <thead className="bg-ink text-cream">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-xs lowercase">sku</th>
                <th className="px-4 py-3 text-left font-mono text-xs lowercase">nama</th>
                <th className="px-4 py-3 text-left font-mono text-xs lowercase">kategori</th>
                <th className="px-4 py-3 text-right font-mono text-xs lowercase">harga</th>
                <th className="px-4 py-3 text-right font-mono text-xs lowercase">hpp</th>
                <th className="px-4 py-3 text-right font-mono text-xs lowercase">stok</th>
                <th className="px-4 py-3 text-right font-mono text-xs lowercase">min</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-mono opacity-70 text-xs">{p.sku}</td>
                  <td className="px-4 py-3">
                    <Link href={`/shop/${p.slug}`} className="tr-link font-serif italic text-lg">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs lowercase">{p.cat}</td>
                  <td className="px-4 py-3 text-right font-mono">{formatRp(p.priceCents)}</td>
                  <td className="px-4 py-3 text-right font-mono opacity-70">{formatRp(p.gros)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock <= p.minStk ? "text-orange font-bold" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right opacity-50 text-xs">{p.minStk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="h-display text-2xl mb-4">Pesanan terakhir.</h2>
        {orders.length === 0 ? (
          <p className="opacity-60 text-sm">Belum ada pesanan.</p>
        ) : (
          <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
            <table className="w-full text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">no</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">tanggal</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">pelanggan</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">btl</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">total</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">bayar</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">status</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">erp</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/order/${o.orderNumber}`} className="tr-link">#{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 opacity-70 text-xs">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">{o.customerName}</td>
                    <td className="px-4 py-3 text-right">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatRp(o.totalCents)}</td>
                    <td className="px-4 py-3 font-mono text-xs">{o.paymentChannel ?? o.paymentMethod}</td>
                    <td className="px-4 py-3"><StatusPill v={o.status} /></td>
                    <td className="px-4 py-3"><SyncPill v={o.erpSyncStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-12 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="h-display text-2xl mb-4">Pembayaran.</h2>
          {payments.length === 0 ? (
            <p className="opacity-60 text-sm">Belum ada pembayaran.</p>
          ) : (
            <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
              <table className="w-full text-sm">
                <thead className="bg-ink text-cream">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-xs lowercase">tanggal</th>
                    <th className="px-4 py-3 text-left font-mono text-xs lowercase">metode</th>
                    <th className="px-4 py-3 text-right font-mono text-xs lowercase">jumlah</th>
                    <th className="px-4 py-3 text-left font-mono text-xs lowercase">status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-ink/10">
                      <td className="px-4 py-3 opacity-70 text-xs">
                        {new Date(p.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.channel ?? p.method}</td>
                      <td className="px-4 py-3 text-right font-mono">{formatRp(p.amountCents)}</td>
                      <td className="px-4 py-3"><StatusPill v={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="h-display text-2xl mb-4">Promo aktif.</h2>
          <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
            <table className="w-full text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">kode</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">tipe</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">nilai</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">min</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">dipakai</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-mono">{p.code}</td>
                    <td className="px-4 py-3 text-xs">{p.kind}</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {p.kind === "percent" ? `${p.value}%` : formatRp(p.value)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono opacity-70">{formatRp(p.minSubtotal)}</td>
                    <td className="px-4 py-3 text-right">{p.redeemedCount}{p.maxRedemption ? ` / ${p.maxRedemption}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="h-display text-2xl mb-4">Sync log ERP.</h2>
        {syncLogs.length === 0 ? (
          <p className="opacity-60 text-sm">Belum ada aktivitas sync.</p>
        ) : (
          <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
            <table className="w-full text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">waktu</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">resource</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">id</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">status</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">pesan</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((l) => (
                  <tr key={l.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 opacity-70 text-xs">
                      {new Date(l.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.resourceId}</td>
                    <td className="px-4 py-3"><SyncPill v={l.status === "success" ? "synced" : "failed"} /></td>
                    <td className="px-4 py-3 text-xs opacity-70">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="h-display text-2xl mb-4">Pelanggan langganan.</h2>
        {subs.length === 0 ? (
          <p className="opacity-60 text-sm">Belum ada pelanggan langganan.</p>
        ) : (
          <div className="rounded-2xl border border-ink/20 overflow-hidden bg-paper">
            <table className="w-full text-sm">
              <thead className="bg-ink text-cream">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">nama</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">email</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">jadwal</th>
                  <th className="px-4 py-3 text-right font-mono text-xs lowercase">botol/kotak</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">preferensi</th>
                  <th className="px-4 py-3 text-left font-mono text-xs lowercase">erp</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t border-ink/10">
                    <td className="px-4 py-3 font-serif italic">{s.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs opacity-70">{s.customerEmail}</td>
                    <td className="px-4 py-3">{s.plan}</td>
                    <td className="px-4 py-3 text-right">{s.bottlesPerBox}</td>
                    <td className="px-4 py-3">{s.preference}</td>
                    <td className="px-4 py-3"><SyncPill v={s.erpSyncStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"rounded-2xl border p-6 " + (accent ? "bg-ink text-cream border-ink" : "bg-paper border-ink/20")}>
      <p className={"eyebrow mb-2 " + (accent ? "text-cream/60" : "")}>{label}</p>
      <p className="font-serif italic text-3xl">{value}</p>
    </div>
  );
}

function StatusPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    paid: "bg-olive/20 text-olive",
    settled: "bg-olive/20 text-olive",
    unpaid: "bg-orange/20 text-orange",
    pending: "bg-ink/10 text-ink/60",
    failed: "bg-orange/20 text-orange",
    cancelled: "bg-ink/30 text-ink/50",
  };
  return (
    <span className={"font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full " + (map[v] ?? "bg-ink/10 text-ink/60")}>
      {v}
    </span>
  );
}

function SyncPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    synced: "bg-olive/20 text-olive",
    pending: "bg-ink/10 text-ink/60",
    failed: "bg-orange/20 text-orange",
    skipped: "bg-ink/10 text-ink/40",
  };
  const label =
    v === "synced" ? "✓ erp" : v === "failed" ? "× gagal" : v === "skipped" ? "off" : v;
  return (
    <span className={"font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-full " + (map[v] ?? "bg-ink/10 text-ink/60")}>
      {label}
    </span>
  );
}
