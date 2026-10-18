import { StatusLine } from "@/components/hours/StatusLine";
import { Container } from "@/components/ui/Container";
import { address, contact, openingHours } from "@/data/site";
import { mapsPlaceUrl, telUrl, whatsappUrl } from "@/lib/links";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Alamat, jam buka, dan kontak Dahan Kopi HQ. */
export function Visit() {
  return (
    <section aria-labelledby="kunjungi-judul" className="border-t border-line">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12 lg:py-20">
        <h2 id="kunjungi-judul" className="display-1 sm:col-span-2 lg:col-span-4">
          Dahan Kopi HQ
        </h2>
        <div className="lg:col-span-3 lg:col-start-5">
          <p className="text-muted">Alamat</p>
          <p className="mt-2">
            {address.street}
            <br />
            {address.locality}, {address.regency} {address.postalCode}
          </p>
          <a
            href={mapsPlaceUrl}
            {...external}
            className="mt-3 inline-block underline underline-offset-4 hover:no-underline"
          >
            Google Maps
          </a>
        </div>
        <div className="lg:col-span-2">
          <p className="text-muted">Jam buka</p>
          <ul className="mt-2 space-y-2">
            {openingHours.map((rule) => (
              <li key={rule.label}>
                {rule.label}
                <br />
                {rule.open.replace(":", ".")}–{rule.close.replace(":", ".")}
              </li>
            ))}
          </ul>
          <StatusLine live={false} className="mt-3 text-small" />
        </div>
        <div className="lg:col-span-3">
          <p className="text-muted">Kontak</p>
          <ul className="mt-2 space-y-1">
            <li>
              <a href={whatsappUrl()} {...external} className="hover:underline">
                WhatsApp Admin HQ
              </a>
            </li>
            <li>
              <a href={telUrl} className="hover:underline">
                Kafe {contact.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={contact.instagram.url} {...external} className="hover:underline">
                @{contact.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
