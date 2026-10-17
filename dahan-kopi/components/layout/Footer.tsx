import { HoursList } from "@/components/hours/HoursList";
import { StatusLine } from "@/components/hours/StatusLine";
import { MapFrame } from "@/components/layout/MapFrame";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/icons";
import { TextLink } from "@/components/ui/TextLink";
import { address, contact, location, site } from "@/data/site";
import { mapsPlaceUrl, reservationHref, telUrl } from "@/lib/links";

/**
 * Footer = blok lokasi, tampil di setiap halaman: alamat, jam buka, kontak, dan peta.
 * Satu-satunya tempat alamat lengkap, jam lengkap, dan peta muncul.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      id="lokasi"
      className="mt-20 bg-espresso pb-[calc(2.5rem+env(safe-area-inset-bottom))] pt-14 text-cream lg:mt-32 lg:pb-10 lg:pt-20"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-5">
            <h2 className="display-3">
              <span className="sr-only">{site.name} </span>
              {location.venueTitle}
            </h2>
            <address className="mt-4 not-italic leading-[1.6]">
              {address.street}
              <br />
              {address.locality}, {address.regency}
              <br />
              {address.province} {address.postalCode}
            </address>
            {location.directions && (
              <p className="mt-2 text-small text-cream-muted">{location.directions}</p>
            )}

            <div className="mt-8">
              <h3 className="text-micro text-cream-muted">{location.hoursLabel}</h3>
              <HoursList className="mt-2 max-w-[22rem]" />
              <StatusLine onDark live={false} className="mt-3 text-small" />
            </div>

            <div className="mt-8">
              <h3 className="text-micro text-cream-muted">{location.contactLabel}</h3>
              <ul className="mt-1">
                <li>
                  <TextLink href={telUrl} onDark className="tabular-nums">
                    {contact.phoneDisplay}
                  </TextLink>
                </li>
                <li>
                  <TextLink href={reservationHref()} onDark>
                    {location.whatsappLabel}
                  </TextLink>
                </li>
                <li className="flex items-center gap-2">
                  <InstagramIcon className="h-5 w-5 shrink-0" />
                  <TextLink href={contact.instagram.url} onDark>
                    @{contact.instagram.handle}
                  </TextLink>
                </li>
              </ul>
            </div>

            <Button href={mapsPlaceUrl} tone="espresso" className="mt-8">
              {location.mapsLabel}
              <span aria-hidden="true">↗</span>
            </Button>
          </div>

          <MapFrame
            fallback={`Peta: ${address.short}`}
            className="mt-10 aspect-4/3 lg:col-span-6 lg:col-start-7 lg:mt-0 lg:aspect-auto lg:min-h-[26.25rem]"
          />
        </div>

        <div className="mt-14 border-t border-cream/15 pt-8 lg:mt-20 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <p className="display-3 max-w-[48rem]" lang="en">
            {site.closingTagline}
          </p>
          <TextLink href={contact.instagram.url} onDark className="mt-4 shrink-0 lg:mt-0">
            <span lang="en">{site.closingCta}</span>
          </TextLink>
        </div>

        <div className="mt-10 flex flex-col gap-1 text-micro font-normal text-cream-muted sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>
            {address.locality}, {address.regency}
          </p>
        </div>
      </Container>
    </footer>
  );
}
