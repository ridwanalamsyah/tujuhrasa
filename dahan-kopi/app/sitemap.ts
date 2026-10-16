import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/menu"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/tentang"), lastModified, changeFrequency: "monthly", priority: 0.7 },
  ];
}
