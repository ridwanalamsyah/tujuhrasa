import Image from "next/image";
import Link from "next/link";
import { home, photos } from "@/data/site";

/** Tentang Dahan: foto di kiri, teks di kanan. */
export function About() {
  const cup = photos[1];
  return (
    <section className="mx-auto grid max-w-[75rem] items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-28">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        <Image
          src={cup.src}
          alt={cup.alt}
          fill
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="object-cover"
        />
      </div>
      <div>
        <p lang="en" className="kicker text-coffee">
          Where good coffee takes root.
        </p>
        <h2 className="display-1 mt-4 text-espresso">Tentang Dahan</h2>
        <p className="body-lg mt-6 max-w-md text-espresso/80">{home.intro}</p>
        <Link
          href="/tentang"
          className="kicker mt-10 inline-flex min-h-12 items-center rounded-full bg-espresso px-7 text-white transition-opacity hover:opacity-85"
        >
          Cerita kami
        </Link>
      </div>
    </section>
  );
}
