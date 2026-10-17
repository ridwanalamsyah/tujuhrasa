import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { siteDescription } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: siteDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1ea",
    theme_color: "#2b1d16",
    lang: "id",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
