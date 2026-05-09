import { LoyaltyClient } from "@/components/LoyaltyClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poin & Loyalti — Tujuh Rasa",
  description: "Cek poin, tukar diskon, lihat tier, dan kumpulkan stempel.",
};

export default function PoinPage() {
  return (
    <div className="container-tr pt-32 pb-20">
      <p className="eyebrow mb-3">/ poin & loyalti</p>
      <h1 className="h-display text-[clamp(36px,6vw,72px)] leading-[1.02] mb-4">
        Hadiah untuk yang setia.
      </h1>
      <p className="max-w-2xl opacity-80 mb-10">
        Tiap order kasih kamu poin (bisa ditukar diskon), tiap 10 botol kasih
        kamu 1 botol gratis, tiap belanja menaikkan tier kamu di kafe. Semua
        tersinkron langsung dari sistem ERP — tidak ada poin palsu.
      </p>
      <LoyaltyClient />
    </div>
  );
}
