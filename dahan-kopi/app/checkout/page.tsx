import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <Container className="pb-24 pt-10 lg:pt-16">
      <h1 className="display-1">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm />
      </div>
    </Container>
  );
}
