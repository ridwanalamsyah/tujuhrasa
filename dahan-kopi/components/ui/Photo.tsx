import Image from "next/image";
import { imageExists } from "@/lib/image-exists";
import type { ImageAsset } from "@/lib/types";

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
          {file && <span className="block truncate opacity-75">{file}</span>}
        </span>
      </div>
    </div>
  );
}
