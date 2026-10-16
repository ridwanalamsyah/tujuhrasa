import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { InstagramIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact, gallery } from "@/data/site";

export function Gallery() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div data-reveal className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} />
          <a
            href={contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-2.5 py-2 text-sm font-semibold tracking-wide text-coffee"
          >
            <InstagramIcon className="h-5 w-5" />
            <span className="underline decoration-line underline-offset-4 transition-colors group-hover:decoration-coffee">
              {gallery.instagramLabel}
            </span>
          </a>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {gallery.images.slice(0, 6).map((image, index) => (
            <li
              key={image.src}
              data-reveal={(index % 3) * 100}
              className="group relative aspect-square overflow-hidden rounded-card bg-sand"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1152px) 360px, (min-width: 768px) 32vw, 50vw"
                className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
