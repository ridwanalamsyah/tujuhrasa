import type { Metadata } from "next";
import { HoursList } from "@/components/hours/HoursList";
import { StatusLine } from "@/components/hours/StatusLine";
import { MapFrame } from "@/components/layout/MapFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { about, address, contact, location } from "@/data/site";
import { mapsDirectionsUrl, reservationHref, telUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Lokasi",
  description: `Alamat, jam buka, peta, dan menu kafe Dahan Kopi di ${address.street}, ${address.locality}, ${address.regency}.`,
  path: "/lokasi",
});

export default function LokasiPage() {
  return (
    <>
      <Container className="pb-12 pt-10 lg:pt-16">
        <p className="label text-muted">Kunjungi</p>
        <h1 className="display-1 mt-2">Lokasi</h1>

        <div className="mt-10 lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <address className="body-lg not-italic">
              {address.street}
              <br />
              {address.locality}, {address.regency}
              <br />
              {address.province} {address.postalCode}
            </address>
            {location.directions && (
              <p className="mt-2 text-small text-muted">{location.directions}</p>
            )}

            <h2 className="label mt-10 text-muted">{location.hoursLabel}</h2>
            <HoursList className="mt-2 max-w-sm" />
            <StatusLine className="label mt-3" />

            <h2 className="label mt-10 text-muted">{location.contactLabel}</h2>
            <p className="mt-1">
              <TextLink href={telUrl} className="tabular-nums">
                {contact.phoneDisplay}
              </TextLink>
              <span className="mx-3 text-muted">·</span>
              <TextLink href={contact.instagram.url}>@{contact.instagram.handle}</TextLink>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={mapsDirectionsUrl}>
                Petunjuk arah <span aria-hidden="true">↗</span>
              </Button>
              <Button href={reservationHref()}>{about.contactButton}</Button>
            </div>
          </div>

          <MapFrame
            fallback={`Peta: ${address.short}`}
            className="mt-10 aspect-4/3 lg:col-span-7 lg:mt-0 lg:aspect-auto lg:min-h-[28rem]"
          />
        </div>
      </Container>
    </>
  );
}
