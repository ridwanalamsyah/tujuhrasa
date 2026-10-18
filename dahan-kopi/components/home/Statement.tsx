import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { home } from "@/data/site";

/** Satu kalimat besar tentang Dahan, seperti pembuka di situs kedai-kedai referensi. */
export function Statement() {
  return (
    <section className="border-y border-espresso bg-cream">
      <Container className="grid gap-8 py-16 lg:grid-cols-12 lg:gap-12 lg:py-24">
        <div className="flex items-start gap-4 lg:col-span-3 lg:flex-col">
          <LogoMark className="h-14 w-auto text-espresso" />
          <p className="label">{home.statementLabel}</p>
        </div>
        <div className="lg:col-span-9">
          <p className="font-display text-[2rem] leading-[1.1] sm:text-[2.75rem] lg:text-[3.5rem]">
            {home.statement}
          </p>
          <Link
            href="/tentang"
            className="label mt-8 inline-block underline underline-offset-4 hover:no-underline"
          >
            Tentang Dahan
          </Link>
        </div>
      </Container>
    </section>
  );
}
