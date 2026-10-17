import { Container } from "@/components/ui/Container";
import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { contact, gallery } from "@/data/site";

/**
 * Penempatan 6 foto. Layar kecil: 1 besar + 2 kecil, lalu 3 kecil.
 * Layar besar: besar · 2×2 kecil · besar.
 */
const placement = [
  { cls: "col-span-2 row-span-2", fill: true, sizes: "(min-width: 1024px) 33vw, 67vw" },
  {
    cls: "aspect-square lg:col-start-3 lg:row-start-1",
    fill: false,
    sizes: "(min-width: 1024px) 17vw, 33vw",
  },
  {
    cls: "aspect-square lg:col-start-4 lg:row-start-1",
    fill: false,
    sizes: "(min-width: 1024px) 17vw, 33vw",
  },
  {
    cls: "aspect-square lg:col-start-3 lg:row-start-2",
    fill: false,
    sizes: "(min-width: 1024px) 17vw, 33vw",
  },
  {
    cls: "aspect-square lg:col-start-4 lg:row-start-2",
    fill: false,
    sizes: "(min-width: 1024px) 17vw, 33vw",
  },
  {
    cls: "aspect-square lg:col-span-2 lg:row-span-2 lg:col-start-5 lg:row-start-1 lg:aspect-auto",
    fill: true,
    sizes: "(min-width: 1024px) 33vw, 33vw",
  },
];

/** Galeri: mosaik tepi-ke-tepi tanpa judul; fotonya bicara sendiri. */
export function Gallery() {
  return (
    <section aria-labelledby="galeri" className="mt-20 lg:mt-32">
      <h2 id="galeri" className="sr-only">
        Foto dari Dahan Kopi
      </h2>
      <ul className="grid grid-cols-3 gap-0.5 lg:grid-cols-6 lg:gap-1">
        {gallery.images.slice(0, 6).map((image, index) => {
          const spot = placement[index];
          return (
            <li key={image.src} className={`relative ${spot.cls}`}>
              <Photo
                image={image}
                ratio="fill"
                sizes={spot.sizes}
                className={spot.fill ? "absolute! inset-0" : ""}
              />
            </li>
          );
        })}
      </ul>
      <Container className="mt-3">
        <TextLink href={contact.instagram.url} className="text-balance">
          {gallery.instagramLabel}
        </TextLink>
      </Container>
    </section>
  );
}
