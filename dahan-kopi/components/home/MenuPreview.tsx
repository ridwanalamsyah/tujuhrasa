import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { features, home, menuPages } from "@/data/site";

/** Cuplikan buku menu baru; semua halaman ada di /menu. */
export function MenuPreview() {
  const pages = home.menuPreview.map((n) => menuPages[n - 1]).filter(Boolean);
  return (
    <section aria-labelledby="menu-judul" className="border-t border-line py-14 lg:py-20">
      <Container className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="menu-judul" className="display-1">
            {home.menuTitle}
          </h2>
          <p className="mt-3 max-w-md text-muted">{home.menuText}</p>
        </div>
        <div className="flex gap-6 text-small">
          <Link href="/menu" className="underline underline-offset-4 hover:no-underline">
            Lihat semua halaman
          </Link>
          <a
            href={features.menuPdf}
            download="Menu-Dahan-Kopi.pdf"
            className="underline underline-offset-4 hover:no-underline"
          >
            Unduh PDF
          </a>
        </div>
      </Container>
      <ul className="mt-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] sm:px-6 lg:px-[max(2.5rem,calc((100vw-75rem)/2+2.5rem))]">
        {pages.map((page) => (
          <li key={page.src} className="w-[15rem] shrink-0 snap-start sm:w-[18rem]">
            <Link href="/menu" className="block bg-paper">
              <Image
                src={page.src}
                alt={page.alt}
                width={1200}
                height={1500}
                sizes="18rem"
                className="h-auto w-full"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
