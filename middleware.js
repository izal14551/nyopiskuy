import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("admin_token")?.value;

  const protectedPaths = ["/admin/menu", "/admin/menu/add", "/admin/menu/edit"];

  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (token && request.nextUrl.pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/admin/:path*"]
};
