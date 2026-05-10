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
  const sourceLabel = products[0]?.source === "erp" ? "live dari ERP" : "lokal";

  return (
    <div className="container-tr pt-32 pb-20">
      <AutoRefresh intervalMs={30000} />
      <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-end mb-10">
        <div>
          <p className="eyebrow mb-3">
            / menu kafe <span className="opacity-50">· {sourceLabel}</span>
          </p>
          <h1 className="h-display text-[clamp(40px,6vw,84px)] leading-[1.02]">
            Menu hari ini.
          </h1>
        </div>
        <p className="text-base opacity-80 max-w-md">
          Daftar minuman dari <em>state.products[]</em> ERP-mu — harga, stok,
          dan kategori real-time. Klik salah satu untuk lihat detail & SOP
          barista.
        </p>
      </div>

      <div className="mb-8">
        <CategoryFilter categories={categories} current={cat ?? "all"} />
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-ink/20 p-10 text-center">
          <p className="font-serif italic text-2xl">Belum ada produk di sini.</p>
          <p className="opacity-70 mt-2">
            Tambah produk lewat dashboard ERP-mu — nanti otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p) => {
            const habis = p.stock <= 0;
            const tipis = !habis && p.stock <= p.minStk;
            return (
              <Link
                key={p.sku || p.id}
                href={`/shop/${p.slug}`}
                className="group relative rounded-2xl p-5 transition hover:-translate-y-1 border border-transparent hover:border-ink/20 card-shadow"
                style={{ background: p.bgHex }}
              >
                {habis && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-ink text-cream font-mono text-[10px] px-2.5 py-1 tracking-widest uppercase">
                    habis
                  </span>
                )}
                {tipis && (
                  <span className="absolute top-3 right-3 z-10 rounded-full bg-orange text-cream font-mono text-[10px] px-2.5 py-1 tracking-widest uppercase">
                    tipis
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
                <p className="font-mono text-xs opacity-60 mt-3 lowercase">
                  {p.cat || (p.rasa ? p.rasa : "menu")}
                </p>
                <p className="font-serif italic text-2xl leading-tight mt-1">
                  {p.name}
                </p>
                {p.tagline ? (
                  <p className="text-sm opacity-70 mt-1 line-clamp-2">
                    {p.tagline}
                  </p>
                ) : (
                  <p className="text-sm opacity-50 mt-1 lowercase font-mono">
                    {p.sku}
                  </p>
                )}
                <div className="mt-3 flex items-baseline gap-2">
                  <p className="font-mono text-sm">{formatRp(p.priceCents)}</p>
                  {p.comparePriceCents && (
                    <p className="font-mono text-xs opacity-50 line-through">
                      {formatRp(p.comparePriceCents)}
                    </p>
                  )}
                  <span className="ml-auto font-mono text-[10px] opacity-50">
                    stok {p.stock}
                  </span>
                </div>
                <div
                  className="mt-2 h-1 rounded-full bg-ink/10 overflow-hidden"
                  aria-label={`stok ${p.stock} ${p.sat}`}
                  title={`Stok ${p.stock} ${p.sat} · batch ${p.minStk > 0 ? "berikut " + p.minStk : "menyusul"}`}
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
    </div>
  );
}
