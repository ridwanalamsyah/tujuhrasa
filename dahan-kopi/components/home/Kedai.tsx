import Image from "next/image";
import Link from "next/link";
import { StatusLine } from "@/components/hours/StatusLine";
import { address, features, home, site } from "@/data/site";
import { hoursSummary, isOpenEveryDay } from "@/lib/hours";

/** Blok kedai: foto halaman belakang Dahan penuh layar, seperti poster "The Favorites Place". */
export function Kedai() {
  return (
    <section className="relative isolate overflow-hidden bg-espresso text-cream">
      <Image
        src={home.kedaiPhoto.src}
        alt={home.kedaiPhoto.alt}
        fill
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-espresso via-espresso/50 to-espresso/20"
      />
      <div className="mx-auto flex min-h-[38rem] max-w-[75rem] flex-col justify-end px-4 py-14 sm:px-6 lg:min-h-[44rem] lg:px-10 lg:py-20">
        <p className="label text-cream/80">{home.kedaiLabel}</p>
        <h2 lang="en" className="display-1 mt-3 max-w-3xl">
          {site.closingTagline}
        </h2>
        <p className="body-lg mt-5 max-w-md text-cream/85">{home.kedaiText}</p>
        <div className="mt-10 grid gap-6 border-t border-cream/25 pt-6 sm:grid-cols-3">
          <div className="label space-y-1">
            <StatusLine onDark live={false} />
            <p className="text-cream/80">
              {isOpenEveryDay() ? "Setiap hari " : ""}
              {hoursSummary()}
            </p>
          </div>
          <p className="label text-cream/80">{address.short}</p>
          <div className="label flex flex-wrap gap-6 sm:justify-end">
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
      </div>
    </section>
  );
}
