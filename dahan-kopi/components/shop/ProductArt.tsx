import { LogoMark } from "@/components/Logo";
import type { Product } from "@/lib/types";

/**
 * Gambar label produk (dipakai selama belum ada foto produk asli):
 * kemasan sederhana di atas latar warna, dengan logo dan nama produk.
 */
export function ProductArt({ product, className = "" }: { product: Product; className?: string }) {
  const { bg, body, ink, shape } = product.art;
  const words = product.name.toUpperCase().split(" ");
  const lines: string[] = [];
  for (const w of words) {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= 11) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  }

  return (
    <svg viewBox="0 0 500 500" role="img" aria-label={product.name} className={className}>
      <rect width="500" height="500" fill={bg} />
      <ellipse cx="250" cy="440" rx="130" ry="14" fill="#000" opacity="0.08" />

      {shape === "pouch" && (
        <g>
          <path d="M150 92h200l10 340H140z" fill={body} />
          <rect x="146" y="80" width="208" height="26" fill={body} />
          <path d="M146 106h208" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
          <rect x="168" y="164" width="164" height="196" fill={ink} />
        </g>
      )}
      {shape === "box" && (
        <g>
          <path d="M140 150h220v270H140z" fill={body} />
          <path d="M140 150l20-28h180l20 28z" fill={body} opacity="0.8" />
          <rect x="160" y="192" width="180" height="180" fill={ink} />
        </g>
      )}
      {shape === "tumbler" && (
        <g>
          <rect x="190" y="88" width="120" height="34" rx="8" fill={body} />
          <path d="M184 122h132l-10 306H194z" fill={body} />
          <path d="M184 140h132" stroke="#000" strokeOpacity="0.2" strokeWidth="3" />
        </g>
      )}
      {shape === "tote" && (
        <g>
          <path d="M200 160c0-60 100-60 100 0" fill="none" stroke={body} strokeWidth="12" />
          <path d="M140 160h220l14 270H126z" fill={body} stroke="#000" strokeOpacity="0.06" />
        </g>
      )}

      {(shape === "pouch" || shape === "box") && (
        <g fill={body}>
          <svg
            x="235"
            y={shape === "pouch" ? 182 : 210}
            width="30"
            height="30"
            viewBox="0 0 120 120"
          >
            <LogoMark cut={ink} style={{ color: body }} />
          </svg>
          <text
            x="250"
            y={shape === "pouch" ? 232 : 260}
            textAnchor="middle"
            fontSize="10"
            letterSpacing="2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            DAHAN KOPI
          </text>
          {lines.map((line, i) => (
            <text
              key={line}
              x="250"
              y={(shape === "pouch" ? 268 : 296) + i * 24}
              textAnchor="middle"
              fontSize="22"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {line}
            </text>
          ))}
          <text
            x="250"
            y={shape === "pouch" ? 344 : 362}
            textAnchor="middle"
            fontSize="10"
            letterSpacing="1.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {product.variants[0].label.toUpperCase()}
          </text>
        </g>
      )}
      {shape === "tumbler" && (
        <svg x="225" y="230" width="50" height="50" viewBox="0 0 120 120">
          <LogoMark cut={body} style={{ color: ink }} />
        </svg>
      )}
      {shape === "tote" && (
        <text
          x="250"
          y="310"
          textAnchor="middle"
          fontSize="46"
          fill={ink}
          style={{ fontFamily: "var(--font-hand)" }}
        >
          Dahan Kopi
        </text>
      )}
    </svg>
  );
}
