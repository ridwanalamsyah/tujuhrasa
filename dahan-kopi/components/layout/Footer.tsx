import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { SmartLink } from "@/components/ui/SmartLink";
import { address, navigation, site } from "@/data/site";
import { dahanLinks } from "@/lib/dahan-links";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-espresso pb-[calc(2rem+env(safe-area-inset-bottom))] pt-16 text-sand lg:pt-20">
      <Container className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href="/" aria-label="Dahan Kopi, halaman utama" className="inline-block">
            <LogoLockup className="h-24" />
          </Link>
          <p lang="en" className="display-3 mt-6 max-w-xs">
            {site.closingTagline}
          </p>
        </div>
        <div className="lg:col-span-3">
          <h2 className="kicker text-sand/60">Dahan Kopi HQ</h2>
          <p className="mt-4">
            {address.street}
            <br />
            {address.locality}, {address.regency}
          </p>
        </div>
        <ul className="kicker grid grid-cols-2 content-start gap-x-6 gap-y-3 sm:col-span-2 lg:col-span-4">
          {[{ label: "Home", href: "/" }, ...navigation].map((item) => (
            <li key={item.href}>
              <SmartLink href={item.href} className="hover:underline hover:underline-offset-4">
                {item.label}
              </SmartLink>
            </li>
          ))}
          {dahanLinks()
            .filter((l) => !l.label.startsWith("Lokasi"))
            .map((link) => (
              <li key={link.label}>
                <SmartLink href={link.href} className="hover:underline hover:underline-offset-4">
                  {link.label}
                </SmartLink>
              </li>
            ))}
        </ul>
      </Container>
      <Container className="mt-16 flex flex-col gap-2 border-t border-sand/15 pt-6 text-small text-sand/60 sm:flex-row sm:justify-between">
        <p lang="en">{site.closingCta}</p>
        <p>
          © {year} {site.name} · {address.locality}
        </p>
      </Container>
    </footer>
  );
}
