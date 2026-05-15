import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bottle } from "@/components/Bottle";
import { AddToCart } from "@/components/AddToCart";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StickyCta } from "@/components/StickyCta";
import { WhatsappShare } from "@/components/WhatsappShare";
import { WishlistButton } from "@/components/WishlistButton";
import { Reviews } from "@/components/Reviews";
import { formatRp } from "@/lib/cart";
import { getProductForDisplayBySlug, getRelatedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductForDisplayBySlug(params.slug);
  if (!product) notFound();

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    orderBy: { id: "asc" },
  });
  const related = await getRelatedProducts(product.slug, 4);

  const ratingAvg =
    reviews.length === 0
      ? 0
      : reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const habis = product.stock <= 0;
  const tipis = !habis && product.stock <= product.minStk;

  // Section visibility: hanya tampilkan kalau ada konten asli (bukan stub
  // ERP-only).
  const hasNarrative = !!(product.story || product.brewTip);
  const hasOrigin = !!product.origin;
  const hasProcess = !!product.process;
  const hasRoast = !!product.roast;
  const hasNotes = !!product.notes;
  const hasIngredients = !!product.ingredients;
  const hasCaffeine = !!product.caffeine;

  return (
    <div className="pt-10 pb-16">
      <AutoRefresh intervalMs={30000} />
      <div className="container-tr mb-6 text-[11px] font-mono opacity-60 uppercase tracking-widest">
        <Link href="/" className="tr-link">Beranda</Link> /{" "}
        <Link href="/shop" className="tr-link">Menu</Link> / <span>{product.slug}</span>
      </div>

      <div className="container-tr grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12">
        <div
          className="rounded-md p-10 lg:p-16 border-2 border-[var(--tr-ink)] shadow-stamp"
          style={{ background: product.bgHex }}
        >
          <Bottle
            svg={product.bottleSvg}
            name={product.name}
            sku={product.sku}
            cat={product.cat}
            photo={product.photo}
            accentHex={product.accentHex}
            bgHex={product.bgHex}
            liquidHex={product.liquidHex}
            labelHex={product.labelHex}
            inkHex={product.inkHex}
            liquidPct={product.liquidPct}
            className="max-w-sm mx-auto"
          />
        </div>

        <div>
          <p className="eyebrow mb-3">
            {product.rasa ? `Rasa: ${product.rasa}` : product.cat || "Menu"}
          </p>
          <h1 className="font-display font-black text-[clamp(36px,5.5vw,72px)] leading-[0.98] tracking-[-0.02em]">
            {product.name}
          </h1>
          {product.tagline && (
            <p className="font-hand text-2xl text-[var(--tr-brick-deep)] mt-3">
              &ldquo;{product.tagline}&rdquo;
            </p>
          )}

          <div className="mt-5 flex items-baseline gap-3 flex-wrap">
            <p className="font-display font-black text-3xl tabular-nums">
              {formatRp(product.priceCents)}
            </p>
            {product.comparePriceCents && (
              <p className="font-mono text-sm line-through opacity-50">
                {formatRp(product.comparePriceCents)}
              </p>
            )}
            {habis ? (
              <span className="stamp bg-[var(--tr-ink)] text-[var(--tr-paper)]">stok habis</span>
            ) : tipis ? (
              <span
                className="stamp"
                style={{ background: product.accentHex, color: "#f6efde" }}
              >
                tipis · {product.stock}
              </span>
            ) : (
              <span className="stamp bg-[var(--tr-paper)]">
                stok {product.stock} {product.sat}
              </span>
            )}
            {product.source === "erp" && (
              <span className="pill text-[10px]">● live ERP</span>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-[var(--tr-mustard)] tracking-widest text-base">
                {"★".repeat(Math.round(ratingAvg))}
                {"☆".repeat(5 - Math.round(ratingAvg))}
              </span>
              <span className="opacity-60 font-mono text-xs">({reviews.length} ulasan)</span>
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-relaxed text-[var(--tr-text-soft)]">{product.description}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <AddToCart
              productId={product.id}
              accent={product.accentHex}
              stock={product.stock}
            />
            <WhatsappShare
              text={`Coba ${product.name} dari Tujuh Rasa — ${formatRp(product.priceCents)}.`}
            />
            <WishlistButton
              sku={product.sku}
              pname={product.name}
              variant={habis ? "stock" : "general"}
            />
          </div>
          <StickyCta
            productId={product.id}
            name={product.name}
            priceCents={product.priceCents}
            stock={product.stock}
            accent={product.accentHex}
          />

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-0 border-2 border-[var(--tr-ink)] rounded-sm overflow-hidden">
            {[
              { l: "SKU", v: product.sku, mono: true },
              { l: "Kategori", v: product.cat || "—" },
              { l: "Satuan", v: product.sat },
              { l: "Volume", v: `${product.volume}ml` },
            ].map((d, idx) => (
              <div
                key={d.l}
                className={
                  "p-3 " +
                  (idx > 0 ? "border-l-2 border-[var(--tr-ink)] " : "") +
                  "bg-[var(--tr-paper)]"
                }
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                  {d.l}
                </p>
                <p
                  className={
                    (d.mono ? "font-mono text-sm" : "font-display font-bold text-base") +
                    " mt-1 text-[var(--tr-ink)]"
                  }
                >
                  {d.v}
                </p>
              </div>
            ))}
          </div>

          {(hasOrigin || hasProcess || hasRoast) && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-0 border-2 border-[var(--tr-ink)] rounded-sm overflow-hidden">
              {hasOrigin && (
                <div className="p-3 bg-[var(--tr-paper)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">Asal</p>
                  <p className="font-display font-bold text-base mt-1">{product.origin}</p>
                </div>
              )}
              {hasProcess && (
                <div className="p-3 bg-[var(--tr-paper)] border-l-2 border-[var(--tr-ink)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">Proses</p>
                  <p className="font-display font-bold text-base mt-1">{product.process}</p>
                </div>
              )}
              {hasRoast && (
                <div className="p-3 bg-[var(--tr-paper)] border-l-2 border-[var(--tr-ink)]">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--tr-text-muted)]">Sangrai</p>
                  <p className="font-display font-bold text-base mt-1">{product.roast}</p>
                </div>
              )}
            </div>
          )}

          {(hasNotes || hasIngredients || hasCaffeine) && (
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {hasNotes && (
                <div className="card-stamp p-5">
                  <p className="eyebrow mb-3">Catatan rasa</p>
                  <ul className="space-y-1.5">
                    {product.notes.split(";").map((n, i) => (
                      <li key={i} className="font-display font-bold text-base">
                        — {n.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(hasIngredients || hasCaffeine) && (
                <div className="card-stamp p-5">
                  {hasIngredients && (
                    <>
                      <p className="eyebrow mb-2">Bahan</p>
                      <p className="text-sm leading-relaxed">
                        {product.ingredients
                          .split(";")
                          .map((s) => s.trim())
                          .join(" · ")}
                      </p>
                    </>
                  )}
                  {hasCaffeine && (
                    <>
                      <p className="eyebrow mt-3 mb-1">Kafein</p>
                      <p className="font-mono text-sm">{product.caffeine}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {hasNarrative && (
        <div className="container-tr mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-6">
          {product.brewTip && (
            <div className="rounded-md border-2 border-[var(--tr-ink)] shadow-stamp bg-[var(--tr-ink)] text-[var(--tr-paper)] p-8 sm:p-10">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--tr-mustard-soft)] mb-3">Cara seduh</p>
              <h2 className="font-display font-black text-3xl">Saran dari kami.</h2>
              <p className="mt-4 leading-relaxed opacity-90 whitespace-pre-line">
                {product.brewTip}
              </p>
            </div>
          )}
          {product.story && (
            <div className="card-stamp p-8 sm:p-10">
              <p className="eyebrow mb-3">Cerita</p>
              <h2 className="font-display font-black text-3xl">Kenapa ini ada.</h2>
              <p className="mt-4 leading-relaxed text-[var(--tr-text-soft)]">{product.story}</p>
            </div>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <section className="container-tr mt-16">
          <p className="eyebrow mb-3">Ulasan tetangga</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-6">
            Apa kata yang sudah cicipi.
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="card-stamp p-5">
                <p className="text-[var(--tr-mustard)] tracking-widest text-base">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <p className="mt-2 font-display-italic text-lg leading-snug">
                  &ldquo;{r.comment}&rdquo;
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-[var(--tr-text-muted)]">
                  — {r.customer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-tr">
        <Reviews sku={product.sku} pname={product.name} />
      </section>

      {related.length > 0 && (
        <section className="container-tr mt-20">
          <p className="eyebrow mb-3">Coba juga</p>
          <h2 className="font-display font-black text-3xl sm:text-4xl mb-6">
            Tetangga di rak yang sama.
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group card-stamp p-4"
                style={{ background: p.bgHex }}
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
                  className="aspect-[5/8] flex items-center justify-center"
                />
                <p className="font-display font-bold text-base mt-3 leading-tight">{p.name}</p>
                <p className="font-mono text-xs mt-1">{formatRp(p.priceCents)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
