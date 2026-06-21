import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* ================= ROUTE → REQUIRED ROLE MAP =================
   Each protected route prefix maps to the role allowed to access it.
   Extend this list as new role-specific routes are added. */
const PROTECTED_ROUTES: { prefix: string; role: string }[] = [
  { prefix: "/super-admin", role: "super_admin" },
  { prefix: "/hospital-admin", role: "hospital_admin" },
  { prefix: "/hr-dashboard", role: "hr" },
  { prefix: "/hod", role: "hod" },
  { prefix: "/user-dashboard", role: "staff" },
];

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("access_token")?.value;

  const { pathname } = request.nextUrl;

  const matchedRoute = PROTECTED_ROUTES.find((route) =>
    pathname.startsWith(route.prefix)
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  // No token at all — not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Logged in, but wrong role for this route
  if (token !== matchedRoute.role) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/hospital-admin/:path*",
    "/hr-dashboard/:path*",
    "/hod/:path*",
    "/user-dashboard/:path*",
  ],
};