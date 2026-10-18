import Image from "next/image";
import Link from "next/link";
import { address, photos, site } from "@/data/site";
import { whatsappUrl } from "@/lib/links";

/** Layar pertama: foto asli Dahan penuh layar, judul serif di tengah dan dua tombol. */
export function Hero() {
  const [interior, , garden] = photos;
  return (
    <section className="relative isolate h-[calc(100svh-var(--header-h))] min-h-[34rem] overflow-hidden bg-espresso text-white">
      <div className="absolute inset-0 -z-20 grid lg:grid-cols-2">
        {[garden, interior].map((photo, i) => (
          <div key={photo.src} className={`relative ${i === 1 ? "hidden lg:block" : ""}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              preload
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "50vw"}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/40" />
      <div className="mx-auto flex h-full max-w-[75rem] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
        <p className="kicker">Dahan Kopi HQ · {address.locality}</p>
        <h1 lang="en" className="display-hero mt-5 max-w-4xl">
          {site.tagline}
        </h1>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="kicker inline-flex min-h-12 items-center rounded-full bg-white px-7 text-espresso transition-opacity hover:opacity-85"
          >
            Reservasi
          </a>
          <Link
            href="/lokasi"
            className="kicker inline-flex min-h-12 items-center rounded-full border border-white px-7 transition-colors hover:bg-white hover:text-espresso"
          >
            Lihat lokasi
          </Link>
        </div>
      </div>
    </section>
  );
}
