import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { address, site } from "@/data/site";

// Gambar pratinjau saat link website dibagikan (WhatsApp, Instagram, Facebook, dll.).

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fonts = join(process.cwd(), "assets/fonts");
  const [serif, sans] = await Promise.all([
    readFile(join(fonts, "InstrumentSerif-Regular.ttf")),
    readFile(join(fonts, "PlusJakartaSans-Medium.ttf")),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#2b1d16",
        color: "#f6f1ea",
      }}
    >
      <div
        style={{ fontFamily: "Instrument Serif", fontSize: 120, lineHeight: 1, letterSpacing: 4 }}
      >
        DAHAN KOPI
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{ fontFamily: "Plus Jakarta Sans", fontSize: 40, lineHeight: 1.3, maxWidth: 900 }}
        >
          {site.tagline}
        </div>
        <div
          style={{ fontFamily: "Plus Jakarta Sans", fontSize: 28, marginTop: 20, color: "#c9b8a6" }}
        >
          {`${address.locality}, ${address.regency}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Plus Jakarta Sans", data: sans, style: "normal", weight: 500 },
      ],
    },
  );
}
