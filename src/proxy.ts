import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow guest feedback submission
  if (pathname === "/api/feedback" && req.method === "POST") {
    return NextResponse.next();
  }

  // Allow guest fetching users list
  if (pathname === "/api/users" && req.method === "GET") {
    return NextResponse.next();
  }

  // Allow guest fetching offices list
  if (pathname === "/api/offices" && req.method === "GET") {
    return NextResponse.next();
  }

  // Allow guest fetching services list
  if (pathname === "/api/services" && req.method === "GET") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

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
