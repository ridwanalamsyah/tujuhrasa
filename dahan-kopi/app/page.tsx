import type { Metadata } from "next";
import { BottlePicker } from "@/components/home/BottlePicker";
import { Hero } from "@/components/home/Hero";
import { Kedai } from "@/components/home/Kedai";
import { Marquee } from "@/components/home/Marquee";
import { Posters } from "@/components/home/Posters";
import { ShopTeaser } from "@/components/home/ShopTeaser";
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
      <Marquee />
      <ShopTeaser />
      <BottlePicker />
      <Kedai />
      <Posters />
    </>
  );
}
