import { existsSync } from "node:fs";
import { join } from "node:path";

/**
 * `true` bila foto lokal (di folder `public`) sudah ada, atau src berupa URL.
 * Dicek saat build (hanya di server), jadi foto baru otomatis tampil setelah build berikutnya.
 */
export function imageExists(src: string): boolean {
  if (!src) return false;
  if (/^https?:\/\//.test(src)) return true;
  return existsSync(join(process.cwd(), "public", src));
}
