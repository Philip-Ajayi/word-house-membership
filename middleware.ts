// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = (token.role as string)?.toUpperCase();

  // Superadmin sees everything
  if (userRole === "SUPERADMIN") {
    return NextResponse.next();
  }

  // Worker pages – require canAccessWorkers flag
  if (pathname.startsWith("/workers") || pathname.startsWith("/api/workers")) {
    if (!token.canAccessWorkers) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
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
    "/((?!api/auth|login|unauthorized|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)",
  ],
};