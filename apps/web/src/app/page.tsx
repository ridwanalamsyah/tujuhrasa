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
import { SquiggleDividerInline } from "@/components/SquiggleDivider";

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
  const marqueeWords =
    all.length > 0
      ? all.map((p) => p.name)
      : ["kopi", "matcha", "wedang", "susu"];

  return (
    <>
      {/* ─────────────── HERO ─────────────── */}
      <section className="relative pt-28 sm:pt-32 pb-16 lg:pb-24 overflow-hidden">
        {/* Decorative squiggles in background */}
        <div aria-hidden className="absolute inset-0 pointer-events-none -z-0">
          <svg
            className="absolute -top-4 -left-10 w-72 sm:w-96 opacity-30 text-[var(--tr-orange)]"
            viewBox="0 0 200 50"
            fill="none"
          >
            <path
              d="M5 40 Q 30 5, 60 30 T 110 30 T 160 30 T 195 30"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <svg
            className="absolute top-20 right-0 w-72 opacity-30 text-[var(--tr-leaf)]"
            viewBox="0 0 200 50"
            fill="none"
          >
            <path
              d="M5 30 Q 30 5, 60 25 T 110 25 T 160 25 T 195 25"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="container-tr relative grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <div className="mb-6">
              <LiveActivityStrip initial={liveStats.recentActivities} />
            </div>
            <p className="eyebrow mb-4">est. 2025 — kafe & kopi botolan</p>
            <h1 className="h-display text-[clamp(48px,8.5vw,128px)] leading-[0.95]">
              Tujuh{" "}
              <span className="relative inline-block">
                rasa
                <svg
                  aria-hidden
                  viewBox="0 0 200 16"
                  preserveAspectRatio="none"
                  className="absolute left-0 -bottom-2 w-full h-4 text-[var(--tr-orange)]"
                  fill="none"
                >
                  <path
                    d="M2 8 Q 20 2, 40 8 T 80 8 T 120 8 T 160 8 T 198 8"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              ,<br />
              <span className="text-[var(--tr-text-soft)]">satu meja.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)]">
              Kopi, matcha, dan wedang dari{" "}
              <span className="tr-highlight">resep kedai kami</span> —
              diseduh pagi ini, diantar sebelum sore. Stok &amp; harga
              live dari sistem kafe, jadi kamu tidak akan pesan yang
              habis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">
                Lihat menu hari ini
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link href="/langganan" className="btn btn-secondary">
                Langganan bulanan
              </Link>
              <span className="hand-caption text-[var(--tr-orange-deep)] mt-2 sm:mt-0 sm:self-end">
                ← coba ini dulu!
              </span>
            </div>
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {[
                { k: "01", v: "Diseduh pagi ini" },
                { k: "02", v: "Diantar hari ini" },
                { k: "03", v: "Stok live dari kafe" },
                { k: "04", v: "Bebas pengawet" },
              ].map((s) => (
                <li
                  key={s.k}
                  className="border-t-2 border-[var(--tr-ink)] pt-3"
                >
                  <p className="font-mono text-xs text-[var(--tr-text-muted)]">
                    {s.k}
                  </p>
                  <p className="text-sm font-medium">{s.v}</p>
                </li>
              ))}
            </ul>
          </div>

          <HeroBottles items={featured} />
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

      {/* ─────────────── MARQUEE ─────────────── */}
      <section className="bg-[var(--tr-ink)] text-[var(--tr-cream)] py-6 overflow-hidden border-y border-[var(--tr-ink)] relative">
        <div className="flex marquee-track gap-12 whitespace-nowrap h-display text-2xl sm:text-3xl">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              {[...marqueeWords, ...marqueeWords].map((w, i) => (
                <span key={i} className="flex items-center gap-12">
                  <span>{w}</span>
                  <span className="text-[var(--tr-orange)]">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <SquiggleDividerInline color="var(--tr-orange)" />

      {/* ─────────────── WHY US ─────────────── */}
      <section className="container-tr py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-end mb-12">
          <div>
            <p className="eyebrow mb-3">/ kenapa kami</p>
            <h2 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.05]">
              Kopi yang sopan,<br />
              <em className="text-[var(--tr-text-soft)]">
                tetangga yang ramah.
              </em>
            </h2>
          </div>
          <p className="text-base leading-relaxed max-w-md justify-self-start lg:justify-self-end text-[var(--tr-text-soft)]">
            Kami percaya kopi yang baik tidak perlu jauh. Dibuat di kafe,
            dibotolkan ke kaca, sampai ke tangan kamu sebelum sore. Tidak
            ada perantara, tidak ada bahan pengawet.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              t: "Diseduh segar",
              d: "Setiap pagi, dari biji yang baru disangrai kemarin sore.",
              icon: "☕",
            },
            {
              t: "Antar hari ini",
              d: "Pesan sebelum jam 14:00 — antar di hari yang sama, gratis di atas Rp 150rb.",
              icon: "🛵",
            },
            {
              t: "Botol bisa ditukar",
              d: "Tukar 5 botol kosong = 1 botol gratis. Kami sterilkan ulang.",
              icon: "🧴",
            },
            {
              t: "Tersinkron dengan kafe",
              d: "Stok, harga, & resep diambil real-time dari sistem kafe.",
              icon: "🔄",
            },
          ].map((c, i) => (
            <div
              key={c.t}
              className="rounded-2xl border-2 border-[var(--tr-ink)] bg-[var(--tr-bg-elev)] p-6 hover:-translate-y-1 transition shadow-[3px_4px_0_var(--tr-ink)] hover:shadow-[5px_6px_0_var(--tr-ink)]"
              style={{
                transform: `rotate(${i % 2 ? "0.4deg" : "-0.4deg"})`,
              }}
            >
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-serif italic text-xl mb-2">{c.t}</h3>
              <p className="text-sm text-[var(--tr-text-muted)] leading-relaxed">
                {c.d}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────── LINEUP ─────────────── */}
      <section className="bg-[var(--tr-paper-2)] py-16 lg:py-24 border-y border-[var(--tr-border)]">
        <div className="container-tr">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">/ menu hari ini</p>
              <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
                Pilih minumanmu.
              </h2>
              <p className="hand-caption text-[var(--tr-orange-deep)] mt-2">
                semua dari kedai kami sendiri ↓
              </p>
            </div>
            <Link href="/shop" className="btn btn-secondary">
              Lihat semua →
            </Link>
          </div>

          {all.length === 0 ? (
            <div className="rounded-2xl border border-[var(--tr-border)] bg-[var(--tr-bg-elev)] p-10 text-center">
              <p className="font-serif italic text-2xl">Belum ada produk.</p>
              <p className="text-[var(--tr-text-muted)] mt-2">
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
              {all.map((p, idx) => {
                const habis = p.stock <= 0;
                const tipis = p.stock > 0 && p.stock <= 5;
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    className="group relative rounded-2xl p-4 transition hover:-translate-y-1 border-2 border-transparent hover:border-[var(--tr-ink)]"
                    style={{
                      background: p.bgHex,
                      transform: `rotate(${idx % 2 ? "0.3deg" : "-0.3deg"})`,
                    }}
                  >
                    {habis && (
                      <span className="absolute top-2 right-2 z-10 rounded-full bg-[var(--tr-ink)] text-[var(--tr-cream)] font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase">
                        habis
                      </span>
                    )}
                    {tipis && (
                      <span className="absolute top-2 right-2 z-10 rounded-full bg-[var(--tr-orange)] text-white font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase">
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
                    <p className="font-mono text-[10px] opacity-60 mt-3 lowercase">
                      {p.cat}
                    </p>
                    <p className="font-serif italic text-lg leading-tight mt-1">
                      {p.name}
                    </p>
                    <p className="font-mono text-xs mt-2">
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
      <section className="container-tr py-16 lg:py-24 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div>
          <p className="eyebrow mb-3">/ cara kerja</p>
          <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
            Tiga langkah,<br />
            tiga jam sampai pintu.
          </h2>
          <ol className="mt-8 space-y-5">
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
                className="flex gap-5 border-t border-[var(--tr-line-strong)] pt-4"
              >
                <span className="font-mono text-xs text-[var(--tr-text-muted)] w-8 shrink-0 mt-1">
                  {s.n}
                </span>
                <div>
                  <p className="font-serif italic text-2xl">{s.t}</p>
                  <p className="text-sm text-[var(--tr-text-soft)] mt-1 max-w-md">
                    {s.d}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div className="rounded-3xl border-2 border-[var(--tr-ink)] bg-[var(--tr-bg-elev)] p-8 shadow-[6px_6px_0_var(--tr-orange)]">
            <p className="font-mono text-xs text-[var(--tr-text-muted)] mb-1">
              Hari ini, 14:23
            </p>
            <p className="font-serif italic text-2xl">
              &ldquo;botol baru saja keluar dari kafe 🛵&rdquo;
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-[var(--tr-border)] p-3">
                <p className="text-[var(--tr-text-muted)] font-mono">
                  Pesanan
                </p>
                <p className="font-serif italic text-lg">#TR0028</p>
              </div>
              <div className="rounded-xl border border-[var(--tr-border)] p-3">
                <p className="text-[var(--tr-text-muted)] font-mono">
                  Botol
                </p>
                <p className="font-serif italic text-lg">3</p>
              </div>
              <div className="rounded-xl border border-[var(--tr-border)] p-3">
                <p className="text-[var(--tr-text-muted)] font-mono">ETA</p>
                <p className="font-serif italic text-lg">21 mnt</p>
              </div>
            </div>
            <div className="mt-6 h-2 bg-[var(--tr-paper-2)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--tr-orange)] w-2/3" />
            </div>
            <div className="mt-3 flex justify-between text-xs font-mono text-[var(--tr-text-muted)]">
              <span>● disangrai</span>
              <span>● dibotolkan</span>
              <span className="text-[var(--tr-orange-deep)]">
                ● dalam perjalanan
              </span>
              <span className="opacity-40">○ sampai</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <Testimonials />

      <SquiggleDividerInline color="var(--tr-leaf)" />

      {/* ─────────────── COFFEE PASSPORT ─────────────── */}
      <CoffeePassportTeaser />

      {/* ─────────────── JURNAL ─────────────── */}
      <section className="bg-[var(--tr-ink)] text-[var(--tr-cream)] py-16 lg:py-24">
        <div className="container-tr">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow text-[var(--tr-cream)]/60 mb-3">
                / jurnal
              </p>
              <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
                Cerita dari kedai.
              </h2>
            </div>
            <Link
              href="/cerita"
              className="font-mono text-xs lowercase tr-link opacity-80"
            >
              semua cerita →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/cerita/${p.slug}`}
                className="group block rounded-2xl border border-[var(--tr-cream)]/15 overflow-hidden hover:border-[var(--tr-cream)]/40 transition hover:-translate-y-1"
              >
                <div
                  className="aspect-[4/3] flex items-end p-6"
                  style={{ background: p.cover }}
                >
                  <p className="font-mono text-xs opacity-80">
                    {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="p-6">
                  <p className="font-serif italic text-2xl leading-tight">
                    {p.title}
                  </p>
                  <p className="opacity-70 text-sm mt-2 line-clamp-2">
                    {p.excerpt}
                  </p>
                  <p className="mt-4 font-mono text-xs opacity-60">
                    {p.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <FaqAccordion />

      {/* ─────────────── CTA ─────────────── */}
      <section className="container-tr py-20 lg:py-28 text-center">
        <p className="eyebrow mb-4">/ langganan</p>
        <h2 className="h-display text-[clamp(36px,6vw,80px)] leading-[1.02] max-w-3xl mx-auto">
          Botol favoritmu, tiap bulan,
          <br />
          <span className="tr-highlight">sampai depan pintu.</span>
        </h2>
        <p className="mt-5 max-w-xl mx-auto text-base text-[var(--tr-text-soft)]">
          Atau coba paket pertama 4 botol — pilih sendiri rasanya. Bisa
          di-pause, bisa dibatalkan kapan saja.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/langganan" className="btn btn-primary">
            Mulai langganan
          </Link>
          <Link href="/shop" className="btn btn-secondary">
            Lihat menu
          </Link>
        </div>
      </section>
    </>
  );
}
