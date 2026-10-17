import Image from "next/image";
import { imageExists } from "@/lib/image-exists";
import type { ImageAsset } from "@/lib/types";

const UNSPLASH = "https://images.unsplash.com/";
const WIDTHS = [480, 768, 1080, 1440, 1920, 2560];

/** URL foto Unsplash dengan ukuran tertentu (Unsplash mengecilkan & mengompres sendiri). */
function unsplashUrl(src: string, width: number) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", "70");
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}

const tones = {
  garden: "bg-ph-garden text-cream",
  wood: "bg-ph-wood text-cream",
  day: "bg-ph-day text-espresso",
} as const;

type Props = {
  image: ImageAsset;
  /** Kelas rasio Tailwind (mis. "aspect-4/3 lg:aspect-3/2"), atau "fill" untuk mengisi wadah. */
  ratio: string;
  sizes: string;
  /** Hanya untuk foto utama di layar pertama. */
  preload?: boolean;
  /** Muncul pelan saat discroll. Default: ya, kecuali foto `preload`. */
  reveal?: boolean;
  /** Kelas tambahan untuk foto/kotak di dalam bingkai (mis. efek hover). */
  innerClassName?: string;
  className?: string;
};

/**
 * Foto bersudut tegas. Jika file foto belum ada di `public`, tampil kotak warna polos
 * berisi keterangan foto yang dibutuhkan (dari `shot`) dan nama filenya.
 */
export function Photo({
  image,
  ratio,
  sizes,
  preload = false,
  reveal = !preload,
  innerClassName = "",
  className = "",
}: Props) {
  const frame = `relative overflow-hidden ${ratio === "fill" ? "h-full w-full" : ratio} ${className}`;
  const revealProps = reveal ? { "data-reveal": "" } : {};

  if (image.src.startsWith(UNSPLASH)) {
    return (
      <div className={frame} {...revealProps}>
        {/* Foto stok sementara dari CDN Unsplash, langsung dimuat browser dalam ukuran yang pas. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={unsplashUrl(image.src, 1440)}
          srcSet={WIDTHS.map((w) => `${unsplashUrl(image.src, w)} ${w}w`).join(", ")}
          sizes={sizes}
          alt={image.alt}
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "high" : undefined}
          decoding="async"
          className={`absolute inset-0 h-full w-full bg-ph-day object-cover ${innerClassName}`}
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
      </div>
    );
  }

  if (imageExists(image.src)) {
    return (
      <div className={frame} {...revealProps}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          quality={75}
          preload={preload}
          fetchPriority={preload ? "high" : undefined}
          className={`object-cover ${innerClassName}`}
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
      </div>
    );
  }

  const file = image.src.split("/").pop();
  return (
    <div className={frame} {...revealProps}>
      <div
        role="img"
        aria-label={`Foto menyusul: ${image.alt}`}
        className={`absolute inset-0 ${tones[image.tone]} ${innerClassName}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 text-[0.75rem] font-medium leading-tight lg:inset-x-4 lg:bottom-4"
        >
          <span className="block truncate">Foto · {image.shot}</span>
          {file && <span className="block truncate font-normal">{file}</span>}
        </span>
      </div>
    </div>
  );
}
