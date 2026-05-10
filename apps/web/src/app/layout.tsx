import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";
import { CmdK } from "@/components/CmdK";
import { WhatsappChat } from "@/components/WhatsappChat";
import { getCart, cartTotals } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Tujuh Rasa — Kopi & teh botolan, dari kafe ke pintu rumah",
  description:
    "Diseduh tangan dan dibotolkan segar. Pilih, pesan, sambut kurir. Tujuh karakter rasa nusantara dalam satu meja.",
  metadataBase: new URL("http://localhost:3000"),
  manifest: "/manifest.json",
  applicationName: "Tujuh Rasa",
  appleWebApp: {
    capable: true,
    title: "Tujuh Rasa",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: "/icon-192.svg",
  },
  openGraph: {
    title: "Tujuh Rasa — Kopi & teh botolan",
    description:
      "Diseduh tangan, dibotolkan segar, diantar hari yang sama.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ec",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCart();
  const totals = cartTotals(cart);

  return (
    <html lang="id">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--tr-ink)] focus:text-[var(--tr-cream)] focus:px-3 focus:py-2 focus:rounded-lg"
        >
          Lompat ke isi utama
        </a>
        <div className="min-h-screen flex flex-col relative">
          <Nav cartCount={totals.itemCount} />
          <main id="main" className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <PwaRegister />
          <CmdK />
          <WhatsappChat />
        </div>
      </body>
    </html>
  );
}
