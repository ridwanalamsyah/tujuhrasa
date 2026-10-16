import { site } from "@/data/site";

/**
 * URL publik website, dipakai untuk metadata, sitemap, dan JSON-LD.
 * Urutan: env NEXT_PUBLIC_SITE_URL → `site.url` di data/site.ts →
 * domain produksi Vercel → localhost.
 */
function resolveSiteUrl(): string {
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    site.url ||
    (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
  return url.replace(/\/$/, "");
}

export const siteUrl = resolveSiteUrl();

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}
