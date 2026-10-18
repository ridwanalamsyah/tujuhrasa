import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { address, home } from "@/data/site";

/** Paragraf pembuka, di tengah. */
export function Intro() {
  return (
    <Container className="py-20 text-center lg:py-28">
      <p className="text-small text-muted">
        Dahan Kopi HQ · {address.locality}, {address.regency}
      </p>
      <p className="mx-auto mt-6 max-w-3xl text-[1.375rem] leading-[1.4] tracking-[-0.01em] sm:text-[1.75rem]">
        {home.intro}
      </p>
      <Link
        href="/tentang"
        className="mt-8 inline-block text-small underline underline-offset-4 hover:no-underline"
      >
        Tentang Dahan
      </Link>
    </Container>
  );
}
