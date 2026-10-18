import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { photos } from "@/data/site";

/** Bentuk rumah dari logo Dahan, dipakai sebagai bingkai foto. */
const HOUSE = "polygon(50% 0, 100% 22%, 100% 100%, 0 100%, 0 22%)";

/** Foto asli Dahan dalam bingkai rumah. */
export function Photos() {
  return (
    <Container className="py-20 lg:py-28">
      <ul className="grid gap-6 sm:grid-cols-3 lg:gap-10">
        {photos.map((photo, i) => (
          <li key={photo.src} className={i === 1 ? "sm:mt-16" : undefined}>
            <figure className="group">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-ph-wood"
                style={{ clipPath: HOUSE }}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-soft group-hover:scale-105"
                />
              </div>
              <figcaption className="label mt-3 flex justify-between">
                <span>{photo.caption}</span>
                <span className="text-muted">0{i + 1}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </Container>
  );
}
