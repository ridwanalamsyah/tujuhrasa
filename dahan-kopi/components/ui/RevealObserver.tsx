"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Foto ber-atribut `data-reveal` muncul pelan (opacity saja) saat masuk layar.
 * Yang sudah terlihat saat halaman dibuka tidak disembunyikan (tanpa kedip), tanpa JavaScript
 * semua tetap tampil, dan tidak ada animasi bila pengguna memilih "kurangi gerakan".
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.dataset.revealState = "visible";
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.05 },
    );

    for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
      const state = el.dataset.revealState;
      if (state === "visible") continue;
      if (state !== "hidden") {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.dataset.revealState = "visible";
          continue;
        }
        el.dataset.revealState = "hidden";
      }
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
