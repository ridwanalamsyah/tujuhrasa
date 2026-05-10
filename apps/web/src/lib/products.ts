// src/lib/products.ts
// ERP = primary source untuk menu (yaitu nama, kategori, harga, HPP, stok).
// Web hanya overlay konten cerita (story, brewTip, foto SVG, dll.) DAN HANYA
// kalau ada local Prisma row dengan SKU yang sama.
//
// Pattern: ambil semua produk dari ERP `state.products[]`. Tiap produk
// disinkronkan ke Prisma sebagai stub row (by SKU) supaya cart/checkout/review
// yang lama (pakai productId number) tetap jalan tanpa dirombak.

import { prisma } from "@/lib/prisma";
import { fetchErpProducts, type ErpProductFull } from "@/lib/erp";
import { paletteFor as paletteForSku, liquidLevel } from "@/lib/palette";

export type DisplayProduct = {
  id: number; // Prisma product.id (auto-sync dari ERP SKU)
  slug: string;
  name: string;
  rasa: string; // bisa kosong kalau tidak ada local overlay
  tagline: string;
  description: string;
  origin: string;
  process: string;
  roast: string;
  volume: number;
  caffeine: string;
  ingredients: string;
  notes: string;
  brewTip: string;
  story: string;
  priceCents: number;
  comparePriceCents: number | null;
  stock: number;
  accentHex: string;
  bgHex: string;
  liquidHex: string;
  labelHex: string;
  inkHex: string;
  liquidPct: number;
  bottleSvg: string;
  photo: string;
  isFeatured: boolean;
  sku: string;
  cat: string;
  sat: string;
  gros: number;
  minStk: number;
  baristaTempC: number;
  baristaTimeS: number;
  baristaYieldMl: number;
  source: "erp" | "local";
};

const DEFAULT_ACCENT = "#7c3a26";
const DEFAULT_BG = "#f4ead7";
const DEFAULT_BOTTLE_SVG = "";

function paletteFor(sku: string, cat: string) {
  return paletteForSku(sku, cat);
}

/** Convert "Kopi Susu Gula Aren" → "kopi-susu-gula-aren" */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type LocalProduct = NonNullable<
  Awaited<ReturnType<typeof prisma.product.findFirst>>
>;

/**
 * Pastikan tiap produk ERP ada di Prisma sebagai stub row (by SKU).
 * Mengembalikan map sku → Prisma product.
 *
 * Dipanggil sekali setiap kali `getProductsForDisplay` jalan; idempotent.
 * Stok tidak disinkron ke Prisma (ERP tetap source of truth — Prisma row
 * stok hanya pemegang FK untuk OrderItem/CartItem/Review).
 */
async function ensureLocalStubs(
  erp: ErpProductFull[]
): Promise<Map<string, LocalProduct>> {
  const allLocal = await prisma.product.findMany();
  const bySku = new Map<string, LocalProduct>(allLocal.map((p) => [p.sku, p]));

  for (const e of erp) {
    if (bySku.has(e.sku)) continue;
    const palette = paletteFor(e.sku, e.cat ?? "");
    const slug = slugify(e.name) || `produk-${e.id.toLowerCase()}`;
    const created = await prisma.product.create({
      data: {
        slug,
        name: e.name,
        rasa: "",
        tagline: "",
        description: "",
        origin: "",
        process: "",
        roast: "",
        volume: Math.round(e.barista?.yieldMl ?? 250),
        caffeine: "",
        ingredients: "",
        notes: "",
        brewTip: e.barista?.sop ?? "",
        story: "",
        priceCents: e.sell,
        comparePriceCents: null,
        stock: 100,
        accentHex: palette.accent,
        bgHex: palette.bg,
        bottleSvg: "",
        isFeatured: false,
        erpId: e.id,
        sku: e.sku,
        sat: e.sat ?? "botol",
        cat: e.cat ?? "",
        gros: e.gros ?? 0,
        minStk: e.minStk ?? 10,
        photo: e.photo ?? "",
        baristaSop: e.barista?.sop ?? "",
        baristaTempC: e.barista?.tempC ?? 4,
        baristaTimeS: e.barista?.timeS ?? 90,
        baristaYieldMl: e.barista?.yieldMl ?? 250,
      },
    });
    bySku.set(e.sku, created);
  }

  return bySku;
}

function fromErp(erp: ErpProductFull, local: LocalProduct): DisplayProduct {
  const palette = paletteFor(erp.sku, erp.cat ?? "");
  const fallbackBrew = erp.barista?.sop ?? "";
  const minStk = erp.minStk ?? 10;
  return {
    id: local.id,
    slug: local.slug,
    name: erp.name || local.name,
    rasa: local.rasa,
    tagline: local.tagline,
    description: local.description,
    origin: local.origin,
    process: local.process,
    roast: local.roast,
    volume: local.volume,
    caffeine: local.caffeine,
    ingredients: local.ingredients,
    notes: local.notes,
    brewTip: local.brewTip || fallbackBrew,
    story: local.story,
    priceCents: erp.sell,
    comparePriceCents: local.comparePriceCents,
    stock: erp.stock,
    accentHex: local.accentHex && local.accentHex !== DEFAULT_ACCENT ? local.accentHex : palette.accent,
    bgHex: local.bgHex && local.bgHex !== DEFAULT_BG ? local.bgHex : palette.bg,
    liquidHex: palette.liquid,
    labelHex: palette.label,
    inkHex: palette.ink,
    liquidPct: liquidLevel(erp.stock, minStk),
    bottleSvg: local.bottleSvg || DEFAULT_BOTTLE_SVG,
    photo: erp.photo ?? "",
    isFeatured: local.isFeatured,
    sku: erp.sku,
    cat: erp.cat ?? "",
    sat: erp.sat ?? "botol",
    gros: erp.gros ?? 0,
    minStk,
    baristaTempC: erp.barista?.tempC ?? 4,
    baristaTimeS: erp.barista?.timeS ?? 90,
    baristaYieldMl: erp.barista?.yieldMl ?? 250,
    source: "erp",
  };
}

