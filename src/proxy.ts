import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get("session_id")?.value;

  // Protected Admin Routes
  const isAdminRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/area") ||
    pathname.startsWith("/tasks");

  // Protected Staff Route
  const isStaffRoute = pathname.startsWith("/portal");

  // 1. Redirect to /login if unauthenticated user attempts to access protected routes
  if ((isAdminRoute || isStaffRoute) && !sessionId) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("expired", "true");
    return NextResponse.redirect(loginUrl);
  }

  // 2. Redirect to /dashboard if authenticated user accesses /login
  if (pathname === "/login" && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/staff/:path*",
    "/area/:path*",
    "/tasks/:path*",
    "/portal/:path*",
    "/login",
  ],
};
