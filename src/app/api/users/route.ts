import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, officeId } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // New self-sign-ups require admin approval (isActive: false).
    // Admin-created users can be set active immediately by passing isActive: true.
    const isActive = body.isActive !== undefined ? body.isActive : true;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "OFFICE_USER",
        officeId: officeId || null,
        isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        officeId: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");
    const role = searchParams.get("role");
    const email = searchParams.get("email");

    const where: any = {};
    if (officeId) where.officeId = officeId;
    if (role) where.role = role;
    if (email) where.email = email;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        officeId: true,
        office: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
