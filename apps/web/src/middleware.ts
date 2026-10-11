import { NextRequest, NextResponse } from "next/server";
import { isValidAdminToken } from "@/lib/admin-auth";

// File ERP yang boleh diambil tanpa cookie admin (tidak berisi data):
// browser mengambil service worker & manifest tanpa jaminan cookie ikut.
const ERP_PUBLIC = new Set(["/erp/sw.js", "/erp/manifest.webmanifest"]);

// Lindungi /admin (kecuali /admin/login) dan /erp. Cookie session diperiksa.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next();
  }
  if (ERP_PUBLIC.has(pathname)) {
    return NextResponse.next();
  }
  const token = req.cookies.get("tr_admin")?.value;
  if (await isValidAdminToken(token)) {
    if (pathname === "/erp" || pathname === "/erp/index.html") {
      const url = req.nextUrl.clone();
      url.pathname = "/erp/index.html";
      // Jangan disimpan di cache bersama, karena halaman ini butuh login.
      const res = NextResponse.rewrite(url);
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    }
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/erp", "/erp/:path*"],
};
