import Image from "next/image";
import { LinkList } from "@/components/home/LinkList";
import { Container } from "@/components/ui/Container";
import { home, photos, site } from "@/data/site";

/** Layar pertama: tiga foto asli Dahan, satu kalimat, dan link-link Dahan. */
export function Intro() {
  return (
    <section>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {photos.map((photo, i) => (
          <div key={photo.src} className="relative aspect-[3/5] bg-paper sm:aspect-[3/4]">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              preload={i === 0}
              sizes="33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <Container className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="lg:col-span-6">
          <h1 lang="en" className="display-hero max-w-xl">
            {site.tagline}
          </h1>
          <p className="body-lg mt-4 max-w-md text-muted">{home.intro}</p>
        </div>
        <LinkList className="lg:col-span-6" />
      </Container>
    </section>
  );
}
