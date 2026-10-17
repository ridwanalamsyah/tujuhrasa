import type { Metadata } from "next";
import { Fragment } from "react";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { menu, menuPage } from "@/data/menu";
import { features, site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Menu",
  description: `Menu ${site.name} di Banjaran: ${menu.map((c) => c.name.toLowerCase()).join(", ")}, lengkap dengan harga. Unduh buku menunya dalam PDF.`,
  path: "/menu",
});

export default function MenuPage() {
  return (
    <>
      <Container className="pb-5 pt-8 lg:flex lg:items-end lg:justify-between lg:gap-6 lg:pb-8 lg:pt-12">
        <div>
          <h1 className="display-1">{menuPage.title}</h1>
          <p className="mt-2 text-small text-muted">{menuPage.priceNote}</p>
        </div>
        <div className="mt-4 lg:mt-0 lg:flex lg:flex-col lg:items-end lg:gap-3">
          <Button href={features.menuPdf} download="Buku-Menu-Dahan-Kopi.pdf">
            {menuPage.pdfLabel}
          </Button>
          {features.delivery.length > 0 && (
            <p className="mt-3 text-small lg:mt-0">
              {menuPage.deliveryLabel}{" "}
              {features.delivery.map((link, index) => (
                <Fragment key={link.url}>
                  {index > 0 && " · "}
                  <TextLink href={link.url} inline>
                    {link.name}
                  </TextLink>
                </Fragment>
              ))}
            </p>
          )}
        </div>
      </Container>

      <MenuBrowser categories={menu} />

      <Container>
        <p className="border-t border-line pt-6 text-small text-muted lg:grid lg:grid-cols-12 lg:gap-6">
          <span className="lg:col-span-6 lg:col-start-6">{menuPage.note}</span>
        </p>
      </Container>
    </>
  );
}
