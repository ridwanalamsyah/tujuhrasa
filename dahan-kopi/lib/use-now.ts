"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 15_000);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", onChange);
  };
}

const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;
const getServerSnapshot = () => null;

/**
 * Waktu sekarang (dibulatkan per menit) di browser; `null` saat render statis di server.
 * Halaman tetap statis (SSG) — status buka/tutup dihitung di browser pengunjung.
 */
export function useNow(): Date | null {
  const timestamp = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return timestamp === null ? null : new Date(timestamp);
}
