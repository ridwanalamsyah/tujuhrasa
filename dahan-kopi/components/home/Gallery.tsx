"use client";

import Image from "next/image";
import { useRef } from "react";
import { contact, gallery } from "@/data/site";

/** Pita foto Dahan yang bisa digeser (tombol panah atau geser jari), seperti di situs referensi. */
export function Gallery() {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section aria-labelledby="galeri-judul" className="bg-sand py-20 text-espresso lg:py-28">
      <div className="mx-auto max-w-[75rem] px-4 text-center sm:px-6 lg:px-10">
        <p className="kicker text-coffee">Follow us on Instagram</p>
        <h2 id="galeri-judul" lang="en" className="display-1 mt-4">
          See You at{" "}
          <a
            href={contact.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-[0.15em] hover:no-underline"
          >
            @{contact.instagram.handle}
          </a>
        </h2>
      </div>
      <div className="relative mt-12">
        <ul
          ref={track}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-10"
        >
          {gallery.map((photo) => (
            <li
              key={photo.src}
              className="relative aspect-[4/5] w-[78%] shrink-0 snap-center overflow-hidden bg-paper sm:w-[44%] lg:w-[31%]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 31vw, (min-width: 640px) 44vw, 78vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-8 flex max-w-[75rem] justify-center gap-3 px-4 sm:px-6 lg:px-10">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scroll(dir)}
              aria-label={dir < 0 ? "Foto sebelumnya" : "Foto berikutnya"}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-espresso/30 text-[1.125rem] transition-colors hover:bg-espresso hover:text-sand"
            >
              <span aria-hidden="true">{dir < 0 ? "←" : "→"}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
