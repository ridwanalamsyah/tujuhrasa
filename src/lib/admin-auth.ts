// src/lib/admin-auth.ts
// Auth admin sederhana: bandingkan password dengan env, set cookie httpOnly.
// Pakai Web Crypto API (subtle) supaya jalan di Edge middleware juga.
import { cookies } from "next/headers";

const COOKIE = "tr_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "tujuh-rasa-default-secret"
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return toHex(sig);
}

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "tujuhrasa";
}

export async function adminTokenFor(stamp: string): Promise<string> {
  return `${stamp}.${await sign(stamp)}`;
}

function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) {
    r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return r === 0;
}

export async function isValidAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 1) return false;
  const stamp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!stamp || !sig) return false;
  const expected = await sign(stamp);
  return safeEqualHex(sig, expected);
}

export async function isAuthed(): Promise<boolean> {
  const c = cookies().get(COOKIE)?.value;
  return isValidAdminToken(c);
}

export const ADMIN_COOKIE = COOKIE;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE;
