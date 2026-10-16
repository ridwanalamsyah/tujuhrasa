import { contact, features, maps } from "@/data/site";

export function whatsappUrl(message: string = contact.whatsappMessage): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** Tujuan tombol "Reservasi": WhatsApp sekarang, halaman reservasi nanti. */
export function reservationHref(): string {
  return features.reservation.mode === "page" ? features.reservation.pagePath : whatsappUrl();
}

export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

export const telUrl = `tel:${contact.phone}`;

export const mapsPlaceUrl =
  maps.placeUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps.query)}`;

export const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(maps.query)}`;

export const mapsEmbedUrl =
  maps.embedUrl ||
  `https://maps.google.com/maps?q=${encodeURIComponent(maps.query)}&z=16&hl=id&output=embed`;
