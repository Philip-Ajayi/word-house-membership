// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Retrieve the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 2. Redirect unauthenticated users trying to access protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Extract user details from JWT
  const userRole = (token.role as string | undefined)?.toUpperCase();

  // 3. Super Admin bypass (can access everything)
  if (userRole === "SUPERADMIN") {
    return NextResponse.next();
  }

  // 4. Family Admin restriction rules
  if (userRole === "FAMILY_ADMIN") {
    // Family Admins are ONLY allowed on:
    // - Home page: "/"
    // - Attendance page: "/attendance" (and subpaths if needed)
    // - Members routes: "/members/:path*"
    const isAllowedFamilyAdminPath =
      pathname === "/" ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/members");

    if (isAllowedFamilyAdminPath) {
      return NextResponse.next();
    }

    // If trying to access any other route, redirect to unauthorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  // 5. Fallback for any other role (e.g. "USER" or undefined roles)
  return NextResponse.redirect(new URL("/unauthorized", request.url));
}

// 6. Configure the matcher to exclude static files, public assets, and auth routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login (Our login page)
     * - unauthorized (Our fallback error page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public folder images, etc.
     */
    "/((?!api/auth|login|unauthorized|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)",
  ],
};
