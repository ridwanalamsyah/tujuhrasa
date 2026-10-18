import type { Metadata } from "next";
import { address, contact, hero, site } from "@/data/site";
import { hoursSummary, isOpenEveryDay, toSchemaOpeningHours } from "@/lib/hours";
import { imageExists } from "@/lib/image-exists";
import { mapsPlaceUrl } from "@/lib/links";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

/** Deskripsi untuk Google & pratinjau link, dibuat dari data agar alamat dan jam selalu sama. */
export const siteDescription = `${site.name}, kedai kopi dengan bar, ruang dalam serba kayu, dan taman di ${address.locality}, ${address.regency}. Buka ${isOpenEveryDay() ? "setiap hari " : ""}${hoursSummary()}.`;

/** Data terstruktur schema.org agar Google memahami info kafe. */
export function cafeJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${siteUrl}/#cafe`,
    name: site.name,
    slogan: site.tagline,
    description: siteDescription,
    url: siteUrl,
    image: absoluteUrl(imageExists(hero.image.src) ? hero.image.src : "/opengraph-image"),
    logo: absoluteUrl("/icon.svg"),
    telephone: contact.phone,
    servesCuisine: ["Coffee", "Indonesian"],
    priceRange: "Rp",
    acceptsReservations: true,
    hasMap: mapsPlaceUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: `${address.locality}, ${address.regency}`,
      addressRegion: address.province,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    openingHoursSpecification: toSchemaOpeningHours(),
    sameAs: [contact.instagram.url],
  };
}

type PageMetaInput = {
  /** String biasa memakai template "Judul — Dahan Kopi"; `{ absolute }` untuk judul utuh. */
  title: string | { absolute: string };
  description: string;
  path: string;
};

/** Metadata per halaman: judul, deskripsi, canonical, Open Graph, dan Twitter card. */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  const fullTitle = typeof title === "string" ? `${title} — ${site.name}` : title.absolute;
  // Gambar dari app/opengraph-image.tsx. Ditulis eksplisit karena `openGraph` di halaman
  // menimpa (bukan menggabungkan) `openGraph` milik layout, termasuk gambarnya.
  const image = {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: `${site.name} — ${site.tagline}`,
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: site.name,
      title: fullTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
