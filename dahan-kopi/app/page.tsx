import type { Metadata } from "next";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { Story } from "@/components/home/Story";
import { site } from "@/data/site";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: { absolute: site.seo.title },
  description: siteDescription,
  path: "/",
});

// Lokasi (alamat, jam lengkap, peta) ada di footer, yang menutup setiap halaman.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Story />
      <Highlights />
      <Gallery />
    </>
  );
}
