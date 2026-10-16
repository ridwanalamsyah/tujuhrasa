import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { ArrowUpRightIcon, InstagramIcon } from "@/components/ui/icons";
import { address, contact, navigation, openingHours, site } from "@/data/site";
import { formatRange, isOpenEveryDay } from "@/lib/hours";
import { mapsDirectionsUrl, telUrl, whatsappUrl } from "@/lib/links";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-espresso text-cream">
      <Container className="pb-10 pt-20 sm:pt-28">
        <div className="max-w-4xl">
          <p className="heading-display text-4xl sm:text-6xl lg:text-7xl">{site.closingTagline}</p>
          <a
            href={contact.instagram.url}
            {...external}
            className="group mt-8 inline-flex items-center gap-3 text-lg text-leaf-soft transition-colors hover:text-cream"
          >
            <InstagramIcon className="h-5 w-5" />
            <span className="underline-offset-4 group-hover:underline">{site.closingCta}</span>
          </a>
        </div>

        <div className="mt-16 grid gap-10 border-t border-cream/15 pt-12 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr] lg:gap-16">
          <Link href="/" className="w-fit rounded-full" aria-label="Dahan Kopi — Home">
            <Logo className="h-20 w-20" title="" />
          </Link>

          <div>
            <h2 className="eyebrow mb-4 text-cream-muted">Alamat</h2>
            <address className="text-sm not-italic leading-relaxed text-cream/90">
              {address.street},
              <br />
              {address.locality}, {address.regency},
              <br />
              {address.province} {address.postalCode}
            </address>
            <a
              href={mapsDirectionsUrl}
              {...external}
              className="mt-3 inline-flex items-center gap-1.5 py-1 text-sm font-medium text-leaf-soft hover:text-cream"
            >
              Petunjuk arah <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div>
            <h2 className="eyebrow mb-4 text-cream-muted">Jam buka</h2>
            {isOpenEveryDay() && <p className="mb-2 text-sm text-cream/90">Setiap hari</p>}
            <ul className="space-y-1 text-sm text-cream/90">
              {openingHours.map((rule) => (
                <li key={rule.label} className="flex max-w-60 justify-between gap-4">
                  <span>{rule.label}</span>
                  <span className="tabular-nums">{formatRange(rule)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="eyebrow mb-4 text-cream-muted">Kontak</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={telUrl} className="py-1 text-cream/90 hover:text-cream hover:underline">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={whatsappUrl("Halo Dahan Kopi")}
                  {...external}
                  className="py-1 text-cream/90 hover:text-cream hover:underline"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={contact.instagram.url}
                  {...external}
                  aria-label={`Instagram @${contact.instagram.handle}`}
                  className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream transition-colors hover:bg-cream hover:text-espresso"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-cream/15 pt-6 text-xs text-cream-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Banjaran, Kabupaten Bandung.
          </p>
          <nav aria-label="Navigasi footer">
            <ul className="flex gap-6">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="py-2 hover:text-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
