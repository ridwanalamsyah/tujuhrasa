import { getProductsForDisplay } from "@/lib/products";
import { BuildBoxClient } from "@/components/BuildBoxClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Build Your Box — Tujuh Rasa",
  description:
    "Susun sendiri kotak campuran 6 atau 12 botol. Hemat sampai 12% dari harga retail.",
};

export default async function BuildBoxPage() {
  const products = await getProductsForDisplay();
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Build your box</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              kombinasinya bebas —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Susun kotak{" "}
            <em className="text-[var(--tr-brick)]">kamu sendiri.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Pilih 6 botol (hemat 5%) atau 12 botol (hemat 12%) — kombinasinya bebas.
            Cocok untuk dijadikan hadiah atau stok seminggu di kulkas.
          </p>
        </div>
      </section>
      <section className="container-tr py-12 sm:py-16">
        <BuildBoxClient
          products={products.map((p) => ({
            id: p.id,
            slug: p.slug,
            sku: p.sku,
            name: p.name,
            priceCents: p.priceCents,
            stock: p.stock,
            accentHex: p.accentHex,
            bgHex: p.bgHex,
            cat: p.cat ?? "",
            photo: p.photo ?? "",
          }))}
        />
      </section>
    </>
  );
}
