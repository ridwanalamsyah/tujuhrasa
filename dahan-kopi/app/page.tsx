import type { Metadata } from "next";
import { Intro } from "@/components/home/Intro";
import { LiterSeries } from "@/components/home/LiterSeries";
import { MenuPreview } from "@/components/home/MenuPreview";
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
      <Intro />
      <MenuPreview />
      <LiterSeries />
      <Visit />
    </>
  );
}
