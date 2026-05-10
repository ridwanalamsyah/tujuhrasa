// src/lib/palette.ts
// Per-product visual palette. Tiap SKU dapat warna botol unik supaya
// tidak monoton. Palette kategori cuma fallback kalau SKU tidak dikenal.

export type Palette = {
  accent: string; // botol body (gradient base)
  bg: string; // page background section
  label: string; // label di tengah botol
  liquid: string; // warna isi cairan
  ink: string; // warna teks di label
};

const SKU_PALETTE: Record<string, Palette> = {
  // Kopi
  "KSA-001": {
    accent: "#3a1410",
    bg: "#e8d5b7",
    label: "#f4ead7",
    liquid: "#5b2818",
    ink: "#3a1410",
  },
  // Matcha
  "MTL-001": {
    accent: "#5d6e3f",
    bg: "#dde6c7",
    label: "#f6f1d8",
    liquid: "#7e9558",
    ink: "#2a3a14",
  },
  // Brown Sugar
  "BSM-001": {
    accent: "#a04a2a",
    bg: "#f3e5d3",
    label: "#fbf2e0",
    liquid: "#c7794d",
    ink: "#5b2818",
  },
  // Taro
  "TRL-001": {
    accent: "#8a6dab",
    bg: "#ecdef4",
    label: "#fbe9d7",
    liquid: "#b89dd0",
    ink: "#43275b",
  },
  // Pandan
  "PDL-001": {
    accent: "#3f8260",
    bg: "#cfe6d6",
    label: "#fdf2c4",
    liquid: "#67b285",
    ink: "#1c4329",
  },
};

const CAT_PALETTE: Record<string, Palette> = {
  Kopi: SKU_PALETTE["KSA-001"],
  "Kopi Botol": SKU_PALETTE["KSA-001"],
  Matcha: SKU_PALETTE["MTL-001"],
  Susu: SKU_PALETTE["BSM-001"],
  Seasonal: SKU_PALETTE["TRL-001"],
};

const FALLBACK_POOL: Palette[] = [
  { accent: "#7c3a26", bg: "#efd9b8", label: "#f5e9c8", liquid: "#a04a2a", ink: "#3a1410" },
  { accent: "#6b8a4e", bg: "#dee5cb", label: "#f4ead7", liquid: "#8aa867", ink: "#243615" },
  { accent: "#b06c3c", bg: "#f1d8be", label: "#fdf0d6", liquid: "#d18957", ink: "#5b2818" },
  { accent: "#4f6d8a", bg: "#d3deea", label: "#eef2f7", liquid: "#7390ad", ink: "#1f3247" },
  { accent: "#9d4655", bg: "#ecc8d0", label: "#fbe7eb", liquid: "#bb6976", ink: "#421821" },
  { accent: "#3f8260", bg: "#cfe6d6", label: "#fdf2c4", liquid: "#67b285", ink: "#1c4329" },
  { accent: "#8a6dab", bg: "#ecdef4", label: "#fbe9d7", liquid: "#b89dd0", ink: "#43275b" },
  { accent: "#a07a3a", bg: "#ecdfb8", label: "#fdf5d6", liquid: "#c2974a", ink: "#3e2c0a" },
  { accent: "#5a4734", bg: "#e8d8b6", label: "#f4ead7", liquid: "#7d6849", ink: "#2c1f10" },
  { accent: "#c66c4f", bg: "#f5d6c2", label: "#fdebd6", liquid: "#dc8e72", ink: "#5b2818" },
  { accent: "#2f7d7d", bg: "#c7e1e1", label: "#e9f6f4", liquid: "#5ba7a7", ink: "#103030" },
  { accent: "#8e6c2a", bg: "#e8d8a4", label: "#fdf2c4", liquid: "#b48f4a", ink: "#3a2a05" },
];

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Pilih palette: prioritas SKU eksplisit > kategori > hash pool > default. */
export function paletteFor(sku: string, cat?: string): Palette {
  if (sku && SKU_PALETTE[sku]) return SKU_PALETTE[sku];
  if (cat && CAT_PALETTE[cat]) return CAT_PALETTE[cat];
  if (sku) return FALLBACK_POOL[hashStr(sku) % FALLBACK_POOL.length];
  if (cat) return FALLBACK_POOL[hashStr(cat) % FALLBACK_POOL.length];
  return FALLBACK_POOL[0];
}

/** Persen isi botol berdasarkan stok vs minStk. */
export function liquidLevel(stock: number, minStk: number): number {
  if (stock <= 0) return 0;
  const target = Math.max(minStk * 4, 20); // anggap "penuh" = 4x min stock atau 20
  const pct = Math.min(1, stock / target);
  return Math.max(0.15, pct); // minimum 15% supaya cairan kelihatan
}
