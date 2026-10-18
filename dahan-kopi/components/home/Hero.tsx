import Link from "next/link";
import { StatusLine } from "@/components/hours/StatusLine";
import { contact, hero, site } from "@/data/site";

const WORD = ["Dahan", "Kopi"];

/** Layar pertama, mengikuti sampul buku menu Dahan: foto taman Dahan, wordmark tulisan tangan, label mono. */
export function Hero() {
  return (
    <section className="relative isolate h-[calc(100svh-var(--header-h))] min-h-[32rem] overflow-hidden bg-espresso text-cream">
      {/* Foto taman Dahan (resolusi kecil dari Canva), sengaja dibuat lembut. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero.background}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover blur-[6px]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-espresso/55" />

      <div className="mx-auto flex h-full max-w-[75rem] flex-col justify-between px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
        <div className="label flex justify-between gap-4">
          <StatusLine onDark live={false} />
          <span className="hidden sm:inline">@{contact.instagram.handle}</span>
        </div>

        <h1 className="text-center">
          <span className="sr-only">Dahan Kopi</span>
          <span
            aria-hidden="true"
            className="font-hand block text-[5.5rem] leading-[0.9] sm:text-[8.5rem] lg:text-[11rem]"
          >
            {WORD.map((word) => (
              <span key={word} className="inline-block whitespace-nowrap px-[0.12em]">
                {[...word].map((ch, i) => (
                  <span
                    key={i}
                    className="wiggle inline-block"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </span>
          <span
            lang="en"
            className="mx-auto mt-4 block max-w-md text-[1rem] leading-snug text-cream/90 sm:text-[1.125rem]"
          >
            {site.tagline}
          </span>
        </h1>

        <div className="label flex flex-wrap items-end justify-between gap-4">
          <span lang="en">{hero.footnote}</span>
          <span className="flex gap-6">
            <Link href="/shop" className="underline underline-offset-4 hover:no-underline">
              Shop
            </Link>
            <Link href="/lokasi" className="underline underline-offset-4 hover:no-underline">
              Lokasi
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
