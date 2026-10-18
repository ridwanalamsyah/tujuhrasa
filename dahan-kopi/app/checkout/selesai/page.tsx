import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderResult } from "@/components/shop/OrderResult";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Status pesanan", robots: { index: false } };

export default function OrderDonePage() {
  return (
    <Container className="pb-24 pt-10 lg:pt-16">
      <Suspense>
        <OrderResult />
      </Suspense>
    </Container>
  );
}
