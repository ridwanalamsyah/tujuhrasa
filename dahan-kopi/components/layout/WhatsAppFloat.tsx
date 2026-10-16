import { WhatsAppIcon } from "@/components/ui/icons";
import { whatsappUrl } from "@/lib/links";

/** Tombol WhatsApp melayang, hanya tampil di layar kecil. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp Dahan Kopi untuk reservasi"
      className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-leaf text-white shadow-lift transition-transform duration-300 hover:scale-105 active:scale-95 md:hidden"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
