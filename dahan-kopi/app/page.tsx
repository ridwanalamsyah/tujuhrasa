import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { Liter } from "@/components/home/Liter";
import { Order } from "@/components/home/Order";
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
      <Intro />
      <Liter />
      <Visit />
      <Order />
    </>
  );
}
