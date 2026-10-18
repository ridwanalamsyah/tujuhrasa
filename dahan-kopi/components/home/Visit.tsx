import Image from "next/image";
import { StatusLine } from "@/components/hours/StatusLine";
import { address, home, openingHours, stores } from "@/data/site";
import { mapsPlaceUrl, whatsappUrl } from "@/lib/links";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

const orderLinks = [
  { name: "GoFood", href: stores.gofood },
  { name: "Tokopedia", href: stores.tokopedia },
  { name: "Shopee", href: stores.shopee },
].filter((l) => l.href);

/** Foto | jam buka, alamat, pesan online | foto (seperti blok kunjungi di Sisterfields). */
export function Visit() {
  const [left, right] = home.visitPhotos;
  return (
    <section className="mx-auto grid max-w-[75rem] items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-14 lg:px-10 lg:py-28">
      <div className="relative hidden aspect-[3/4] overflow-hidden bg-paper lg:block">
        <Image src={left.src} alt={left.alt} fill sizes="22rem" className="object-cover" />
      </div>
      <div className="text-center">
        <h2 className="kicker text-coffee">Jam buka</h2>
        <ul className="display-3 mt-3 text-espresso">
          {openingHours.map((rule) => (
            <li key={rule.label}>
              {rule.label} {rule.open.replace(":", ".")}–{rule.close.replace(":", ".")}
            </li>
          ))}
        </ul>
        <StatusLine live={false} className="mt-2 text-small" />

        <div className="mx-auto my-10 h-px w-24 bg-espresso/20" />

        <h2 className="kicker text-coffee">Lokasi</h2>
        <p className="display-3 mt-3 text-espresso">
          {address.street}, {address.locality}, {address.regency}
        </p>
        <div className="mt-4 flex justify-center gap-6 text-small">
          <a href={mapsPlaceUrl} {...external} className="underline underline-offset-4 hover:no-underline">
            Google Maps
          </a>
          <a href={whatsappUrl()} {...external} className="underline underline-offset-4 hover:no-underline">
            WhatsApp Admin HQ
          </a>
        </div>

        <div className="mx-auto my-10 h-px w-24 bg-espresso/20" />

        <h2 className="kicker text-coffee">Pesan online</h2>
        <ul className="mx-auto mt-4 grid max-w-xs gap-2">
          {orderLinks.map((l) => (
            <li key={l.name}>
              <a
                href={l.href}
                {...external}
                className="kicker flex min-h-12 items-center justify-center rounded-full bg-espresso px-6 text-white transition-opacity hover:opacity-85"
              >
                {l.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative aspect-[3/4] overflow-hidden bg-paper">
        <Image src={right.src} alt={right.alt} fill sizes="(min-width: 1024px) 22rem, 100vw" className="object-cover" />
      </div>
    </section>
  );
}
