"use client";

import { useSyncExternalStore } from "react";
import { lineKey } from "@/lib/order";
import type { CartLine } from "@/lib/types";

/* Keranjang disimpan di browser pembeli (localStorage). */

const STORAGE_KEY = "dahan-cart-v1";
const EMPTY: CartLine[] = [];
let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();
let drawerOpen = false;
const drawerListeners = new Set<() => void>();

function read(): CartLine[] {
  if (lines) return lines;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    lines = [];
  }
  return lines;
}

function write(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* penyimpanan diblokir: keranjang tetap jalan selama halaman terbuka */
  }
  listeners.forEach((l) => l());
}

export const cart = {
  add(line: CartLine) {
    const current = read();
    const key = lineKey(line);
    const existing = current.find((l) => lineKey(l) === key);
    write(
      existing
        ? current.map((l) => (l === existing ? { ...l, qty: Math.min(99, l.qty + line.qty) } : l))
        : [...current, line],
    );
  },
  setQty(key: string, qty: number) {
    write(
      read()
        .map((l) => (lineKey(l) === key ? { ...l, qty: Math.min(99, qty) } : l))
        .filter((l) => l.qty > 0),
    );
  },
  remove(key: string) {
    write(read().filter((l) => lineKey(l) !== key));
  },
  clear() {
    write([]);
  },
  openDrawer() {
    drawerOpen = true;
    drawerListeners.forEach((l) => l());
  },
  closeDrawer() {
    drawerOpen = false;
    drawerListeners.forEach((l) => l());
  },
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      lines = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useCartDrawer(): boolean {
  return useSyncExternalStore(
    (l) => {
      drawerListeners.add(l);
      return () => drawerListeners.delete(l);
    },
    () => drawerOpen,
    () => false,
  );
}
