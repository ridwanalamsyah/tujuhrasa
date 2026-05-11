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
    <div className="pt-28 pb-16">
      <AutoRefresh intervalMs={30000} />
      <div className="container-tr mb-6 text-xs font-mono opacity-60 lowercase">
        <Link href="/" className="tr-link">beranda</Link> /{" "}
        <Link href="/shop" className="tr-link">menu</Link> / <span>{product.slug}</span>
      </div>

      <div className="container-tr grid lg:grid-cols-[1fr_1fr] gap-12">
        <div
          className="rounded-3xl p-10 lg:p-16"
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
            / {product.rasa ? `rasa: ${product.rasa}` : product.cat || "menu"}
          </p>
          <h1 className="h-display text-[clamp(36px,5vw,64px)] leading-[1.02]">
            {product.name}
          </h1>
          {product.tagline && (
            <p className="font-serif italic text-xl text-ink-soft mt-2">
              &ldquo;{product.tagline}&rdquo;
            </p>
          )}

          <div className="mt-5 flex items-baseline gap-3 flex-wrap">
            <p className="font-mono text-2xl">{formatRp(product.priceCents)}</p>
            {product.comparePriceCents && (
              <p className="font-mono text-sm line-through opacity-50">
                {formatRp(product.comparePriceCents)}
              </p>
            )}
            {habis ? (
              <span className="pill bg-ink text-cream">stok habis</span>
            ) : tipis ? (
              <span
                className="pill"
                style={{ background: product.accentHex, color: "#f6efde" }}
              >
                stok tipis ({product.stock})
              </span>
            ) : (
              <span className="pill border-ink/30">
                stok {product.stock} {product.sat}
              </span>
            )}
            {product.source === "erp" && (
              <span className="pill border-ink/30 font-mono text-[10px]">
                live ERP
              </span>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-orange">
                {"★".repeat(Math.round(ratingAvg))}
                {"☆".repeat(5 - Math.round(ratingAvg))}
              </span>
              <span className="opacity-60">({reviews.length} ulasan)</span>
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-relaxed">{product.description}</p>
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

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="border-t border-ink/20 pt-3">
              <p className="opacity-60 font-mono text-xs">SKU</p>
              <p className="font-mono text-base">{product.sku}</p>
            </div>
            <div className="border-t border-ink/20 pt-3">
              <p className="opacity-60 font-mono text-xs">kategori</p>
              <p className="font-serif italic text-lg">
                {product.cat || "—"}
              </p>
            </div>
            <div className="border-t border-ink/20 pt-3">
              <p className="opacity-60 font-mono text-xs">satuan</p>
              <p className="font-serif italic text-lg">{product.sat}</p>
            </div>
            <div className="border-t border-ink/20 pt-3">
              <p className="opacity-60 font-mono text-xs">volume</p>
              <p className="font-serif italic text-lg">{product.volume}ml</p>
            </div>
          </div>

          {(hasOrigin || hasProcess || hasRoast) && (
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              {hasOrigin && (
                <div className="border-t border-ink/20 pt-3">
                  <p className="opacity-60 font-mono text-xs">asal</p>
                  <p className="font-serif italic text-lg">{product.origin}</p>
                </div>
              )}
              {hasProcess && (
                <div className="border-t border-ink/20 pt-3">
                  <p className="opacity-60 font-mono text-xs">proses</p>
                  <p className="font-serif italic text-lg">{product.process}</p>
                </div>
              )}
              {hasRoast && (
                <div className="border-t border-ink/20 pt-3">
                  <p className="opacity-60 font-mono text-xs">sangrai</p>
                  <p className="font-serif italic text-lg">{product.roast}</p>
                </div>
              )}
            </div>
          )}

          {(hasNotes || hasIngredients || hasCaffeine) && (
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {hasNotes && (
                <div className="rounded-2xl border border-ink/20 p-5">
                  <p className="eyebrow mb-2">catatan rasa</p>
                  <ul className="space-y-1">
                    {product.notes.split(";").map((n, i) => (
                      <li key={i} className="font-serif italic text-lg">
                        — {n.trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(hasIngredients || hasCaffeine) && (
                <div className="rounded-2xl border border-ink/20 p-5">
                  {hasIngredients && (
                    <>
                      <p className="eyebrow mb-2">bahan</p>
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
                      <p className="eyebrow mt-3 mb-1">kafein</p>
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
        <div className="container-tr mt-16 grid lg:grid-cols-[1.2fr_1fr] gap-12">
          {product.brewTip && (
            <div className="rounded-3xl bg-ink text-cream p-10">
              <p className="eyebrow text-cream/60 mb-3">/ cara seduh</p>
              <h2 className="h-display text-3xl">Saran dari kami.</h2>
              <p className="mt-4 leading-relaxed opacity-90 whitespace-pre-line">
                {product.brewTip}
              </p>
            </div>
          )}
          {product.story && (
            <div className="rounded-3xl bg-paper border border-ink/20 p-10">
              <p className="eyebrow mb-3">/ cerita</p>
              <h2 className="h-display text-3xl">Kenapa ini ada.</h2>
              <p className="mt-4 leading-relaxed">{product.story}</p>
            </div>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <section className="container-tr mt-16">
          <p className="eyebrow mb-3">/ ulasan</p>
          <h2 className="h-display text-3xl mb-6">Apa kata yang sudah cicipi.</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-ink/20 p-5 bg-paper"
              >
                <p className="text-orange">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </p>
                <p className="mt-2 font-serif italic text-lg leading-snug">
                  &ldquo;{r.comment}&rdquo;
                </p>
                <p className="mt-3 font-mono text-xs opacity-60">— {r.customer}</p>
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
          <p className="eyebrow mb-3">/ coba juga</p>
          <h2 className="h-display text-3xl mb-6">Tetangga di rak yang sama.</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.slug}`}
                className="group rounded-2xl p-5 transition hover:-translate-y-1 border border-transparent hover:border-ink/20"
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
                <p className="font-serif italic text-lg mt-3">{p.name}</p>
                <p className="font-mono text-xs mt-1">{formatRp(p.priceCents)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
