import { LoyaltyClient } from "@/components/LoyaltyClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Poin & Loyalti — Tujuh Rasa",
  description: "Cek poin, tukar diskon, lihat tier, dan kumpulkan stempel.",
};

export default function PoinPage() {
  return (
    <>
      <section className="bg-[var(--tr-paper)] border-b-2 border-[var(--tr-ink)]">
        <div className="container-tr py-10 sm:py-14">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="stamp">Poin &amp; loyalti</span>
            <span className="font-hand text-2xl text-[var(--tr-brick-deep)]">
              tujuh stempel, satu botol gratis —
            </span>
          </div>
          <h1 className="font-display font-black text-[clamp(36px,6vw,72px)] leading-[0.98] tracking-[-0.02em] mb-4">
            Hadiah untuk{" "}
            <em className="text-[var(--tr-brick)]">yang setia.</em>
          </h1>
          <p className="max-w-2xl text-[var(--tr-text-soft)] leading-relaxed">
            Tiap order kasih kamu poin (bisa ditukar diskon), tiap 10 botol kasih
            kamu 1 botol gratis, tiap belanja menaikkan tier kamu di kafe. Semua
            tersinkron langsung dari sistem ERP — tidak ada poin palsu.
          </p>
        </div>
      </section>
      <section className="container-tr py-12 sm:py-16">
        <LoyaltyClient />
      </section>
    </>
  );
}
