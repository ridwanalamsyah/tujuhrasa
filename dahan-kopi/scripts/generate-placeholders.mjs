/**
 * Membuat gambar placeholder (dan buku menu PDF contoh) untuk Dahan Kopi.
 *
 *   npm run images:placeholder            → hanya membuat file yang BELUM ada
 *   npm run images:placeholder -- --force → menimpa semua placeholder
 *
 * Aman dijalankan setelah foto asli dimasukkan: file yang sudah ada tidak disentuh
 * (kecuali memakai --force).
 */
import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");

const TONES = {
  garden: { from: "#56704b", to: "#1f2b1b", ink: "#f6f1ea" },
  coffee: { from: "#76533b", to: "#2b1d16", ink: "#f6f1ea" },
  warm: { from: "#b48d66", to: "#5a3e2b", ink: "#f6f1ea" },
  wood: { from: "#93714f", to: "#3b2a1f", ink: "#f6f1ea" },
  light: { from: "#efe6da", to: "#cdbba5", ink: "#2b1d16" },
  night: { from: "#45342a", to: "#140e0b", ink: "#f6f1ea" },
};

const IMAGES = [
  { file: "hero-garden.jpg", w: 2400, h: 1600, tone: "garden", labelY: 0.2, labelScale: 0.6 },
  { file: "story-bar.jpg", w: 1200, h: 1500, tone: "coffee" },
  { file: "highlight-coffee.jpg", w: 1200, h: 1500, tone: "coffee" },
  { file: "highlight-food.jpg", w: 1200, h: 1500, tone: "warm" },
  { file: "highlight-space.jpg", w: 1200, h: 1500, tone: "garden" },
  { file: "gallery-01.jpg", w: 1200, h: 1200, tone: "light" },
  { file: "gallery-02.jpg", w: 1200, h: 1200, tone: "coffee" },
  { file: "gallery-03.jpg", w: 1200, h: 1200, tone: "wood" },
  { file: "gallery-04.jpg", w: 1200, h: 1200, tone: "garden" },
  { file: "gallery-05.jpg", w: 1200, h: 1200, tone: "warm" },
  { file: "gallery-06.jpg", w: 1200, h: 1200, tone: "night" },
  { file: "about-hero.jpg", w: 2400, h: 1200, tone: "garden" },
  { file: "space-indoor.jpg", w: 1200, h: 1500, tone: "wood" },
  { file: "space-garden.jpg", w: 1200, h: 1500, tone: "garden" },
  { file: "bar.jpg", w: 1200, h: 1500, tone: "coffee" },
  { file: "menu/kopi-susu-dahan.jpg", w: 600, h: 600, tone: "light" },
  { file: "menu/nasi-goreng-dahan.jpg", w: 600, h: 600, tone: "warm" },
];

/** Generator acak dengan seed, supaya hasil selalu sama untuk nama file yang sama. */
function random(seedText) {
  let seed = [...seedText].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function bezier(p0, p1, p2, p3, t) {
  const u = 1 - t;
  const a = u * u * u,
    b = 3 * u * u * t,
    c = 3 * u * t * t,
    d = t * t * t;
  const d1 = 3 * u * u,
    d2 = 6 * u * t,
    d3 = 3 * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
    angle: Math.atan2(
      d1 * (p1.y - p0.y) + d2 * (p2.y - p1.y) + d3 * (p3.y - p2.y),
      d1 * (p1.x - p0.x) + d2 * (p2.x - p1.x) + d3 * (p3.x - p2.x),
    ),
  };
}

