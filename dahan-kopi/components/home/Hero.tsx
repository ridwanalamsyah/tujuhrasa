import Image from "next/image";
import Link from "next/link";
import { photos, site } from "@/data/site";

/** Layar pertama: foto asli Dahan penuh layar, judul dan dua tombol di atasnya. */
export function Hero() {
  const [interior, , garden] = photos;
  return (
    <section className="relative isolate h-[calc(100svh-var(--header-h))] min-h-[34rem] overflow-hidden bg-espresso text-white">
      <div className="absolute inset-0 -z-20 grid lg:grid-cols-2">
        <div className="relative">
          <Image
            src={garden.src}
            alt={garden.alt}
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="relative hidden lg:block">
          <Image
            src={interior.src}
            alt={interior.alt}
            fill
            preload
            sizes="50vw"
            className="object-cover"
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/15 to-transparent"
      />
      <div className="mx-auto flex h-full max-w-[75rem] flex-col justify-end px-4 pb-10 sm:px-6 lg:px-10 lg:pb-16">
        <h1 lang="en" className="max-w-3xl text-[2.5rem] font-medium leading-[1.04] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.5rem]">
          {site.tagline}
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center bg-white px-6 font-medium text-espresso transition-opacity hover:opacity-85"
          >
            Pesan Liter Series
          </Link>
          <Link
            href="/lokasi"
            className="inline-flex min-h-12 items-center border border-white px-6 font-medium transition-colors hover:bg-white hover:text-espresso"
          >
            Lokasi & jam buka
          </Link>
        </div>
      </div>
    </section>
  );
}
