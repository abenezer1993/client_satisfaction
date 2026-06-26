import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;

  // Allow unauthenticated access to specific routes
  const isPublic =
    (pathname === "/api/feedback" && method === "POST") ||
    (pathname === "/api/users" && method === "GET") ||
    (pathname === "/api/users" && method === "POST") || // Sign-up
    (pathname === "/api/offices" && method === "GET") ||
    (pathname === "/api/services" && method === "GET");

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
    "/dashboard/:path*",
    "/api/feedback/:path*",
    "/api/users/:path*",
    "/api/offices/:path*",
    "/api/analytics/:path*",
  ],
};