/** Motif "dahan": satu ranting melengkung dengan daun-daun kecil. */
function branch(w, h, rand, ink) {
  const s = Math.min(w, h);
  const p0 = { x: -0.05 * w, y: h * (0.55 + rand() * 0.35) };
  const p1 = { x: w * (0.25 + rand() * 0.15), y: h * (0.2 + rand() * 0.4) };
  const p2 = { x: w * (0.55 + rand() * 0.15), y: h * (0.5 + rand() * 0.4) };
  const p3 = { x: 1.05 * w, y: h * (0.1 + rand() * 0.35) };
  const stem = `M${p0.x} ${p0.y} C${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`;

  const leaves = [];
  const count = 9;
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1) + (rand() - 0.5) * 0.04;
    const p = bezier(p0, p1, p2, p3, t);
    const side = i % 2 === 0 ? 1 : -1;
    const deg = (p.angle * 180) / Math.PI + side * (38 + rand() * 18);
    const len = s * (0.07 + rand() * 0.05);
    const wid = len * 0.34;
    leaves.push(
      `<path transform="translate(${p.x} ${p.y}) rotate(${deg})" d="M0 0 C${len * 0.3} ${-wid} ${len * 0.75} ${-wid} ${len} 0 C${len * 0.75} ${wid} ${len * 0.3} ${wid} 0 0Z"/>`,
    );
  }

  return `
    <g fill="none" stroke="${ink}" stroke-opacity="0.18" stroke-width="${s * 0.004}" stroke-linecap="round">
      <path d="${stem}"/>
    </g>
    <g fill="${ink}" fill-opacity="0.12">${leaves.join("")}</g>`;
}

function placeholderSvg({ file, w, h, tone, labelY = 0.5, labelScale = 1 }) {
  const { from, to, ink } = TONES[tone];
  const rand = random(file);
  const s = Math.min(w, h);
  const name = file.split("/").pop();
  const titleSize = Math.round(s * 0.042 * labelScale);
  const subSize = Math.round(s * 0.024 * labelScale);
  const y = Math.round(h * labelY);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="${30 + rand() * 40}%" cy="${25 + rand() * 30}%" r="95%">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  ${branch(w, h, rand, ink)}
  <g font-family="DejaVu Sans, Helvetica, Arial, sans-serif" fill="${ink}" text-anchor="middle">
    <text x="${w / 2}" y="${y}" font-size="${titleSize}" fill-opacity="0.75" letter-spacing="${titleSize * 0.06}">${name}</text>
    <text x="${w / 2}" y="${y + titleSize * 1.4}" font-size="${subSize}" fill-opacity="0.55" letter-spacing="${subSize * 0.18}">PLACEHOLDER · GANTI DENGAN FOTO ASLI</text>
  </g>
</svg>`;
}

/** PDF satu halaman sederhana sebagai pengganti sementara buku menu. */
function placeholderPdf() {
  const lines = [
    { size: 30, y: 700, text: "DAHAN KOPI" },
    { size: 14, y: 670, text: "Buku menu - file contoh" },
    {
      size: 11,
      y: 620,
      text: "Ganti file ini (public/menu-dahan.pdf) dengan buku menu asli Dahan Kopi.",
    },
    { size: 11, y: 600, text: "Nama file harus tetap: menu-dahan.pdf" },
  ];
  const stream = lines
    .map((l) => `BT /F1 ${l.size} Tf 72 ${l.y} Td (${l.text.replace(/[()\\]/g, "\\$&")}) Tj ET`)
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}

async function main() {
  let created = 0;
  for (const image of IMAGES) {
    const out = join(root, "public/images", image.file);
    if (existsSync(out) && !force) continue;
    await mkdir(dirname(out), { recursive: true });
    await sharp(Buffer.from(placeholderSvg(image)))
      .jpeg({ quality: 72, mozjpeg: true })
      .toFile(out);
    created++;
    console.log(`  dibuat  public/images/${image.file}`);
  }

  const pdf = join(root, "public/menu-dahan.pdf");
  if (!existsSync(pdf) || force) {
    await writeFile(pdf, placeholderPdf());
    created++;
    console.log("  dibuat  public/menu-dahan.pdf");
  }

  console.log(
    created ? `Selesai: ${created} file dibuat.` : "Semua file sudah ada, tidak ada yang diubah.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
