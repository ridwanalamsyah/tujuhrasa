import type { Metadata } from "next";
import { About } from "@/components/home/About";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { Liter } from "@/components/home/Liter";
import { Visit } from "@/components/home/Visit";
import { site } from "@/data/site";
import { pageMetadata, siteDescription } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: { absolute: site.seo.title },
  description: siteDescription,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Liter />
      <Visit />
      <Gallery />
    </>
  );
}
