import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { categories } from "@/data/products";
import { address, contact, site } from "@/data/site";
import { hoursSummary, isOpenEveryDay } from "@/lib/hours";
import { whatsappUrl } from "@/lib/links";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-espresso pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16 text-cream lg:pt-20">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <LogoLockup cut="#2b1d16" className="[&_span]:text-[2.25rem]" />
            <p lang="en" className="mt-4 max-w-xs text-cream/80">
              {site.closingTagline}
            </p>
          </div>
          <div className="lg:col-span-2">
            <h2 className="label text-cream-muted">Shop</h2>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href="/shop" className="hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <h2 className="label text-cream-muted">Kedai</h2>
            <p className="mt-3">{address.short}</p>
            <p className="mt-1 text-cream/80">
              {isOpenEveryDay() ? "Setiap hari " : ""}
              {hoursSummary()}
            </p>
            <Link
              href="/lokasi"
              className="mt-2 inline-block underline underline-offset-4 hover:no-underline"
            >
              Lokasi & peta
            </Link>
          </div>
          <div className="lg:col-span-2">
            <h2 className="label text-cream-muted">Ikuti</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href={contact.instagram.url} {...external} className="hover:underline">
                  Instagram
                </a>
              </li>
              <li>
                <a href={whatsappUrl("Halo Dahan Kopi")} {...external} className="hover:underline">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="label mt-16 flex flex-col gap-2 border-t border-cream/15 pt-6 text-cream-muted sm:flex-row sm:justify-between">
          <a
            href={contact.instagram.url}
            {...external}
            lang="en"
            className="text-cream hover:underline"
          >
            {site.closingCta}
          </a>
          <p>
            © {year} {site.name} · {address.locality}
          </p>
        </div>
      </Container>
    </footer>
  );
}
