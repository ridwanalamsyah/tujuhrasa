import { OpeningHoursList } from "@/components/home/LiveHours";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowUpRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { address, contact, location } from "@/data/site";
import { mapsEmbedUrl, mapsPlaceUrl, telUrl } from "@/lib/links";

export function Location() {
  return (
    <section id="lokasi" className="bg-white py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
        <div data-reveal className="flex flex-col">
          <SectionHeading eyebrow={location.eyebrow} title={location.title}>
            <p>{location.text}</p>
          </SectionHeading>

          <address className="mt-8 not-italic leading-relaxed text-espresso">
            {address.street},
            <br />
            {address.locality}, {address.regency}, {address.province} {address.postalCode}
          </address>
          <a
            href={telUrl}
            className="mt-2 w-fit py-1 text-muted hover:text-espresso hover:underline"
          >
            {contact.phoneDisplay}
          </a>

          <OpeningHoursList className="mt-8" />

          <div className="mt-8">
            <ButtonLink href={mapsPlaceUrl} icon={<ArrowUpRightIcon className="h-4 w-4" />}>
              {location.mapsCta}
            </ButtonLink>
          </div>
        </div>

        <div
          data-reveal="150"
          className="relative aspect-4/3 overflow-hidden rounded-card bg-sand shadow-soft lg:aspect-auto lg:min-h-112"
        >
          <iframe
            src={mapsEmbedUrl}
            title="Peta lokasi Dahan Kopi di Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </Container>
    </section>
  );
}
