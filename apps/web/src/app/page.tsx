import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bottle } from "@/components/Bottle";
import { formatRp } from "@/lib/cart";
import { getProductsForDisplay } from "@/lib/products";
import { fetchLiveStats } from "@/lib/erp";
import { LiveActivityStrip } from "@/components/LiveActivityStrip";
import { LiveCounters } from "@/components/LiveCounters";
import { KafeSedangSeduh } from "@/components/KafeSedangSeduh";
import { AutoRefresh } from "@/components/AutoRefresh";
import { HeroBottles } from "@/components/HeroBottles";
import { TrustGrid } from "@/components/TrustGrid";
import { Testimonials } from "@/components/Testimonials";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CoffeePassportTeaser } from "@/components/CoffeePassportTeaser";

export const dynamic = "force-dynamic";

async function safeJournal() {
  try {
    return await prisma.journalPost.findMany({ orderBy: { id: "asc" } });
  } catch {
    return [] as Awaited<ReturnType<typeof prisma.journalPost.findMany>>;
  }
}

export default async function HomePage() {
  const [all, posts, liveStats] = await Promise.all([
    getProductsForDisplay(),
    safeJournal(),
    fetchLiveStats(),
  ]);
  const featured = all.slice(0, 4);
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      {/* ─────────────── HERO ─────────────── */}
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-16 lg:pt-20 lg:pb-24">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-start">
            <div>
              {/* Date stamp row */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="stamp">
                  <span aria-hidden>●</span> {today}
                </span>
                <LiveActivityStrip initial={liveStats.recentActivities} />
              </div>

              <h1 className="font-display font-black text-[clamp(56px,10vw,148px)] leading-[0.92] tracking-[-0.03em]">
                Kopi titip<br />
                <span className="text-[var(--tr-brick)]">tetangga.</span>
              </h1>

              <p className="font-hand text-3xl sm:text-4xl text-[var(--tr-brick-deep)] mt-4">
                tujuh rasa, satu meja —
              </p>

              <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)]">
                Kopi, matcha, dan wedang dari{" "}
                <span className="tr-highlight">resep kedai kami</span> —
                diseduh pagi ini, diantar sebelum sore. Stok &amp; harga
                live dari sistem kafe, jadi kamu tidak akan pesan yang
                habis.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/shop" className="btn btn-primary">
                  Lihat menu hari ini →
                </Link>
                <Link href="/langganan" className="btn btn-secondary">
                  Langganan bulanan
                </Link>
              </div>

              <ul className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                {[
                  { k: "01", v: "Diseduh pagi ini" },
                  { k: "02", v: "Diantar hari ini" },
                  { k: "03", v: "Stok live ERP" },
                  { k: "04", v: "Bebas pengawet" },
                ].map((s) => (
                  <li
                    key={s.k}
                    className="border-t-2 border-[var(--tr-ink)] pt-3"
                  >
                    <p className="font-mono text-[10px] tracking-widest text-[var(--tr-text-muted)] uppercase">
                      {s.k}
                    </p>
                    <p className="text-sm font-display font-bold mt-0.5">{s.v}</p>
                  </li>
                ))}
              </ul>
            </div>

            <HeroBottles items={featured} />
          </div>
        </div>
      </section>

      <AutoRefresh intervalMs={30000} />

      {/* ─────────────── TRUST GRID ─────────────── */}
      <TrustGrid />

      {/* ─────────────── LIVE COUNTERS + KAFE ─────────────── */}
      <section className="container-tr pb-12 grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <KafeSedangSeduh
          initial={liveStats.inProgress}
          todayBarista={liveStats.todayBarista}
          open={liveStats.open}
          openHourLabel={liveStats.openHourLabel}
        />
        <LiveCounters
          initial={{
            bottlesToday: liveStats.bottlesToday,
            ordersToday: liveStats.ordersToday,
            revenueWeek: liveStats.revenueWeek,
            activeMenu: liveStats.activeMenu,
            totalCustomers: liveStats.totalCustomers,
          }}
        />
      </section>

      {/* ─────────────── WHY US ─────────────── */}
      <section className="bg-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)]">
        <div className="container-tr py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-end mb-12">
            <div>
              <p className="eyebrow mb-3">Kenapa kami</p>
              <h2 className="font-display font-black text-[clamp(36px,5vw,72px)] leading-[0.96] tracking-tight">
                Kopi yang sopan,<br />
                <span className="text-[var(--tr-brick)]">tetangga yang ramah.</span>
              </h2>
            </div>
            <p className="text-base sm:text-lg leading-relaxed max-w-md justify-self-start lg:justify-self-end text-[var(--tr-text-soft)]">
              Kami percaya kopi yang baik tidak perlu jauh. Dibuat di kafe,
              dibotolkan ke kaca, sampai ke tangan kamu sebelum sore. Tidak
              ada perantara, tidak ada bahan pengawet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-[var(--tr-ink)] rounded-md overflow-hidden bg-[var(--tr-paper-2)]">
            {[
              {
                t: "Diseduh segar",
                d: "Setiap pagi, dari biji yang baru disangrai kemarin sore.",
                n: "01",
              },
              {
                t: "Antar hari ini",
                d: "Pesan sebelum 14:00 — antar di hari yang sama, gratis di atas Rp 150rb.",
                n: "02",
              },
              {
                t: "Botol bisa ditukar",
                d: "Tukar 5 botol kosong = 1 botol gratis. Kami sterilkan ulang.",
                n: "03",
              },
              {
                t: "Sinkron dengan kafe",
                d: "Stok, harga, & resep diambil real-time dari ERP kafe.",
                n: "04",
              },
            ].map((c, i) => (
              <div
                key={c.t}
                className={
                  "bg-[var(--tr-paper)] p-6 lg:p-7 " +
                  (i < 2 ? "border-b-2 sm:border-b-2 lg:border-b-0 " : "") +
                  (i % 2 === 0 ? "sm:border-r-2 " : "") +
                  "border-[var(--tr-ink)] " +
                  (i < 3 ? "lg:border-r-2 lg:border-b-0 " : "")
                }
              >
                <p className="font-mono text-[10px] tracking-widest text-[var(--tr-brick)] uppercase mb-3">
                  {c.n}
                </p>
                <h3 className="font-display font-black text-xl leading-tight mb-2">
                  {c.t}
                </h3>
                <p className="text-sm text-[var(--tr-text-muted)] leading-relaxed">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── LINEUP ─────────────── */}
      <section className="bg-[var(--tr-cream)]">
        <div className="container-tr py-16 lg:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">Menu hari ini</p>
              <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
                Pilih minumanmu.
              </h2>
              <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-3">
                semua dari kedai kami sendiri ↓
              </p>
            </div>
            <Link href="/shop" className="btn btn-secondary">
              Lihat semua →
            </Link>
          </div>

          {all.length === 0 ? (
            <div className="card-stamp p-10 text-center">
              <p className="font-display-italic text-2xl">Belum ada produk.</p>
              <p className="text-[var(--tr-text-muted)] mt-2 text-sm">
                Tambahkan produk lewat dashboard ERP-mu.
              </p>
            </div>
          ) : (
            <div
              className={
                "grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 " +
                (all.length >= 5
                  ? "lg:grid-cols-5"
                  : all.length === 4
                  ? "lg:grid-cols-4"
                  : "lg:grid-cols-3")
              }
            >
              {all.map((p) => {
                const habis = p.stock <= 0;
                const tipis = p.stock > 0 && p.stock <= 5;
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    className="group relative card-stamp p-4"
                    style={{ background: p.bgHex }}
                  >
                    {habis && (
                      <span className="absolute top-2 right-2 z-10 rounded-sm bg-[var(--tr-ink)] text-[var(--tr-paper)] font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase border border-[var(--tr-ink)]">
                        habis
                      </span>
                    )}
                    {tipis && (
                      <span className="absolute top-2 right-2 z-10 rounded-sm bg-[var(--tr-brick)] text-[var(--tr-paper)] font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase border border-[var(--tr-ink)]">
                        tipis · {p.stock}
                      </span>
                    )}
                    <Bottle
                      svg={p.bottleSvg}
                      name={p.name}
                      sku={p.sku}
                      cat={p.cat}
                      photo={p.photo}
                      accentHex={p.accentHex}
                      bgHex={p.bgHex}
                      liquidHex={p.liquidHex}
                      labelHex={p.labelHex}
                      inkHex={p.inkHex}
                      liquidPct={p.liquidPct}
                      className="aspect-[5/9] flex items-center justify-center"
                    />
                    <p className="font-mono text-[10px] opacity-60 mt-3 lowercase tracking-widest">
                      {p.cat}
                    </p>
                    <p className="font-display font-bold text-base leading-tight mt-1">
                      {p.name}
                    </p>
                    <p className="font-mono text-xs mt-2 font-medium">
                      {formatRp(p.priceCents)}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section className="border-y-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)]">
        <div className="container-tr py-16 lg:py-24 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <div>
            <p className="eyebrow mb-3">Cara kerja</p>
            <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
              Tiga langkah,<br />
              tiga jam sampai pintu.
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                {
                  n: "01",
                  t: "Pilih botolmu",
                  d: "Pilih dari menu kedai — kopi susu, matcha, brown sugar, taro, pandan, atau yang sedang musim.",
                },
                {
                  n: "02",
                  t: "Pesan & bayar",
                  d: "GoPay, OVO, BCA VA, atau bayar di tempat. Aman & instan.",
                },
                {
                  n: "03",
                  t: "Sambut kurirnya",
                  d: "Antar hari yang sama untuk pesanan sebelum jam 14:00. Gratis di atas Rp 150rb.",
                },
              ].map((s) => (
                <li
                  key={s.n}
                  className="flex gap-5 border-t-2 border-[var(--tr-ink)] pt-5"
                >
                  <span className="font-display font-black text-3xl text-[var(--tr-brick)] w-12 shrink-0 leading-none">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-display font-bold text-xl">{s.t}</p>
                    <p className="text-sm text-[var(--tr-text-soft)] mt-1.5 max-w-md leading-relaxed">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card-stamp bg-[var(--tr-paper)] p-7 sm:p-8">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                Hari ini, 14:23
              </p>
              <span className="stamp">Live</span>
            </div>
            <p className="font-display-italic text-xl sm:text-2xl mt-1">
              &ldquo;botol baru saja keluar dari kafe 🛵&rdquo;
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-sm border-2 border-[var(--tr-ink)] p-3 bg-[var(--tr-paper-2)]">
                <p className="text-[var(--tr-text-muted)] font-mono uppercase tracking-widest text-[9px]">
                  Pesanan
                </p>
                <p className="font-display font-bold text-base mt-1">#TR0028</p>
              </div>
              <div className="rounded-sm border-2 border-[var(--tr-ink)] p-3 bg-[var(--tr-paper-2)]">
                <p className="text-[var(--tr-text-muted)] font-mono uppercase tracking-widest text-[9px]">
                  Botol
                </p>
                <p className="font-display font-bold text-base mt-1">3</p>
              </div>
              <div className="rounded-sm border-2 border-[var(--tr-ink)] p-3 bg-[var(--tr-paper-2)]">
                <p className="text-[var(--tr-text-muted)] font-mono uppercase tracking-widest text-[9px]">
                  ETA
                </p>
                <p className="font-display font-bold text-base mt-1">21 mnt</p>
              </div>
            </div>
            <div className="mt-6 h-3 bg-[var(--tr-paper-2)] border-2 border-[var(--tr-ink)] rounded-sm overflow-hidden">
              <div className="h-full bg-[var(--tr-brick)] w-2/3 border-r-2 border-[var(--tr-ink)]" />
            </div>
            <div className="mt-3 flex justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--tr-text-muted)]">
              <span>● disangrai</span>
              <span>● dibotolkan</span>
              <span className="text-[var(--tr-brick-deep)]">
                ● dalam jalan
              </span>
              <span className="opacity-40">○ sampai</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <Testimonials />

      {/* ─────────────── COFFEE PASSPORT ─────────────── */}
      <CoffeePassportTeaser />

      {/* ─────────────── JURNAL ─────────────── */}
      {posts.length > 0 && (
        <section className="bg-[var(--tr-ink)] text-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)]">
          <div className="container-tr py-16 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-3">
                  Jurnal
                </p>
                <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
                  Cerita dari kedai.
                </h2>
              </div>
              <Link
                href="/cerita"
                className="font-mono text-xs uppercase tracking-widest tr-link text-[var(--tr-mustard-soft)]"
              >
                Semua cerita →
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/cerita/${p.slug}`}
                  className="group block rounded-md border-2 border-[var(--tr-paper)] overflow-hidden hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_4px_0_var(--tr-paper)] transition-all"
                >
                  <div
                    className="aspect-[4/3] flex items-end p-5 border-b-2 border-[var(--tr-paper)]"
                    style={{ background: p.cover }}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                      {new Date(p.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <div className="p-5 bg-[var(--tr-ink)]">
                    <p className="font-display font-bold text-xl leading-tight">
                      {p.title}
                    </p>
                    <p className="opacity-70 text-sm mt-2 line-clamp-2">
                      {p.excerpt}
                    </p>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-widest opacity-50">
                      {p.author}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────── FAQ ─────────────── */}
      <FaqAccordion />

      {/* ─────────────── CTA ─────────────── */}
      <section className="bg-[var(--tr-brick)] text-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)]">
        <div className="container-tr py-20 lg:py-28 text-center">
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-4">
            Langganan
          </p>
          <h2 className="font-display font-black text-[clamp(36px,6vw,96px)] leading-[0.94] tracking-tight max-w-3xl mx-auto">
            Botol favoritmu,<br />
            tiap bulan, hangat di pintu.
          </h2>
          <p className="font-hand text-3xl mt-6 text-[var(--tr-mustard-soft)]">
            mulai 89rb/bulan, batalkan kapan saja
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/langganan"
              className="btn bg-[var(--tr-paper)] text-[var(--tr-ink)] border-[var(--tr-ink)]"
            >
              Pilih paket →
            </Link>
            <Link
              href="/shop"
              className="btn bg-transparent text-[var(--tr-paper)] border-[var(--tr-paper)]"
            >
              Coba satu-satu dulu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
