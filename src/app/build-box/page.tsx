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
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ build your box</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Susun kotak kamu sendiri.
      </h1>
      <p className="max-w-2xl opacity-80 mb-8">
        Pilih 6 botol (hemat 5%) atau 12 botol (hemat 12%) — kombinasinya bebas.
        Cocok untuk dijadikan hadiah atau stok seminggu di kulkas.
      </p>
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
    </div>
  );
}
