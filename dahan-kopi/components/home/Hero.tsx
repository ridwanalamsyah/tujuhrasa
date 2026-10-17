import { StatusLine } from "@/components/hours/StatusLine";
import { TodayLine } from "@/components/hours/TodayLine";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { address, hero, site } from "@/data/site";
import { mapsDirectionsUrl } from "@/lib/links";

/**
 * Layar pertama: satu foto besar (tanpa teks di atasnya), lalu tagline, dua aksi,
 * dan "papan pintu": status buka, jam hari ini, alamat.
 */
export function Hero() {
  return (
    <section className="grid h-[calc(100svh-var(--header-h))] min-h-[32.5rem] grid-rows-[minmax(15rem,1fr)_auto]">
      <div className="relative">
        <Photo image={hero.image} ratio="fill" sizes="100vw" preload />
      </div>

      <Container className="pb-6 pt-5 lg:grid lg:grid-cols-12 lg:items-end lg:gap-6 lg:py-7">
        <div className="lg:col-span-8">
          <h1 className="display-hero">
            <span className="sr-only">{site.name}: </span>
            <span lang="en">
              {hero.taglineLines.map((line) => (
                <span key={line} className="lg:block">
                  {line}{" "}
                </span>
              ))}
            </span>
          </h1>
          <div className="mt-3 flex gap-6 lg:mt-5 lg:gap-8">
            <TextLink href="/menu" className="font-semibold">
              {hero.menuLabel}
            </TextLink>
            <TextLink href={mapsDirectionsUrl} maps className="font-semibold">
              {hero.directionsLabel}
            </TextLink>
          </div>
        </div>

        <div className="mt-3 border-t border-line pt-4 text-small leading-[1.6] lg:col-span-4 lg:col-start-9 lg:mt-0 lg:border-0 lg:pt-0 lg:text-[0.9375rem]">
          <StatusLine />
          <TodayLine className="text-muted" />
          <p className="text-muted">{address.short}</p>
        </div>
      </Container>
    </section>
  );
}
