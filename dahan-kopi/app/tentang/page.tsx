import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { about, contact } from "@/data/site";
import { reservationHref, telUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import type { Space } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Tentang",
  description:
    "Kenapa namanya Dahan, ruang-ruang di Dahan Kopi (bar, ruang dalam, taman), fasilitas, dan cara reservasi.",
  path: "/tentang",
});

function SpaceCaption({ space }: { space: Space }) {
  return (
    <>
      <h3 className="mt-3 text-[1.0625rem] font-semibold lg:mt-4">{space.title}</h3>
      <p className="mt-1 text-muted">{space.text}</p>
    </>
  );
}

export default function AboutPage() {
  const facts = about.facts.filter((fact) => fact.value.trim());
  const [bar, indoor, garden] = about.spaces;
  const lastParagraph = about.paragraphs.length - 1;

  return (
    <>
      <Container className="pb-6 pt-8 lg:grid lg:grid-cols-12 lg:items-end lg:gap-6 lg:pb-12 lg:pt-16">
        <h1 className="display-1 lg:col-span-6">{about.title}</h1>
        <p className="body-lg mt-3 lg:col-span-5 lg:col-start-8 lg:mt-0">{about.lead}</p>
      </Container>

      <Photo image={about.image} ratio="aspect-4/3 lg:aspect-21/9" sizes="100vw" preload />

      {/* Cerita */}
      <Container className="mt-14 lg:mt-24 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="self-start lg:sticky lg:top-[calc(var(--header-h)+2rem)] lg:col-span-4">
          <h2 className="display-3">{about.storyTitle}</h2>
          {facts.length > 0 && (
            <dl className="mt-8 hidden space-y-4 lg:block">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-micro text-muted">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="body-lg mt-5 max-w-[60ch] space-y-5 lg:col-span-6 lg:col-start-6 lg:mt-0">
          {about.paragraphs.map((paragraph, index) =>
            index === lastParagraph && paragraph.endsWith("halaman Menu.") ? (
              <p key={index}>
                {paragraph.slice(0, -"halaman Menu.".length)}
                <TextLink href="/menu" inline>
                  halaman Menu
                </TextLink>
                .
              </p>
            ) : (
              <p key={index}>{paragraph}</p>
            ),
          )}
        </div>
        {facts.length > 0 && (
          <dl className="mt-8 space-y-4 lg:hidden">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-micro text-muted">{fact.label}</dt>
                <dd className="font-medium">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>

      {/* Ruang: bar → ruang dalam → taman */}
      <section
        id="ruang"
        aria-labelledby="ruang-judul"
        className="mt-16 scroll-mt-(--header-h) lg:mt-32"
      >
        <Container>
          <h2 id="ruang-judul" className="display-3">
            {about.spacesTitle}
          </h2>
        </Container>
        <Container className="mt-6 lg:mt-10 lg:grid lg:grid-cols-12 lg:gap-6">
          {bar && (
            <div className="lg:col-span-7">
              <Photo
                image={bar.image}
                ratio="aspect-3/2"
                sizes="(min-width: 1200px) 640px, (min-width: 1024px) 55vw, 100vw"
              />
              <SpaceCaption space={bar} />
            </div>
          )}
          {indoor && (
            <div className="ml-14 mt-12 lg:col-span-4 lg:col-start-9 lg:ml-0 lg:mt-32">
              <Photo
                image={indoor.image}
                ratio="aspect-4/5"
                sizes="(min-width: 1200px) 360px, (min-width: 1024px) 31vw, 80vw"
              />
              <SpaceCaption space={indoor} />
            </div>
          )}
        </Container>
        {garden && (
          <div className="mt-12 lg:mt-24">
            <Photo image={garden.image} ratio="aspect-4/3 lg:aspect-16/9" sizes="100vw" />
            <Container>
              <div className="max-w-[28rem]">
                <SpaceCaption space={garden} />
              </div>
            </Container>
          </div>
        )}
      </section>

      {/* Fasilitas */}
      <Container className="mt-16 lg:mt-32">
        <section
          aria-labelledby="fasilitas-judul"
          className="border-t border-line pt-8 lg:grid lg:grid-cols-12 lg:gap-6"
        >
          <h2 id="fasilitas-judul" className="display-3 lg:col-span-4">
            {about.facilitiesTitle}
          </h2>
          <div className="mt-4 lg:col-span-7 lg:col-start-6 lg:mt-0">
            <ul className="dot-list body-lg flex flex-wrap">
              {about.facilities.map((facility) => (
                <li key={facility.name}>
                  {facility.name}
                  {facility.detail && (
                    <span className="text-[0.9375rem] text-muted"> ({facility.detail})</span>
                  )}
                </li>
              ))}
            </ul>
            {about.faq.length > 0 && (
              <dl className="mt-8">
                {about.faq.map((item) => (
                  <div key={item.q} className="border-b border-line py-3">
                    <dt className="text-[0.9375rem] font-semibold">{item.q}</dt>
                    <dd className="mt-1 text-[0.9375rem] text-muted">{item.a}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      </Container>

      {/* Kontak — alamat & jam ada di footer tepat di bawahnya */}
      <Container className="mt-14 lg:mt-24">
        <section
          id="kontak"
          aria-labelledby="kontak-judul"
          className="border-t border-line pt-8 lg:grid lg:grid-cols-12 lg:gap-6"
        >
          <h2 id="kontak-judul" className="display-3 lg:col-span-4">
            {about.contactTitle}
          </h2>
          <div className="mt-4 lg:col-span-6 lg:col-start-6 lg:mt-0">
            <p className="body-lg">{about.contactText}</p>
            <Button href={reservationHref()} className="mt-5">
              {about.contactButton}
            </Button>
            <p className="mt-4 text-small text-muted">
              Telepon{" "}
              <TextLink href={telUrl} inline className="tabular-nums text-espresso">
                {contact.phoneDisplay}
              </TextLink>{" "}
              · DM{" "}
              <TextLink href={contact.instagram.url} inline className="text-espresso">
                @{contact.instagram.handle}
              </TextLink>{" "}
              di Instagram.
            </p>
          </div>
        </section>
      </Container>
    </>
  );
}
