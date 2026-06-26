import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Allow unauthenticated access to public routes
  const isPublic =
    (pathname === "/api/auth" || pathname.startsWith("/api/auth/")) ||
    (pathname === "/api/feedback" && method === "POST") ||
    (pathname === "/api/users" && method === "GET") ||
    (pathname === "/api/users" && method === "POST") ||
    (pathname === "/api/offices" && method === "GET") ||
    (pathname === "/api/services" && method === "GET") ||
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/";

  if (isPublic) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (!token) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match dashboard and API routes that require auth
    "/dashboard/:path*",
    "/api/feedback/:path*",
    "/api/users/:path*",
    "/api/offices/:path*",
    "/api/analytics/:path*",
    "/api/services/:path*",
  ],
};
