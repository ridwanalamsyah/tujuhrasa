import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { ImageResponse } from "next/og";
import { address, hero, site } from "@/data/site";

// Gambar pratinjau saat link website dibagikan (WhatsApp, Instagram, Facebook, dll.).
// Dibuat otomatis saat build dari foto hero + tagline.

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

async function loadHeroPhoto(): Promise<string | null> {
  const mime = MIME[extname(hero.image.src).toLowerCase()];
  if (!mime) return null;
  try {
    const file = await readFile(join(process.cwd(), "public", hero.image.src));
    return `data:${mime};base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const [font, photo] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")),
    loadHeroPhoto(),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        backgroundColor: "#2b1d16",
        color: "#f6f1ea",
        fontFamily: "Instrument Serif",
      }}
    >
      {photo && (
        <img
          src={photo}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(180deg, rgba(43,29,22,0.35) 0%, rgba(43,29,22,0.85) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          width: "100%",
        }}
      >
        <div
          style={{ fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#a8bf9c" }}
        >
          {site.name}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 92,
            lineHeight: 0.95,
            textTransform: "uppercase",
            maxWidth: 1000,
          }}
        >
          {site.tagline}
        </div>
        <div style={{ marginTop: 28, fontSize: 30, letterSpacing: 2, color: "#e2d6c8" }}>
          {`${address.locality}, ${address.regency}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: font, style: "normal", weight: 400 }],
    },
  );
}
