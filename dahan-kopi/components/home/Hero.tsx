import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { hero, site } from "@/data/site";
import { mapsDirectionsUrl } from "@/lib/links";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-espresso text-cream">
      <Image
        src={hero.image.src}
        alt={hero.image.alt}
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-espresso/55 via-espresso/15 to-espresso/80"
      />
      <Container className="pb-16 pt-36 sm:pb-24">
        <p className="eyebrow animate-rise text-cream/90">{hero.eyebrow}</p>
        <h1 className="heading-display mt-5 max-w-4xl animate-rise text-[3.25rem] [animation-delay:120ms] sm:text-7xl lg:text-[6.5rem]">
          <span className="sr-only">{site.name} — </span>
          {hero.title}
        </h1>
        <div className="mt-10 flex animate-rise flex-wrap gap-3 [animation-delay:240ms]">
          <ButtonLink href="/menu" variant="light">
            {hero.primaryCta}
          </ButtonLink>
          <ButtonLink
            href={mapsDirectionsUrl}
            variant="outline-light"
            icon={<ArrowUpRightIcon className="h-4 w-4" />}
          >
            {hero.secondaryCta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
