import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists and is pending approval
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, isActive: true },
    });

    if (user && !user.isActive) {
      return NextResponse.json(
        { error: "Account pending approval", code: "PENDING_APPROVAL", name: user.name },
        { status: 403 }
      );
    }

    const session = await signIn(email, password);

    if (!session) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during sign in" },
      { status: 500 }
    );
  }
}
