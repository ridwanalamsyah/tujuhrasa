import Image from "next/image";
import { StatusLine } from "@/components/hours/StatusLine";
import { address, contact, home, openingHours, site } from "@/data/site";
import { mapsPlaceUrl, whatsappUrl } from "@/lib/links";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Foto halaman belakang Dahan penuh layar dengan alamat, jam buka, dan kontak. */
export function Visit() {
  return (
    <section className="relative isolate overflow-hidden bg-espresso text-white">
      <Image
        src={home.visitPhoto.src}
        alt={home.visitPhoto.alt}
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/35" />
      <div className="mx-auto flex min-h-[40rem] max-w-[75rem] flex-col justify-between gap-16 px-4 py-14 sm:px-6 lg:min-h-[46rem] lg:px-10 lg:py-20">
        <h2 lang="en" className="max-w-2xl text-[2rem] font-medium leading-[1.08] tracking-[-0.03em] sm:text-[2.75rem] lg:text-[3.5rem]">
          {site.closingTagline}
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-small text-white/70">Alamat</p>
            <p className="mt-2">
              {address.street}, {address.locality}
            </p>
            <a
              href={mapsPlaceUrl}
              {...external}
              className="mt-2 inline-block text-small underline underline-offset-4 hover:no-underline"
            >
              Google Maps
            </a>
          </div>
          <div>
            <p className="text-small text-white/70">Jam buka</p>
            <ul className="mt-2">
              {openingHours.map((rule) => (
                <li key={rule.label}>
                  {rule.label} {rule.open.replace(":", ".")}–{rule.close.replace(":", ".")}
                </li>
              ))}
            </ul>
            <StatusLine onDark live={false} className="mt-2 text-small" />
          </div>
          <div>
            <p className="text-small text-white/70">Reservasi</p>
            <a
              href={whatsappUrl()}
              {...external}
              className="mt-2 inline-block underline underline-offset-4 hover:no-underline"
            >
              WhatsApp Admin HQ
            </a>
            <a
              href={contact.instagram.url}
              {...external}
              className="mt-1 block text-small hover:underline"
            >
              @{contact.instagram.handle}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
