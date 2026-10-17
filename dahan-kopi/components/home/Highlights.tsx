import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { highlights } from "@/data/site";
import type { Highlight } from "@/lib/types";

const zoom = "transition-transform duration-700 ease-soft motion-safe:group-hover:scale-[1.02]";

/** Foto yang bisa diklik dengan mouse; link teks di bawahnya jalur untuk keyboard & pembaca layar. */
function PhotoLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} aria-hidden="true" tabIndex={-1} className="group block">
      {children}
    </Link>
  );
}

function Caption({
  item,
  id,
  className = "",
}: {
  item: Highlight;
  id: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 id={id} className="display-3">
        {item.title}
      </h2>
      <p className="mt-2">{item.text}</p>
      <TextLink href={item.link.href} className="mt-3">
        {item.link.label}
      </TextLink>
    </div>
  );
}

/** Kopi, Makanan, Ruang: tidak simetris, satu ukuran foto per blok. */
export function Highlights() {
  const [coffee, food, space] = highlights;

  return (
    <div className="mt-20 lg:mt-32">
      <Container className="lg:grid lg:grid-cols-12 lg:gap-6">
        {coffee && (
          <section aria-labelledby="sorot-kopi" className="lg:col-span-5">
            <PhotoLink href={coffee.link.href}>
              <Photo
                image={coffee.image}
                ratio="aspect-4/5"
                sizes="(min-width: 1200px) 452px, (min-width: 1024px) 38vw, 100vw"
                innerClassName={zoom}
              />
            </PhotoLink>
            <Caption item={coffee} id="sorot-kopi" className="mt-5" />
          </section>
        )}
        {food && (
          <section
            aria-labelledby="sorot-makanan"
            className="ml-14 mt-14 lg:col-span-6 lg:col-start-7 lg:ml-0 lg:mt-40"
          >
            <PhotoLink href={food.link.href}>
              <Photo
                image={food.image}
                ratio="aspect-3/2"
                sizes="(min-width: 1200px) 548px, (min-width: 1024px) 46vw, 85vw"
                innerClassName={zoom}
              />
            </PhotoLink>
            <Caption item={food} id="sorot-makanan" className="mt-5" />
          </section>
        )}
      </Container>

      {space && (
        <section aria-labelledby="sorot-ruang" className="mt-14 lg:mt-24">
          <PhotoLink href={space.link.href}>
            <Photo
              image={space.image}
              ratio="aspect-4/3 lg:aspect-21/9"
              sizes="100vw"
              innerClassName={zoom}
            />
          </PhotoLink>
          <Container className="mt-4 lg:mt-5 lg:flex lg:flex-wrap lg:items-baseline lg:gap-x-6">
            <h2 id="sorot-ruang" className="display-3">
              {space.title}
            </h2>
            <p className="mt-2 lg:mt-0">{space.text}</p>
            <TextLink href={space.link.href} className="mt-1 lg:mt-0">
              {space.link.label}
            </TextLink>
          </Container>
        </section>
      )}
    </div>
  );
}
