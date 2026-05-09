import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";

// Lindungi /admin (kecuali /admin/login). Cookie session diperiksa.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }
  const token = req.cookies.get("tr_admin")?.value;
  if (await isValidAdminToken(token)) {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
