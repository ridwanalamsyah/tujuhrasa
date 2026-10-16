import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { highlights } from "@/data/site";

export function Highlights() {
  return (
    <section className="bg-espresso py-24 text-cream sm:py-32">
      <Container>
        <div data-reveal>
          <SectionHeading tone="dark" eyebrow={highlights.eyebrow} title={highlights.title} />
        </div>
        <ul className="mt-14 grid gap-12 md:grid-cols-3 md:gap-6 lg:gap-8">
          {highlights.items.map((item, index) => (
            <li key={item.title} data-reveal={index * 120}>
              <Link href={item.href ?? "/"} className="group block rounded-card">
                <div className="relative aspect-4/5 overflow-hidden rounded-card bg-coffee">
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="(min-width: 1152px) 350px, (min-width: 768px) 31vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="heading-display mt-6 flex items-center justify-between text-4xl">
                  {item.title}
                  <ArrowRightIcon className="h-5 w-5 text-cream-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cream" />
                </h3>
                <p className="mt-3 leading-relaxed text-cream-muted">{item.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
