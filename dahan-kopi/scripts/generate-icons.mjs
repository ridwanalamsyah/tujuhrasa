/**
 * Membuat favicon.ico dan apple-icon.png dari app/icon.svg.
 * Jalankan ulang setelah mengganti app/icon.svg dengan logo asli:
 *
 *   npm run icons
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = await readFile(join(root, "app/icon.svg"));

const png = (size, background) =>
  sharp(svg, { density: 72 * (size / 1600) * 8 })
    .resize(size, size)
    .flatten(background ? { background } : undefined)
    .ensureAlpha()
    .png({ palette: false })
    .toBuffer();

// Apple touch icon: latar penuh (iOS membulatkan sudutnya sendiri).
await writeFile(join(root, "app/apple-icon.png"), await png(180, "#2b1d16"));

// favicon.ico berisi PNG 16, 32, dan 48 px.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => png(size)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((data, i) => {
  const entry = Buffer.alloc(16);
  entry.writeUInt8(sizes[i], 0);
  entry.writeUInt8(sizes[i], 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});
await writeFile(join(root, "app/favicon.ico"), Buffer.concat([header, ...entries, ...images]));

console.log("Selesai: app/favicon.ico dan app/apple-icon.png diperbarui.");
