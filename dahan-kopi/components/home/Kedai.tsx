import Link from "next/link";
import { StatusLine } from "@/components/hours/StatusLine";
import { Photo } from "@/components/ui/Photo";
import { address, features, home, site } from "@/data/site";
import { hoursSummary, isOpenEveryDay } from "@/lib/hours";

/** Blok kedai: foto suasana + ajakan datang, gelap seperti poster Dahan. */
export function Kedai() {
  return (
    <section className="bg-espresso text-cream lg:grid lg:grid-cols-2">
      <Photo
        image={home.kedaiImage}
        ratio="aspect-4/3 lg:aspect-auto lg:min-h-[36rem]"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="flex flex-col justify-center px-4 py-14 sm:px-6 lg:px-16 lg:py-20">
        <p className="label text-cream-muted">{home.kedaiLabel}</p>
        <h2 lang="en" className="display-1 mt-3 max-w-lg">
          {site.closingTagline}
        </h2>
        <p className="body-lg mt-5 max-w-md text-cream/85">{home.kedaiText}</p>
        <div className="label mt-8 space-y-1 text-cream/85">
          <StatusLine onDark live={false} />
          <p>
            {isOpenEveryDay() ? "Setiap hari " : ""}
            {hoursSummary()}
          </p>
          <p>{address.short}</p>
        </div>
        <div className="label mt-8 flex flex-wrap gap-6">
          <Link href="/lokasi" className="underline underline-offset-4 hover:no-underline">
            Lokasi & jam buka
          </Link>
          <a
            href={features.menuPdf}
            download="Menu-Dahan-Kopi.pdf"
            className="underline underline-offset-4 hover:no-underline"
          >
            Menu kafe (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
