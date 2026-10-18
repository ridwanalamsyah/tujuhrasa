import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { absoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "monthly", priority: 1 },
    { url: absoluteUrl("/shop"), lastModified, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({
      url: absoluteUrl(`/shop/${p.slug}`),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: absoluteUrl("/lokasi"), lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tentang"), lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
