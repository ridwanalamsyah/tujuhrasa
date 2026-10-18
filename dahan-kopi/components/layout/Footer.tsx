import Link from "next/link";
import { LogoLockup } from "@/components/Logo";
import { Container } from "@/components/ui/Container";
import { address, site } from "@/data/site";
import { dahanLinks } from "@/lib/dahan-links";
import { isExternal } from "@/lib/links";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line pb-[calc(2rem+env(safe-area-inset-bottom))] pt-14 lg:pt-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Link href="/" aria-label="Dahan Kopi, halaman utama" className="inline-block">
            <LogoLockup className="h-20" />
          </Link>
          <p lang="en" className="mt-6 max-w-xs text-muted">
            {site.closingTagline}
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 self-end text-small sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {dahanLinks().map((link) => (
            <li key={link.label}>
              {isExternal(link.href) ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Container>
      <Container className="mt-14 flex flex-col gap-2 text-small text-muted sm:flex-row sm:justify-between">
        <p lang="en">{site.closingCta}</p>
        <p>
          © {year} {site.name} · {address.locality}
        </p>
      </Container>
    </footer>
  );
}
