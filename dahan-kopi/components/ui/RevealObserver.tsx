"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fade-in halus saat elemen ber-atribut `data-reveal` masuk layar.
 * Elemen yang sudah terlihat saat halaman dibuka tidak disembunyikan (tanpa kedip),
 * dan tidak ada animasi sama sekali bila pengguna memilih "kurangi gerakan".
 * Jeda per elemen: `data-reveal="150"` (milidetik).
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
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
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
        const delay = Number(el.dataset.reveal);
        if (delay > 0) el.style.setProperty("--reveal-delay", `${delay}ms`);
        el.dataset.revealState = "hidden";
      }
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
