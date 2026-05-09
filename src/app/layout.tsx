import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaRegister";
import { getCart, cartTotals } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Tujuh Rasa — Kopi Botolan Nusantara",
  description:
    "Tujuh Rasa adalah kopi botolan nusantara — tujuh karakter rasa, tujuh cerita. Diseduh, dibotolkan, diantar segar.",
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
};

export const viewport: Viewport = {
  themeColor: "#5b1a14",
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
        <div className="min-h-screen flex flex-col">
          <Nav cartCount={totals.itemCount} />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <PwaRegister />
        </div>
      </body>
    </html>
  );
}
