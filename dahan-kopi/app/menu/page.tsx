import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { features, menuPages, stores } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Menu",
  description: "Menu baru Dahan Kopi HQ: kopi, non-kopi, Liter Series, makanan, dan Ramen Tensai.",
  path: "/menu",
});

export default function MenuPage() {
  return (
    <Container className="pb-24 pt-10 lg:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display-hero">Menu</h1>
        <div className="flex gap-6 text-small">
          <a
            href={features.menuPdf}
            download="Menu-Dahan-Kopi.pdf"
            className="underline underline-offset-4 hover:no-underline"
          >
            Unduh PDF
          </a>
          {stores.gofood && (
            <a
              href={stores.gofood}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:no-underline"
            >
              Pesan di GoFood
            </a>
          )}
        </div>
      </div>
      <ol className="mt-10 grid gap-2 sm:grid-cols-2">
        {menuPages.map((page, i) => (
          <li key={page.src} className="bg-paper">
            <Image
              src={page.src}
              alt={page.alt}
              width={1200}
              height={1500}
              sizes="(min-width: 640px) 50vw, 100vw"
              preload={i < 2}
              className="h-auto w-full"
            />
          </li>
        ))}
      </ol>
    </Container>
  );
}
