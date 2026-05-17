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
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Admin</span>
            <span
              className={
                "font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border-2 border-[var(--tr-ink)] " +
                (erpEnabled
                  ? "bg-[var(--tr-leaf)]/20 text-[var(--tr-ink)]"
                  : "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)]")
              }
            >
              ERP {erpEnabled ? "tersambung" : "off"}
            </span>
            <a
              href="https://tujuhrasa-erp.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border-2 border-[var(--tr-ink)] hover:bg-[var(--tr-ink)] hover:text-[var(--tr-paper)] transition"
            >
              Buka ERP ↗
            </a>
            <div className="ml-auto">
              <AdminLogout />
            </div>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[0.98] tracking-[-0.02em] mb-3">
            Dapur belakang.
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Pesanan, langganan, &amp; poin pelanggan otomatis ter-push ke ERP-mu
            di Supabase. Produk di bawah dibaca <em>real-time</em> dari{" "}
            <code className="font-mono text-xs">state.products[]</code> ERP.
          </p>
        </div>
      </section>
      <div className="container-tr py-12 sm:py-16">

      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        <Stat label="Produk aktif" value={String(products.length)} />
        <Stat label="Pesanan" value={String(totalRevenue._count ?? 0)} />
        <Stat label="Pendapatan" value={formatRp(grossRevenue)} accent />
        <Stat label="Laba kotor" value={formatRp(grossProfit)} />
      </div>

      <section className="mb-12">
        <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Produk.</h2>
        <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
              <tr>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">SKU</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Nama</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Kategori</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Harga</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">HPP</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Stok</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Min</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                  <td className="px-4 py-3 font-mono text-[var(--tr-text-muted)] text-xs">{p.sku}</td>
                  <td className="px-4 py-3">
                    <Link href={`/shop/${p.slug}`} className="tr-link font-display font-bold text-base">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{p.cat}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRp(p.priceCents)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--tr-text-muted)]">{formatRp(p.gros)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={p.stock <= p.minStk ? "text-[var(--tr-brick)] font-bold" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--tr-text-muted)] text-xs tabular-nums">{p.minStk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Pesanan terakhir.</h2>
        {orders.length === 0 ? (
          <p className="text-[var(--tr-text-muted)] text-sm">Belum ada pesanan.</p>
        ) : (
          <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">No</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Tanggal</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Pelanggan</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Btl</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Total</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Bayar</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">ERP</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                    <td className="px-4 py-3 font-mono">
                      <Link href={`/order/${o.orderNumber}`} className="tr-link">#{o.orderNumber}</Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--tr-text-muted)] text-xs">
                      {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-display font-bold">{o.customerName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRp(o.totalCents)}</td>
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
          <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Pembayaran.</h2>
          {payments.length === 0 ? (
            <p className="text-[var(--tr-text-muted)] text-sm">Belum ada pembayaran.</p>
          ) : (
            <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Tanggal</th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Metode</th>
                    <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Jumlah</th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                      <td className="px-4 py-3 text-[var(--tr-text-muted)] text-xs">
                        {new Date(p.ts).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.channel ?? p.method}</td>
                      <td className="px-4 py-3 text-right font-mono tabular-nums">{formatRp(p.amountCents)}</td>
                      <td className="px-4 py-3"><StatusPill v={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Promo aktif.</h2>
          <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
            <table className="w-full text-sm min-w-[480px]">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Kode</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Tipe</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Nilai</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Min</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Dipakai</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                    <td className="px-4 py-3 font-mono">{p.code}</td>
                    <td className="px-4 py-3 text-xs">{p.kind}</td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {p.kind === "percent" ? `${p.value}%` : formatRp(p.value)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-[var(--tr-text-muted)]">{formatRp(p.minSubtotal)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{p.redeemedCount}{p.maxRedemption ? ` / ${p.maxRedemption}` : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Sync log ERP.</h2>
        {syncLogs.length === 0 ? (
          <p className="text-[var(--tr-text-muted)] text-sm">Belum ada aktivitas sync.</p>
        ) : (
          <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Waktu</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Resource</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">ID</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Pesan</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((l) => (
                  <tr key={l.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                    <td className="px-4 py-3 text-[var(--tr-text-muted)] text-xs">
                      {new Date(l.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{l.resource}</td>
                    <td className="px-4 py-3 font-mono text-xs">{l.resourceId}</td>
                    <td className="px-4 py-3"><SyncPill v={l.status === "success" ? "synced" : "failed"} /></td>
                    <td className="px-4 py-3 text-xs text-[var(--tr-text-muted)]">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display font-black text-2xl sm:text-3xl mb-4">Pelanggan langganan.</h2>
        {subs.length === 0 ? (
          <p className="text-[var(--tr-text-muted)] text-sm">Belum ada pelanggan langganan.</p>
        ) : (
          <div className="rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm overflow-x-auto bg-[var(--tr-paper)]">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-[var(--tr-ink)] text-[var(--tr-paper)]">
                <tr>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Nama</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Email</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Jadwal</th>
                  <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Botol/kotak</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">Preferensi</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">ERP</th>
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-t-2 border-[var(--tr-ink)]/15 hover:bg-[var(--tr-paper-2)]">
                    <td className="px-4 py-3 font-display font-bold">{s.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--tr-text-muted)]">{s.customerEmail}</td>
                    <td className="px-4 py-3">{s.plan}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{s.bottlesPerBox}</td>
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
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        "rounded-sm border-2 border-[var(--tr-ink)] shadow-stamp-sm p-6 " +
        (accent
          ? "bg-[var(--tr-ink)] text-[var(--tr-paper)]"
          : "bg-[var(--tr-paper)]")
      }
    >
      <p
        className={
          "font-mono text-[10px] uppercase tracking-widest mb-2 " +
          (accent ? "text-[var(--tr-paper)]/60" : "text-[var(--tr-text-muted)]")
        }
      >
        {label}
      </p>
      <p className="font-display font-black text-3xl tabular-nums">{value}</p>
    </div>
  );
}

function StatusPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    paid: "bg-[var(--tr-leaf)]/20 text-[var(--tr-ink)] border-[var(--tr-ink)]",
    settled: "bg-[var(--tr-leaf)]/20 text-[var(--tr-ink)] border-[var(--tr-ink)]",
    unpaid: "bg-[var(--tr-mustard-soft)]/40 text-[var(--tr-ink)] border-[var(--tr-ink)]",
    pending: "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40",
    failed: "bg-[var(--tr-brick)] text-[var(--tr-paper)] border-[var(--tr-ink)]",
    cancelled: "bg-[var(--tr-ink)]/20 text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40",
  };
  return (
    <span
      className={
        "inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border-2 " +
        (map[v] ?? "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40")
      }
    >
      {v}
    </span>
  );
}

function SyncPill({ v }: { v: string }) {
  const map: Record<string, string> = {
    synced: "bg-[var(--tr-leaf)]/20 text-[var(--tr-ink)] border-[var(--tr-ink)]",
    pending: "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40",
    failed: "bg-[var(--tr-brick)] text-[var(--tr-paper)] border-[var(--tr-ink)]",
    skipped: "bg-[var(--tr-ink)]/10 text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40",
  };
  const label =
    v === "synced" ? "✓ erp" : v === "failed" ? "× gagal" : v === "skipped" ? "off" : v;
  return (
    <span
      className={
        "inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm border-2 " +
        (map[v] ?? "bg-[var(--tr-paper-2)] text-[var(--tr-text-muted)] border-[var(--tr-ink)]/40")
      }
    >
      {label}
    </span>
  );
}
