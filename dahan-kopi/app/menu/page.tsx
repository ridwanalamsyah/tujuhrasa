import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ArrowUpRightIcon, DownloadIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { menu, menuPage } from "@/data/menu";
import { features, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Menu",
  description: `Menu kopi, non-kopi, makanan, dan camilan ${site.name} di Banjaran, Kabupaten Bandung.`,
  path: "/menu",
});

export default function MenuPage() {
  return (
    <>
      <PageHeader
        eyebrow={menuPage.eyebrow}
        title={menuPage.title}
        actions={
          <>
            <ButtonLink
              href={features.menuPdf}
              variant="outline"
              download="Buku-Menu-Dahan-Kopi.pdf"
              icon={<DownloadIcon className="h-4 w-4" />}
            >
              {menuPage.pdfLabel}
            </ButtonLink>
            {features.delivery.map((link) => (
              <ButtonLink
                key={link.url}
                href={link.url}
                variant="outline"
                icon={<ArrowUpRightIcon className="h-4 w-4" />}
              >
                Pesan via {link.name}
              </ButtonLink>
            ))}
          </>
        }
      >
        <p>{menuPage.intro}</p>
      </PageHeader>

      <MenuBrowser categories={menu} />

      <Container className="pb-24 sm:pb-32">
        <p className="border-t border-line pt-6 text-sm text-muted">{menuPage.note}</p>
      </Container>
    </>
  );
}
