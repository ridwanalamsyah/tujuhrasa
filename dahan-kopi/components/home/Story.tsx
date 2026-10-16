import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { story } from "@/data/site";

export function Story() {
  return (
    <section className="py-24 sm:py-32">
      <Container className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <div data-reveal>
          <SectionHeading eyebrow={story.eyebrow} title={story.title}>
            <p>{story.text}</p>
          </SectionHeading>
          <Link
            href="/tentang"
            className="group mt-8 inline-flex items-center gap-2 py-2 text-sm font-semibold tracking-wide text-coffee"
          >
            {story.linkLabel}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <div
          data-reveal="150"
          className="group relative aspect-4/5 overflow-hidden rounded-card bg-sand shadow-soft"
        >
          <Image
            src={story.image.src}
            alt={story.image.alt}
            fill
            sizes="(min-width: 1152px) 540px, (min-width: 768px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
          />
        </div>
      </Container>
    </section>
  );
}
