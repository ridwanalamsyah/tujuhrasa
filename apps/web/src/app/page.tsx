import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Bottle } from "@/components/Bottle";
import { formatRp } from "@/lib/cart";
import { getProductsForDisplay } from "@/lib/products";
import { AutoRefresh } from "@/components/AutoRefresh";
import { TrustGrid } from "@/components/TrustGrid";
import { Testimonials } from "@/components/Testimonials";
import { FaqAccordion } from "@/components/FaqAccordion";
import { CoffeePassportTeaser } from "@/components/CoffeePassportTeaser";
import Image from "next/image";
import { HeroTujuhRasa } from "@/components/HeroTujuhRasa";
import { Reveal } from "@/components/Reveal";
import { PLACEHOLDER_POSTS } from "@/lib/journal-placeholders";

export const dynamic = "force-dynamic";

async function safeJournal() {
  try {
    return await prisma.journalPost.findMany({ orderBy: { id: "asc" } });
  } catch {
    return [] as Awaited<ReturnType<typeof prisma.journalPost.findMany>>;
  }
}

export default async function HomePage() {
  const [all, posts] = await Promise.all([
    getProductsForDisplay(),
    safeJournal(),
  ]);
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <HeroTujuhRasa today={today} />

      <AutoRefresh intervalMs={60000} />

      {/* ─────────────── TRUST GRID ─────────────── */}
      <TrustGrid />

      {/* ─────────────── WHY US ─────────────── */}
      <section className="bg-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)]">
        <div className="container-tr py-16 lg:py-24">
          <Reveal>
            <div className="grid lg:grid-cols-2 gap-10 items-end mb-12">
              <div>
                <p className="eyebrow mb-3">Kenapa Tujuh Rasa</p>
                <h2 className="font-display font-black text-[clamp(36px,5vw,72px)] leading-[0.96] tracking-tight">
                  Buatan kampus,<br />
                  <span className="text-[var(--tr-cocoa)]">rasa premium.</span>
                </h2>
              </div>
              <p className="text-base sm:text-lg leading-relaxed max-w-md justify-self-start lg:justify-self-end text-[var(--tr-text-soft)]">
                Dari dapur kecil di Bandung untuk teman segenerasi. Diracik
                segar, halal &amp; thayyib, bahan alami tanpa pengawet —
                jujur takarannya.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-[var(--tr-ink)] rounded-md overflow-hidden bg-[var(--tr-paper-2)]">
            {[
              {
                t: "Diracik segar",
                d: "Pre-order setiap pagi — dari bahan alami, tidak ada stok lama.",
                n: "01",
              },
              {
                t: "Halal & thayyib",
                d: "Proses produksi sesuai prinsip syariah; bahan bersertifikat halal.",
                n: "02",
              },
              {
                t: "PET 250ml steril",
                d: "Botol food-grade PET steril, mudah dibawa ke kelas atau kantor.",
                n: "03",
              },
              {
                t: "Antar Bandung",
                d: "GoSend / GrabExpress sekitar Bandung — kos, kampus, kantor.",
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
          </Reveal>
        </div>
      </section>

      {/* ─────────────── LINEUP ─────────────── */}
      <section className="bg-[var(--tr-cream)]">
        <div className="container-tr py-16 lg:py-24">
          <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="eyebrow mb-3">Menu Tujuh Rasa</p>
              <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
                Pilih botolmu.
              </h2>
              <p className="font-hand text-2xl text-[var(--tr-cocoa)] mt-3">
                mulai 10 ribu rupiah ↓
              </p>
            </div>
            <Link href="/shop" className="btn btn-secondary">
              Lihat semua →
            </Link>
          </div>
          </Reveal>

          {all.length === 0 ? (
            <div className="card-stamp p-10 text-center">
              <p className="font-display-italic text-2xl">Belum ada produk.</p>
              <p className="text-[var(--tr-text-muted)] mt-2 text-sm">
                Tambahkan produk lewat dashboard ERP-mu.
              </p>
            </div>
          ) : (
            <Reveal delay={0.05}>
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
            </Reveal>
          )}
        </div>
      </section>

      {/* ─────────────── HOW IT WORKS ─────────────── */}
      <section className="border-y-2 border-[var(--tr-ink)] bg-[var(--tr-paper-2)]">
        <div className="container-tr py-16 lg:py-24 grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
          <Reveal>
          <div>
            <p className="eyebrow mb-3">Cara pesan</p>
            <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
              Tiga langkah,<br />
              jam-jaman sampai kos.
            </h2>
            <ol className="mt-10 space-y-6">
              {[
                {
                  n: "01",
                  t: "Pilih botolmu",
                  d: "Kopi susu gula aren, matcha, cokelat, taro, susu kurma — atau combo build-a-box.",
                },
                {
                  n: "02",
                  t: "Pesan & bayar",
                  d: "Pakai akun atau guest checkout. GoPay, OVO, BCA VA, atau bayar saat barang sampai.",
                },
                {
                  n: "03",
                  t: "Tunggu kurirnya",
                  d: "Antar GoSend / GrabExpress sekitar Bandung — estimasi 1–3 jam untuk wilayah dekat kampus.",
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
          </Reveal>

          <Reveal delay={0.15}>
          <div
            className="relative h-[460px] lg:h-[520px] rounded-md overflow-hidden border-2 border-[var(--tr-ink)] shadow-[6px_8px_0_var(--tr-ink)] bg-[var(--tr-ink)] text-[var(--tr-paper)]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, rgba(207,216,168,0.18) 0, transparent 38%), radial-gradient(circle at 82% 78%, rgba(216,160,86,0.22) 0, transparent 42%), repeating-linear-gradient(135deg, rgba(233,222,195,0.04) 0 2px, transparent 2px 14px)",
            }}
          >
            {/* corner stamps */}
            <div className="absolute top-4 left-4 bg-[var(--tr-mustard)] text-[var(--tr-ink)] border-2 border-[var(--tr-paper)] rounded-sm px-2.5 py-1 shadow-[2px_3px_0_var(--tr-paper)] rotate-[-3deg]">
              <p className="font-mono text-[10px] uppercase tracking-widest font-bold">
                cara kerja
              </p>
            </div>
            <div className="absolute top-4 right-4 bg-[var(--tr-paper)] text-[var(--tr-ink)] border-2 border-[var(--tr-paper)] rounded-sm px-2.5 py-1 shadow-[2px_3px_0_var(--tr-paper)]">
              <p className="font-mono text-[10px] uppercase tracking-widest">
                est. Mei 2025
              </p>
            </div>

            {/* big typography block */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 lg:px-10">
              <p className="font-hand text-4xl lg:text-5xl text-[var(--tr-matcha-soft)] mb-3 rotate-[-2deg]">
                rasakan rasa kita —
              </p>
              <p className="font-display font-black text-[clamp(34px,5vw,56px)] leading-[0.95] tracking-tight text-[var(--tr-paper)]">
                Dari dapur kecil<br />
                <span className="text-[var(--tr-mustard-soft)]">di pojokan Bandung,</span><br />
                untuk <span className="underline decoration-[var(--tr-brick)] decoration-4 underline-offset-4">kamu.</span>
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest border-2 border-[var(--tr-paper)] px-2.5 py-1 rounded-sm">
                  7 rasa
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest border-2 border-[var(--tr-paper)] px-2.5 py-1 rounded-sm bg-[var(--tr-matcha)] text-[var(--tr-ink)] border-[var(--tr-matcha)]">
                  halal &amp; thayyib
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest border-2 border-[var(--tr-paper)] px-2.5 py-1 rounded-sm">
                  10–13K / botol
                </span>
              </div>
            </div>

            {/* bottom hand-note */}
            <p className="absolute bottom-5 left-8 right-8 font-hand text-2xl text-[var(--tr-mustard-soft)] rotate-[-1deg]">
              ditulis tangan, diseduh segar.
            </p>
          </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── TESTIMONIALS ─────────────── */}
      <Testimonials />

      {/* ─────────────── COFFEE PASSPORT ─────────────── */}
      <CoffeePassportTeaser />

      {/* ─────────────── JURNAL ─────────────── */}
      <section className="bg-[var(--tr-ink)] text-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)]">
        <div className="container-tr py-16 lg:py-24">
          <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-3">
                Jurnal
              </p>
              <h2 className="font-display font-black text-[clamp(32px,4.5vw,64px)] leading-[0.96] tracking-tight">
                Cerita dari kedai.
              </h2>
              <p className="font-hand text-2xl text-[var(--tr-matcha-soft)] mt-3 -rotate-[1deg]">
                catatan-catatan kecil —
              </p>
            </div>
            <Link
              href="/cerita"
              className="font-mono text-xs uppercase tracking-widest tr-link text-[var(--tr-mustard-soft)]"
            >
              Semua cerita →
            </Link>
          </div>
          </Reveal>

          <Reveal delay={0.1}>
          <div className="grid md:grid-cols-3 gap-5">
            {(posts.length > 0
              ? posts.map((p) => ({
                  id: String(p.id),
                  slug: p.slug,
                  title: p.title,
                  excerpt: p.excerpt,
                  author: p.author,
                  cover: p.cover,
                  createdAt: new Date(p.createdAt).toISOString(),
                }))
              : PLACEHOLDER_POSTS.slice(0, 3)
            ).map((p) => {
              const hasImage = /^https?:\/\//.test(p.cover);
              return (
                <Link
                  key={p.id}
                  href={`/cerita/${p.slug}`}
                  className="group block rounded-md border-2 border-[var(--tr-paper)] overflow-hidden hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_4px_0_var(--tr-paper)] transition-all"
                >
                  <div className="relative aspect-[4/3] border-b-2 border-[var(--tr-paper)] overflow-hidden">
                    {hasImage ? (
                      <Image
                        src={p.cover}
                        alt=""
                        fill
                        sizes="(min-width:768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: p.cover }}
                      />
                    )}
                    <p className="absolute left-3 bottom-3 z-10 font-mono text-[10px] uppercase tracking-widest text-[var(--tr-paper)] bg-[var(--tr-ink)]/65 px-2 py-0.5 rounded-sm">
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
              );
            })}
          </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────── FAQ ─────────────── */}
      <FaqAccordion />

      {/* ─────────────── CTA ─────────────── */}
      <section className="bg-[var(--tr-cocoa)] text-[var(--tr-paper)] border-y-2 border-[var(--tr-ink)] relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 w-[420px] h-[420px] rounded-full bg-[var(--tr-matcha)] opacity-30"
        />
        <div className="container-tr py-20 lg:py-28 text-center relative">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--tr-matcha-soft)] mb-4">
              Langganan kampus
            </p>
            <h2 className="font-display font-black text-[clamp(36px,6vw,96px)] leading-[0.94] tracking-tight max-w-3xl mx-auto">
              Botol mingguan,<br />
              sampai meja kostmu.
            </h2>
            <p className="font-hand text-3xl mt-6 text-[var(--tr-matcha-soft)]">
              mulai 49rb/minggu — batalkan kapan saja
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
