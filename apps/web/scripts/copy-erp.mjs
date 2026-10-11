// scripts/copy-erp.mjs
// Salin ERP statis (apps/erp) ke public/erp supaya ikut ter-deploy di proyek
// Next.js yang sama dan bisa dibuka di /erp. Sumber kebenaran tetap apps/erp;
// public/erp di-.gitignore dan dibuat ulang setiap dev/build.
//
// Next.js membuang "/" di akhir URL (/erp/ -> /erp), sehingga path relatif
// "./..." di index.html akan salah arah. Karena itu path di index.html diubah
// jadi absolut (/erp/...), dan service worker didaftarkan dengan scope /erp.
import { cpSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(webDir, "..", "erp");
const dest = join(webDir, "public", "erp");
const entries = ["index.html", "sw.js", "manifest.webmanifest", "assets", "src"];

if (!existsSync(join(src, "index.html"))) {
  console.error(`[copy-erp] ERP tidak ditemukan di ${src}`);
  process.exit(1);
}
rmSync(dest, { recursive: true, force: true });
for (const e of entries) cpSync(join(src, e), join(dest, e), { recursive: true });

const indexPath = join(dest, "index.html");
const html = readFileSync(indexPath, "utf8")
  .replace(/(href|src)="\.\//g, '$1="/erp/')
  .replace("register('./sw.js')", "register('/erp/sw.js', { scope: '/erp' })");
if (html.includes('="./') || !html.includes("register('/erp/sw.js'")) {
  console.error("[copy-erp] index.html ERP berubah format; perbarui scripts/copy-erp.mjs");
  process.exit(1);
}
writeFileSync(indexPath, html);
console.log(`[copy-erp] ERP disalin ke ${dest}`);
