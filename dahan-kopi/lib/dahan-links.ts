import { address, contact, stores } from "@/data/site";
import { mapsPlaceUrl, whatsappUrl } from "@/lib/links";

export type DahanLink = { label: string; detail: string; href: string };

/** Link-link dari Linktree Dahan (tanpa Dahan Backyard Cimahi). Link yang url-nya kosong tidak tampil. */
export function dahanLinks(): DahanLink[] {
  return [
    { label: "Menu", detail: "Menu baru Dahan", href: "/menu" },
    { label: "Lokasi Dahan Kopi HQ", detail: address.short, href: mapsPlaceUrl },
    { label: "GoFood", detail: "Pesan antar", href: stores.gofood },
    { label: "Tokopedia", detail: "dahanindonesia", href: stores.tokopedia },
    { label: "Shopee", detail: "dahanindonesia", href: stores.shopee },
    { label: "WhatsApp Admin HQ", detail: "Reservasi & pertanyaan", href: whatsappUrl("Halo Dahan Kopi") },
    {
      label: "Instagram",
      detail: `@${contact.instagram.handle}`,
      href: contact.instagram.url,
    },
  ].filter((link) => link.href);
}
