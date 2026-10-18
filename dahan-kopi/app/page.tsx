import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Kedai } from "@/components/home/Kedai";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { Strip } from "@/components/home/Strip";
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
      <ShopTeaser />
      <Kedai />
      <Strip />
    </>
  );
}
