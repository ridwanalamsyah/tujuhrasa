import Link from "next/link";
import { getProductsForDisplay, getCategories } from "@/lib/products";
import { Bottle } from "@/components/Bottle";
import { CategoryFilter } from "@/components/CategoryFilter";
import { AutoRefresh } from "@/components/AutoRefresh";
import { formatRp } from "@/lib/cart";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const cat = searchParams.cat;
  const [products, categories] = await Promise.all([
    getProductsForDisplay({ cat }),
    getCategories(),
  ]);
  const sourceLabel = products[0]?.source === "erp" ? "sinkron ERP" : "lokal";
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <AutoRefresh intervalMs={30000} />
      {/* Header band */}
      <section className="border-b-2 border-[var(--tr-ink)] bg-[var(--tr-cream)]">
        <div className="container-tr pt-12 pb-10 lg:pt-16 lg:pb-12">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="stamp">
              <span aria-hidden>●</span> {today}
            </span>
            <span className="pill">{sourceLabel}</span>
          </div>
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-end">
            <div>
              <h1 className="font-display font-black text-[clamp(48px,8vw,120px)] leading-[0.94] tracking-[-0.025em]">
                Menu<br />
                <span className="text-[var(--tr-brick)]">hari ini.</span>
              </h1>
              <p className="font-hand text-3xl text-[var(--tr-brick-deep)] mt-3">
                diracik segar di Bandung ↓
              </p>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-[var(--tr-text-soft)] max-w-md">
              Tujuh varian rasa kekinian, dibuat segar di dapur kampus UIN SGD.
              Halal &amp; thayyib, harga{" "}
              <span className="tr-highlight">10–13 ribu</span>, antar GoSend /
              GrabExpress sekitar Bandung. Klik untuk lihat detail rasa.
            </p>
          </div>
        </div>
      </section>

      <section className="container-tr pt-8 pb-20">
        <div className="mb-8">
          <CategoryFilter categories={categories} current={cat ?? "all"} />
        </div>

        {products.length === 0 ? (
          <div className="card-stamp p-10 text-center">
            <p className="font-display-italic text-2xl">Belum ada produk di sini.</p>
            <p className="text-[var(--tr-text-muted)] mt-2 text-sm">
              Tambah produk lewat dashboard ERP-mu — nanti otomatis muncul.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {products.map((p) => {
              const habis = p.stock <= 0;
              const tipis = !habis && p.stock <= p.minStk;
              return (
                <Link
                  key={p.sku || p.id}
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
                    className="aspect-[5/8] flex items-center justify-center"
                  />
                  <p className="font-mono text-[10px] opacity-60 mt-3 lowercase tracking-widest">
                    {p.cat || p.rasa || "menu"}
                  </p>
                  <p className="font-display font-bold text-base leading-tight mt-1">
                    {p.name}
                  </p>
                  {p.tagline ? (
                    <p className="text-xs text-[var(--tr-text-muted)] mt-1 line-clamp-2">
                      {p.tagline}
                    </p>
                  ) : (
                    <p className="text-xs opacity-50 mt-1 lowercase font-mono">
                      {p.sku}
                    </p>
                  )}
                  <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                    <p className="font-mono text-sm font-medium">
                      {formatRp(p.priceCents)}
                    </p>
                    {p.comparePriceCents && (
                      <p className="font-mono text-xs opacity-50 line-through">
                        {formatRp(p.comparePriceCents)}
                      </p>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-[var(--tr-text-muted)]">
                      stok {p.stock}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-1.5 rounded-sm bg-[var(--tr-ink)]/10 overflow-hidden"
                    aria-label={`stok ${p.stock} ${p.sat}`}
                    title={`Stok ${p.stock} ${p.sat}`}
                  >
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${Math.max(8, Math.min(100, p.liquidPct * 100))}%`,
                        background: p.accentHex,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
