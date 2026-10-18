import { contact, posters } from "@/data/site";

/** Poster-poster Dahan dari Canva, digeser ke samping. */
export function Posters() {
  return (
    <section aria-labelledby="poster-judul" className="py-16 lg:py-24">
      <div className="mx-auto flex max-w-[75rem] items-end justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <div>
          <p className="label text-muted">Dari kedai</p>
          <h2 id="poster-judul" className="font-hand mt-1 text-[3rem] leading-none lg:text-[4rem]">
            @{contact.instagram.handle}
          </h2>
        </div>
        <a
          href={contact.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="label shrink-0 underline underline-offset-4"
        >
          Instagram
        </a>
      </div>
      <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:px-6 lg:px-[max(2.5rem,calc((100vw-75rem)/2+2.5rem))]">
        {posters.map((p) => (
          <li key={p.src} className="w-[16rem] shrink-0 snap-start sm:w-[18rem]">
            <a
              href={contact.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-transform duration-300 ease-soft hover:-translate-y-1 hover:-rotate-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                width={400}
                height={500}
                className="aspect-4/5 w-full object-cover"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
