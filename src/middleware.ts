import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
);

const COOKIE_NAME = "session";

// Public routes that don't require authentication
const publicRoutes = [
  "/signin",
  "/signup",
  "/guest-review",
  "/help",
  "/",
];

// API routes that are public (no auth required)
const publicApiRoutes = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/users",
  "/api/offices",
  "/api/services",
  "/api/seed",
  "/api/db-init",
  "/api/ping",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Allow public pages
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // But still redirect authenticated users away from signin/signup
    if ((pathname === "/signin" || pathname === "/signup") && request.cookies.has(COOKIE_NAME)) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (token) {
        try {
          const { payload } = await jwtVerify(token, SECRET);
          if (payload && payload.sub) {
            // User is authenticated, redirect to dashboard
            return NextResponse.redirect(new URL("/dashboard/profile", request.url));
          }
        } catch {
          // Token is invalid, allow access to signin/signup
        }
      }
    }
    return NextResponse.next();
  }

  // Allow public API routes (all methods — each route handler enforces its own auth)
  if (
    publicApiRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  // Allow POST to /api/feedback (guest feedback submission)
  if (pathname === "/api/feedback" && method === "POST") {
    return NextResponse.next();
  }

  // Check authentication for all other routes
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // API routes should return 401 instead of redirecting
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Page routes redirect to signin
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify the token
  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    // Invalid token
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }
}

export const config = {
  matcher: [
    // Match all dashboard routes
    "/dashboard/:path*",
    // Match all API routes (selectively handled inside middleware)
    "/api/:path*",
    // Match signin/signup pages
    "/signin",
    "/signup",
  ],
};
