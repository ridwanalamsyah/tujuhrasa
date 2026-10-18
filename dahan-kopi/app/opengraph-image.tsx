import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BADGE_PATH } from "@/components/logo-paths";
import { address, site } from "@/data/site";

// Gambar pratinjau saat link website dibagikan (WhatsApp, Instagram, Facebook, dll.).

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const sans = await readFile(join(process.cwd(), "assets/fonts/PlusJakartaSans-Medium.ttf"));

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#ffffff",
        color: "#141414",
        fontFamily: "Plus Jakarta Sans",
      }}
    >
      <svg width="150" height="150" viewBox="0 0 1600 1600">
        <path d={BADGE_PATH} fill="#141414" fillRule="evenodd" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 60, lineHeight: 1.1, letterSpacing: -1.5, maxWidth: 900 }}>
          {site.tagline}
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#737373" }}>
          {`${site.name} · ${address.locality}, ${address.regency}`}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Plus Jakarta Sans", data: sans, style: "normal", weight: 500 }],
    },
  );
}
