"use client";

import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { reservationHref } from "@/lib/links";

/**
 * Tombol WhatsApp melayang (layar kecil saja). Muncul setelah layar pertama, saat menggulir ke atas,
 * dan bersembunyi saat menggulir ke bawah (agar tidak menutupi harga) atau saat footer terlihat.
 */
export function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let goingUp = false;
    let footerInView = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      // Naik sedikit saja sudah muncul; turun baru dihitung setelah lebih dari 8px.
      if (dy < 0 || dy > 8) {
        goingUp = dy < 0;
        lastY = y;
      }
      setVisible(y > window.innerHeight * 0.6 && goingUp && !footerInView);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    const footer = document.getElementById("lokasi");
    const observer = new IntersectionObserver(([entry]) => {
      footerInView = entry.isIntersecting;
      update();
    });
    if (footer) observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <a
      href={reservationHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Reservasi lewat WhatsApp (buka di tab baru)"
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-12 w-12 items-center justify-center bg-espresso text-cream shadow-[0_1px_3px_rgb(43_29_22/0.25)] duration-150 lg:hidden ${
        visible
          ? "visible opacity-100 transition-opacity"
          : "invisible opacity-0 transition-[opacity,visibility]"
      }`}
    >
      <WhatsAppIcon className="h-[1.375rem] w-[1.375rem]" />
    </a>
  );
}
