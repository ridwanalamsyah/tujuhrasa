import type { Metadata } from "next";
import Image from "next/image";
import { OpeningHoursList } from "@/components/home/LiveHours";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowUpRightIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { about, address, contact, site } from "@/data/site";
import { isOpenEveryDay } from "@/lib/hours";
import { mapsDirectionsUrl, telUrl, whatsappUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tentang",
  description: `Cerita, ruang, dan fasilitas ${site.name}: bar kopi, interior kayu, dan taman hijau di Banjaran, Kabupaten Bandung.`,
  path: "/tentang",
});

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow={about.eyebrow} title={about.title}>
        <p>{about.intro}</p>
      </PageHeader>

      <div className="mt-14 sm:mt-20">
        <div className="relative aspect-4/3 w-full bg-sand sm:aspect-21/9">
          <Image
            src={about.image.src}
            alt={about.image.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Cerita */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-10 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <div data-reveal>
            <h2 className="heading-display text-4xl sm:text-5xl md:sticky md:top-[calc(var(--header-h)+2rem)]">
              {about.storyTitle}
            </h2>
          </div>
          <div data-reveal="120" className="space-y-6 text-lg leading-relaxed text-muted">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </section>

      {/* Ruang */}
      <section className="bg-white py-24 sm:py-32">
        <Container>
          <div data-reveal>
            <SectionHeading title={about.spacesTitle} />
          </div>
          <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-6 lg:gap-8">
            {about.spaces.map((space, index) => (
              <li key={space.title} data-reveal={index * 120} className="group">
                <div className="relative aspect-4/5 overflow-hidden rounded-card bg-sand shadow-soft">
                  <Image
                    src={space.image.src}
                    alt={space.image.alt}
                    fill
                    sizes="(min-width: 1152px) 350px, (min-width: 768px) 31vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="heading-display mt-6 text-4xl">{space.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{space.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Fasilitas */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-12 md:grid-cols-[1fr_1.5fr] md:gap-20">
          <div data-reveal>
            <SectionHeading title={about.facilitiesTitle} />
          </div>
          <ul data-reveal="120" className="grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
            {about.facilities.map((facility, index) => (
              <li key={facility.name} className="flex gap-5 border-b border-line py-6">
                <span
                  aria-hidden="true"
                  className="pt-0.5 text-sm font-semibold tabular-nums text-leaf"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold">{facility.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{facility.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Kontak */}
      <section id="kontak" className="bg-white py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal>
            <SectionHeading eyebrow="Kontak" title={about.contactTitle}>
              <p>{about.contactText}</p>
            </SectionHeading>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={whatsappUrl()} icon={<WhatsAppIcon className="h-4 w-4" />}>
                Reservasi via WhatsApp
              </ButtonLink>
              <ButtonLink
                href={mapsDirectionsUrl}
                variant="outline"
                icon={<ArrowUpRightIcon className="h-4 w-4" />}
              >
                Petunjuk arah
              </ButtonLink>
            </div>
          </div>

          <dl data-reveal="120" className="grid gap-8 sm:grid-cols-2">
            <div>
              <dt className="eyebrow mb-3 text-muted">Alamat</dt>
              <dd>
                <address className="not-italic leading-relaxed">
                  {address.street},
                  <br />
                  {address.locality}, {address.regency},
                  <br />
                  {address.province} {address.postalCode}
                </address>
              </dd>
            </div>
            <div>
              <dt className="eyebrow mb-3 text-muted">Telepon & WhatsApp</dt>
              <dd>
                <a href={telUrl} className="py-1 hover:underline">
                  {contact.phoneDisplay}
                </a>
              </dd>
              <dt className="eyebrow mb-3 mt-6 text-muted">Instagram</dt>
              <dd>
                <a
                  href={contact.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 py-1 hover:underline"
                >
                  <InstagramIcon className="h-5 w-5" />@{contact.instagram.handle}
                </a>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="eyebrow mb-3 text-muted">
                Jam buka{isOpenEveryDay() ? " · setiap hari" : ""}
              </dt>
              <dd>
                <OpeningHoursList />
              </dd>
            </div>
          </dl>
        </Container>
      </section>
    </>
  );
}
