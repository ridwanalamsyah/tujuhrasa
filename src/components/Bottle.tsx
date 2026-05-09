"use client";

type BottleProps = {
  svg: string;
  className?: string;
  name?: string;
  sku?: string;
  cat?: string;
  accentHex?: string;
  bgHex?: string;
  liquidHex?: string;
  labelHex?: string;
  inkHex?: string;
  liquidPct?: number; // 0..1
  shape?: "tall" | "stout";
  photo?: string;
};

function pickShape(sku: string): "tall" | "stout" {
  if (!sku) return "tall";
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) | 0;
  return (h & 1) === 0 ? "tall" : "stout";
}

function fallbackBottle(p: Required<Omit<BottleProps, "svg" | "className" | "photo">>): string {
  const word = (p.name || "menu").split(/\s+/)[0];
  const initial = word.charAt(0).toUpperCase() + word.slice(1, 2).toLowerCase();
  const accent = p.accentHex;
  const liquid = p.liquidHex;
  const label = p.labelHex;
  const ink = p.inkHex;
  const id = (p.sku || p.name || "x").replace(/[^a-z0-9]/gi, "");
  const shape = p.shape;

  // Liquid path: top y-coordinate berkurang seiring level (15..305 inside body)
  const lvl = Math.max(0, Math.min(1, p.liquidPct));
  const yTop = 230 - lvl * 175; // body top ~55, body bottom ~290
  const wave = `M 60 ${yTop} q 10 -8 20 0 t 20 0 t 20 0 t 20 0 V 290 H 60 Z`;

  const bodyD =
    shape === "tall"
      ? "M82 18 h36 a4 4 0 0 1 4 4 v18 a4 4 0 0 1 -4 4 h-2 v8 c12 6 22 22 22 38 v200 a18 18 0 0 1 -18 18 h-40 a18 18 0 0 1 -18 -18 v-200 c0 -16 10 -32 22 -38 v-8 h-2 a4 4 0 0 1 -4 -4 v-18 a4 4 0 0 1 4 -4 z"
      : "M76 24 h48 a3 3 0 0 1 3 3 v14 a3 3 0 0 1 -3 3 h-2 v10 c14 4 26 22 26 42 v190 a18 18 0 0 1 -18 18 h-52 a18 18 0 0 1 -18 -18 v-190 c0 -20 12 -38 26 -42 v-10 h-2 a3 3 0 0 1 -3 -3 v-14 a3 3 0 0 1 3 -3 z";

  return `
<svg viewBox="0 0 200 320" xmlns="http://www.w3.org/2000/svg" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.95"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="liq-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${liquid}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${liquid}" stop-opacity="0.95"/>
    </linearGradient>
    <clipPath id="clip-${id}">
      <path d="${bodyD}"/>
    </clipPath>
  </defs>
  <ellipse cx="100" cy="305" rx="58" ry="6" fill="rgba(0,0,0,0.15)"/>
  <path d="${bodyD}" fill="url(#bg-${id})" stroke="${label}" stroke-width="2.5"/>
  <g clip-path="url(#clip-${id})">
    <path d="${wave}" fill="url(#liq-${id})"/>
  </g>
  <rect x="58" y="120" width="84" height="110" rx="3" fill="${label}" opacity="0.96"/>
  <text x="100" y="170" text-anchor="middle" font-family="serif" font-style="italic" font-size="34" fill="${ink}">${initial}</text>
  <line x1="68" y1="190" x2="132" y2="190" stroke="${ink}" stroke-width="1" stroke-dasharray="2,3"/>
  <text x="100" y="208" text-anchor="middle" font-family="monospace" font-size="9" fill="${ink}" letter-spacing="2">TUJUH RASA</text>
  <text x="100" y="222" text-anchor="middle" font-family="monospace" font-size="6" fill="${ink}" opacity="0.7" letter-spacing="1.5">${(p.sku || "").toUpperCase()}</text>
</svg>`;
}

export function Bottle({
  svg,
  className,
  name,
  sku,
  cat,
  accentHex,
  bgHex,
  liquidHex,
  labelHex,
  inkHex,
  liquidPct,
  shape,
  photo,
}: BottleProps) {
  if (photo && /^https?:\/\//.test(photo)) {
    return (
      <div className={"bottle-svg " + (className ?? "")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={name ?? "produk"} className="w-full h-full object-contain" />
      </div>
    );
  }

  const html =
    svg && svg.trim().length > 0
      ? svg
      : fallbackBottle({
          name: name ?? "Menu",
          sku: sku ?? "",
          cat: cat ?? "",
          accentHex: accentHex ?? "#7c3a26",
          bgHex: bgHex ?? "#efd9b8",
          liquidHex: liquidHex ?? "#a04a2a",
          labelHex: labelHex ?? "#f5e9c8",
          inkHex: inkHex ?? "#3a1410",
          liquidPct: liquidPct ?? 0.7,
          shape: shape ?? pickShape(sku ?? name ?? ""),
        });
  return (
    <div
      className={"bottle-svg " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
