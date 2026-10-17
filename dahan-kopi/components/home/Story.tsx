import { Photo } from "@/components/ui/Photo";
import { TextLink } from "@/components/ui/TextLink";
import { story } from "@/data/site";

/** Cerita singkat: foto menempel ke tepi kiri layar, teks rata bawah di sebelahnya. */
export function Story() {
  return (
    <section aria-labelledby="cerita" className="mt-16 lg:mt-24 lg:flex lg:items-end lg:gap-[6%]">
      <h2 id="cerita" className="sr-only">
        Tentang Dahan Kopi
      </h2>
      <Photo
        image={story.image}
        ratio="aspect-4/3"
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="lg:max-w-[56rem] lg:shrink-0 lg:basis-[58%]"
      />
      <div className="mt-5 px-4 sm:px-6 lg:mt-0 lg:max-w-[26rem] lg:px-0 lg:pr-10">
        <p className="body-lg sm:max-w-[40rem]">{story.text}</p>
        <TextLink href="/tentang" className="mt-2 lg:mt-4">
          {story.linkLabel}
        </TextLink>
      </div>
    </section>
  );
}
