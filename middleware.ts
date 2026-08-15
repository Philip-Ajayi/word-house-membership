// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all API routes - they have their own guards
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes and assets
  if (
    pathname === "/login" ||
    pathname === "/unauthorized" ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    pathname.match(/.*\.(png|svg|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = (token.role as string)?.toUpperCase();

  // Users with canAccessWorkers flag can see everything (like super admin)
  if (token.canAccessWorkers) {
    return NextResponse.next();
  }

  // Superadmin sees everything
  if (userRole === "SUPERADMIN") {
    return NextResponse.next();
  }

  // Family Admin / Management pages – require canAccessFamilyAdmin flag
  if (
    pathname.startsWith("/families") ||
    pathname.startsWith("/family-management")
  ) {
    if (!token.canAccessFamilyAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Standard Family Admin restricted routes
  if (userRole === "FAMILY_ADMIN") {
    const isAllowedPath =
      pathname === "/" ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/members");

    if (isAllowedPath) return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // Any other role → unauthorized for everything else
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)",
  ],
};