function localToDisplay(
  p: NonNullable<Awaited<ReturnType<typeof prisma.product.findFirst>>>
): DisplayProduct {
  const palette = paletteFor(p.sku, p.cat);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    rasa: p.rasa,
    tagline: p.tagline,
    description: p.description,
    origin: p.origin,
    process: p.process,
    roast: p.roast,
    volume: p.volume,
    caffeine: p.caffeine,
    ingredients: p.ingredients,
    notes: p.notes,
    brewTip: p.brewTip,
    story: p.story,
    priceCents: p.priceCents,
    comparePriceCents: p.comparePriceCents,
    stock: p.stock,
    accentHex: p.accentHex && p.accentHex !== DEFAULT_ACCENT ? p.accentHex : palette.accent,
    bgHex: p.bgHex && p.bgHex !== DEFAULT_BG ? p.bgHex : palette.bg,
    liquidHex: palette.liquid,
    labelHex: palette.label,
    inkHex: palette.ink,
    liquidPct: liquidLevel(p.stock, p.minStk),
    bottleSvg: p.bottleSvg,
    photo: p.photo ?? "",
    isFeatured: p.isFeatured,
    sku: p.sku,
    cat: p.cat,
    sat: p.sat,
    gros: p.gros,
    minStk: p.minStk,
    baristaTempC: p.baristaTempC,
    baristaTimeS: p.baristaTimeS,
    baristaYieldMl: p.baristaYieldMl,
    source: "local",
  };
}

function erpOnlyToDisplay(e: ErpProductFull): DisplayProduct {
  const palette = paletteFor(e.sku, e.cat ?? "");
  const slug = slugify(e.name) || `produk-${e.id.toLowerCase()}`;
  return {
    id: 0,
    slug,
    name: e.name,
    rasa: "",
    tagline: "",
    description: "",
    origin: "",
    process: "",
    roast: "",
    volume: Math.round(e.barista?.yieldMl ?? 250),
    caffeine: "",
    ingredients: "",
    notes: "",
    brewTip: e.barista?.sop ?? "",
    story: "",
    priceCents: e.sell,
    comparePriceCents: null,
    stock: e.stock,
    accentHex: palette.accent,
    bgHex: palette.bg,
    liquidHex: palette.liquid,
    labelHex: palette.label,
    inkHex: palette.ink,
    liquidPct: liquidLevel(e.stock, e.minStk ?? 0),
    bottleSvg: "",
    photo: e.photo ?? "",
    isFeatured: false,
    sku: e.sku,
    cat: e.cat ?? "",
    sat: e.sat ?? "botol",
    gros: e.gros ?? 0,
    minStk: e.minStk ?? 0,
    baristaTempC: e.barista?.tempC ?? null,
    baristaTimeS: e.barista?.timeS ?? null,
    baristaYieldMl: e.barista?.yieldMl ?? null,
    source: "erp",
  };
}

export async function getProductsForDisplay(opts?: {
  cat?: string | null;
  rasa?: string | null;
}): Promise<DisplayProduct[]> {
  const erp = await fetchErpProducts();

  if (erp.length > 0) {
    let merged: DisplayProduct[];
    try {
      const bySku = await ensureLocalStubs(erp);
      merged = erp
        .map((e) => {
          const local = bySku.get(e.sku);
          return local ? fromErp(e, local) : erpOnlyToDisplay(e);
        })
        .filter((p): p is DisplayProduct => p !== null);
    } catch (err) {
      // DB unavailable — fall back to ERP-only display (no reviews etc).
      merged = erp.map((e) => erpOnlyToDisplay(e));
    }

    if (opts?.cat) {
      merged = merged.filter(
        (p) => p.cat.toLowerCase() === opts.cat!.toLowerCase()
      );
    }
    if (opts?.rasa) {
      merged = merged.filter((p) => p.rasa === opts.rasa);
    }
    return merged;
  }

  // Fallback: ERP unreachable, pakai local Prisma seutuhnya.
  try {
    const where = opts?.rasa ? { rasa: opts.rasa } : undefined;
    const local = await prisma.product.findMany({
      where,
      orderBy: { id: "asc" },
    });
    return local.map(localToDisplay);
  } catch {
    return [];
  }
}

export async function getProductForDisplayBySlug(
  slug: string
): Promise<DisplayProduct | null> {
  const all = await getProductsForDisplay();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(
  excludeSlug: string,
  limit = 4
): Promise<DisplayProduct[]> {
  const all = await getProductsForDisplay();
  return all.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

/** Daftar kategori unik dari produk ERP, untuk filter pill di /shop. */
export async function getCategories(): Promise<string[]> {
  const all = await getProductsForDisplay();
  const cats = new Set<string>();
  for (const p of all) {
    if (p.cat) cats.add(p.cat);
  }
  return Array.from(cats).sort();
}
