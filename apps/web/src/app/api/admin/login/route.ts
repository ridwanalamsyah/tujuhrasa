import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminPassword,
  adminTokenFor,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.password) {
    return NextResponse.json({ error: "Password kosong." }, { status: 400 });
  }
  if (body.password !== adminPassword()) {
    return NextResponse.json({ error: "Password salah." }, { status: 401 });
  }
  const token = await adminTokenFor(String(Date.now()));
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
