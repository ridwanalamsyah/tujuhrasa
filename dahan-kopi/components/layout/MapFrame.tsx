"use client";

import { useEffect, useRef, useState } from "react";
import { mapsEmbedUrl } from "@/lib/links";

/**
 * Peta Google Maps. Iframe baru dimuat saat peta hampir terlihat (hemat untuk kecepatan halaman);
 * sebelum itu tampil teks alamat sebagai cadangan.
 */
export function MapFrame({ fallback, className = "" }: { fallback: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const iframe = (
    <iframe
      src={mapsEmbedUrl}
      title="Peta lokasi Dahan Kopi di Google Maps"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
      className="absolute inset-0 h-full w-full border-0"
      style={{ filter: "saturate(.55)" }}
    />
  );

  return (
    <div ref={ref} className={`relative border border-cream/15 bg-espresso-2 ${className}`}>
      <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-small text-cream-muted">
        {fallback}
      </p>
      {show && iframe}
      <noscript>{iframe}</noscript>
    </div>
  );
}
