import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0"
);

const COOKIE_NAME = "session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    officeId: string | null;
    officeName: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Server-side auth check. Reads the JWT from the session cookie.
 * Returns a Session object if authenticated, null otherwise.
 * Works in Server Components, API routes, and Route Handlers.
 */
export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET);
    if (!payload || !payload.sub) return null;

    return {
      user: {
        id: payload.sub as string,
        name: (payload.name as string) || "",
        email: (payload.email as string) || "",
        role: (payload.role as string) || "",
        officeId: (payload.officeId as string | null) || null,
        officeName: (payload.officeName as string | null) || null,
        avatarUrl: (payload.avatarUrl as string | null) || null,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Creates a signed JWT for the given user and sets it as an httpOnly cookie.
 */
async function createSession(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  officeId: string | null;
  officeName: string | null;
  avatarUrl: string | null;
}): Promise<string> {
  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    officeId: user.officeId,
    officeName: user.officeName,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  return token;
}

/**
 * Validates credentials and creates a session.
 * Returns the session if successful, null if invalid.
 */
export async function signIn(
  email: string,
  password: string
): Promise<Session | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { office: true },
  });

  if (!user || !user.passwordHash || !user.isActive) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    officeId: user.officeId,
    officeName: user.office?.name ?? null,
    avatarUrl: user.avatarUrl,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      officeId: user.officeId,
      officeName: user.office?.name ?? null,
      avatarUrl: user.avatarUrl,
    },
  };
}

/**
 * Clears the session cookie.
 */
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

/**
 * Verifies a JWT token string for use in middleware (edge runtime).
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}
