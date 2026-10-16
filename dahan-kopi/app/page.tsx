import type { Metadata } from "next";
import { Gallery } from "@/components/home/Gallery";
import { Hero } from "@/components/home/Hero";
import { Highlights } from "@/components/home/Highlights";
import { InfoStrip } from "@/components/home/InfoStrip";
import { Location } from "@/components/home/Location";
import { Story } from "@/components/home/Story";
import { site } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: { absolute: site.seo.title },
  description: site.seo.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <Hero />
      <InfoStrip />
      <Story />
      <Highlights />
      <Gallery />
      <Location />
    </>
  );
}
