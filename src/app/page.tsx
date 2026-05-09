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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [all, posts, liveStats] = await Promise.all([
    getProductsForDisplay(),
    prisma.journalPost.findMany({ orderBy: { id: "asc" } }),
    fetchLiveStats(),
  ]);
  // Featured = ambil 4 produk pertama dari ERP, untuk hero stack.
  const featured = all.slice(0, 4);
  // Marquee = pakai nama-nama produk dari ERP (bukan tema rasa lama).
  const marqueeWords =
    all.length > 0
      ? all.map((p) => p.name)
      : ["kopi", "matcha", "wedang", "susu"];

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 pb-20 lg:pb-28 overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <svg className="absolute -top-10 -left-10 w-72 opacity-50" viewBox="0 0 120 40">
            <path d="M5 32 q5 -18 22 -16 q6 -14 22 -10 q10 -10 24 -2 q12 -4 18 8 q10 0 12 8 q-4 6 -16 6 z"
              fill="none" stroke="#5b1a14" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <svg className="absolute top-24 right-0 w-80 opacity-50" viewBox="0 0 120 40">
            <path d="M5 32 q5 -18 22 -16 q6 -14 22 -10 q10 -10 24 -2 q12 -4 18 8 q10 0 12 8 q-4 6 -16 6 z"
              fill="none" stroke="#5b1a14" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div className="container-tr relative grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="mb-5">
              <LiveActivityStrip initial={liveStats.recentActivities} />
            </div>
            <p className="eyebrow mb-5">est. 2025 — kafe & kopi botolan</p>
            <h1 className="h-display text-[clamp(56px,9vw,140px)] leading-[0.92]">
              Tujuh Rasa,<br />
              <span className="text-ink-soft">satu meja.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed">
              Kopi, matcha, dan wedang dari resep kedai kami — dibuat segar pagi
              ini, diantar hari ini juga. Stok &amp; harga real-time dari sistem
              kafe, jadi kamu nggak akan pesan yang lagi habis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                lihat menu hari ini
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </Link>
              <Link href="/langganan" className="btn-secondary">
                langganan bulanan
              </Link>
            </div>
            <ul className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
              {[
                { k: "01", v: "Diseduh pagi ini" },
                { k: "02", v: "Diantar hari ini" },
                { k: "03", v: "Stok live dari kafe" },
                { k: "04", v: "Bebas pengawet" },
              ].map((s) => (
                <li key={s.k} className="border-t border-ink/30 pt-3">
                  <p className="font-mono text-xs opacity-50">{s.k}</p>
                  <p className="text-sm">{s.v}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* hero bottle stack */}
          <div className="relative h-[420px] sm:h-[500px]">
            {featured.map((p, i) => {
              const rot = i % 2 === 0 ? -6 : 4;
              const animClass = ["float-anim", "float-anim-2", "float-anim-3", "float-anim-4"][i] ?? "";
              return (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className={"absolute transition-transform hover:-translate-y-2 " + animClass}
                  style={
                    {
                      left: `${i * 18}%`,
                      top: `${(i % 2) * 12}%`,
                      width: "44%",
                      zIndex: 4 - i,
                      "--rot": `${rot}deg`,
                      transform: `rotate(${rot}deg)`,
                    } as React.CSSProperties
                  }
                  aria-label={p.name}
                >
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
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 font-mono text-xs opacity-50">
          <span>geser</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14m-6-6 6 6 6-6"/></svg>
        </div>
      </section>

      <AutoRefresh intervalMs={30000} />

      {/* LIVE COUNTERS + KAFE SEDANG SEDUH */}
      <section className="container-tr py-12 grid lg:grid-cols-[1.4fr_1fr] gap-6">
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

      {/* MARQUEE — nama menu dari ERP */}
      <section className="bg-ink text-cream py-5 overflow-hidden border-y border-ink">
        <div className="flex marquee-track gap-12 whitespace-nowrap font-serif italic text-2xl">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-12 shrink-0">
              {[...marqueeWords, ...marqueeWords].map((w, i) => (
                <span key={i} className="flex items-center gap-12">
                  <span>{w}</span>
                  <span className="text-orange">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="container-tr py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-end mb-12">
          <div>
            <p className="eyebrow mb-4">/ kenapa kami</p>
            <h2 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.05]">
              Kopi yang sopan,<br />
              <em className="text-ink-soft">tetangga yang ramah.</em>
            </h2>
          </div>
          <p className="text-base leading-relaxed max-w-md justify-self-end">
            Kami percaya kopi yang baik tidak perlu jauh. Resep kami dibuat di
            kafe, dibotolkan ke kaca, sampai ke tanganmu sebelum sore. Tidak
            ada perantara, tidak ada bahan pengawet.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { t: "Diseduh segar", d: "Setiap pagi, dari biji yang baru disangrai kemarin sore.", icon: "☕" },
            { t: "Antar hari ini", d: "Pesan sebelum jam 14:00 — antar di hari yang sama, gratis di atas Rp 150rb.", icon: "🛵" },
            { t: "Botol bisa ditukar", d: "Tukar 5 botol kosong = 1 botol gratis. Kami sterilkan ulang.", icon: "🧴" },
            { t: "Tersinkron dengan kafe", d: "Stok, harga, & resep diambil real-time dari sistem kafe (ERP).", icon: "🔄" },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-ink/20 bg-paper p-6 card-shadow">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-serif italic text-xl mb-2">{c.t}</h3>
              <p className="text-sm opacity-80 leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LINEUP — produk dari ERP */}
      <section className="bg-cream-2 py-20 border-y border-ink/10">
        <div className="container-tr">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">/ menu hari ini</p>
              <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
                Pilih minumanmu.
              </h2>
            </div>
            <Link href="/shop" className="btn-secondary">
              lihat semua →
            </Link>
          </div>

          {all.length === 0 ? (
            <div className="rounded-2xl border border-ink/20 bg-paper p-10 text-center">
              <p className="font-serif italic text-2xl">Belum ada produk.</p>
              <p className="opacity-70 mt-2">
                Tambahkan produk lewat dashboard ERP-mu.
              </p>
            </div>
          ) : (
            <div
              className={
                "grid gap-3 grid-cols-2 sm:grid-cols-3 " +
                (all.length >= 5
                  ? "lg:grid-cols-5"
                  : all.length === 4
                  ? "lg:grid-cols-4"
                  : "lg:grid-cols-3")
              }
            >
              {all.map((p) => {
                const habis = p.stock <= 0;
                return (
                  <Link
                    key={p.id}
                    href={`/shop/${p.slug}`}
                    className="group relative rounded-2xl p-4 transition hover:-translate-y-1 border border-transparent hover:border-ink/20"
                    style={{ background: p.bgHex }}
                  >
                    {habis && (
                      <span className="absolute top-2 right-2 z-10 rounded-full bg-ink text-cream font-mono text-[9px] px-2 py-0.5 tracking-widest uppercase">
                        habis
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

      {/* HOW IT WORKS */}
      <section className="container-tr py-20 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div>
          <p className="eyebrow mb-3">/ cara kerja</p>
          <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
            Tiga langkah,<br />
            tiga jam sampai pintu.
          </h2>
          <ol className="mt-8 space-y-5">
            {[
              { n: "01", t: "Pilih botolmu", d: "Pilih dari menu kedai — kopi susu, matcha, brown sugar, taro, pandan, atau yang sedang musim." },
              { n: "02", t: "Pesan & bayar", d: "GoPay, OVO, BCA VA, atau bayar di tempat. Aman & instan." },
              { n: "03", t: "Sambut kurirnya", d: "Antar hari yang sama untuk pesanan sebelum jam 14:00. Gratis di atas Rp 150rb." },
            ].map((s) => (
              <li key={s.n} className="flex gap-5 border-t border-ink/30 pt-4">
                <span className="font-mono text-xs opacity-50 w-8 shrink-0 mt-1">{s.n}</span>
                <div>
                  <p className="font-serif italic text-2xl">{s.t}</p>
                  <p className="text-sm opacity-80 mt-1 max-w-md">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-ink/30 bg-paper p-8 card-shadow">
            <p className="font-mono text-xs opacity-60 mb-1">Hari ini, 14:23</p>
            <p className="font-serif italic text-2xl">&ldquo;botol baru saja keluar dari kafe 🛵&rdquo;</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl border border-ink/20 p-3">
                <p className="opacity-60 font-mono">Pesanan</p>
                <p className="font-serif italic text-lg">#TR0028</p>
              </div>
              <div className="rounded-xl border border-ink/20 p-3">
                <p className="opacity-60 font-mono">Botol</p>
                <p className="font-serif italic text-lg">3</p>
              </div>
              <div className="rounded-xl border border-ink/20 p-3">
                <p className="opacity-60 font-mono">ETA</p>
                <p className="font-serif italic text-lg">21 mnt</p>
              </div>
            </div>
            <div className="mt-6 h-2 bg-ink/10 rounded-full overflow-hidden">
              <div className="h-full bg-orange w-2/3" />
            </div>
            <div className="mt-3 flex justify-between text-xs font-mono opacity-60">
              <span>● disangrai</span>
              <span>● dibotolkan</span>
              <span className="text-orange">● dalam perjalanan</span>
              <span className="opacity-40">○ sampai</span>
            </div>
          </div>
        </div>
      </section>

      {/* JURNAL */}
      <section className="bg-ink text-cream py-20">
        <div className="container-tr">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="eyebrow text-cream/60 mb-3">/ jurnal</p>
              <h2 className="h-display text-[clamp(32px,4.5vw,52px)] leading-[1.05]">
                Cerita dari kedai.
              </h2>
            </div>
            <Link href="/cerita" className="font-mono text-xs lowercase tr-link opacity-80">
              semua cerita →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/cerita/${p.slug}`}
                className="group block rounded-2xl border border-cream/15 overflow-hidden hover:border-cream/40 transition"
              >
                <div
                  className="aspect-[4/3] flex items-end p-6"
                  style={{ background: p.cover }}
                >
                  <p className="font-mono text-xs opacity-80">{new Date(p.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <div className="p-6">
                  <p className="font-serif italic text-2xl leading-tight">{p.title}</p>
                  <p className="opacity-70 text-sm mt-2 line-clamp-2">{p.excerpt}</p>
                  <p className="mt-4 font-mono text-xs opacity-60">{p.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-tr py-24 text-center">
        <p className="eyebrow mb-4">/ langganan</p>
        <h2 className="h-display text-[clamp(36px,6vw,80px)] leading-[1.02] max-w-3xl mx-auto">
          Botol favoritmu, tiap bulan,<br />sampai depan pintu.
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-base opacity-80">
          Atau coba paket pertama 4 botol — pilih sendiri rasanya. Bisa di-pause, bisa dibatalkan kapan saja.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/langganan" className="btn-primary">mulai langganan</Link>
          <Link href="/shop" className="btn-secondary">lihat menu</Link>
        </div>
      </section>
    </>
  );
}
