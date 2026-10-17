import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { JsonLd } from "@/components/JsonLd";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { site } from "@/data/site";
import { cafeJsonLd, siteDescription } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Judul: serif condensed tinggi (uppercase). Teks isi: sans-serif bersih.
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: site.seo.title,
    template: `%s — ${site.name}`,
  },
  description: siteDescription,
  keywords: site.seo.keywords,
  applicationName: site.name,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: site.name,
    title: site.seo.title,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: siteDescription,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2b1d16",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a
          href="#konten"
          className="fixed left-4 top-2 z-[60] -translate-y-20 bg-espresso px-4 py-3 text-[0.875rem] font-semibold text-cream focus:translate-y-0"
        >
          Langsung ke isi
        </a>
        <Navbar />
        <main id="konten" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <RevealObserver />
        <JsonLd data={cafeJsonLd()} />
      </body>
    </html>
  );
}
