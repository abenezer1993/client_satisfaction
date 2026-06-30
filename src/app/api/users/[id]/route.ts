import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

async function authorizeAdmin(session: any) {
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userRole = (session.user as any).role;
  if (userRole !== "GLOBAL_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null; // authorized
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const authError = await authorizeAdmin(session);
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    // Build update data from allowed fields
    const updateData: Record<string, any> = {};

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }
    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.email !== undefined) {
      // Check email uniqueness if changing
      if (body.email !== body._currentEmail) {
        const existing = await prisma.user.findUnique({
          where: { email: body.email },
        });
        if (existing && existing.id !== id) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 409 }
          );
        }
      }
      updateData.email = body.email;
    }
    if (body.role !== undefined) {
      const validRoles = ["GLOBAL_ADMIN", "OFFICE_ADMIN", "OFFICE_USER", "EXTERNAL"];
      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          { error: "Invalid role" },
          { status: 400 }
        );
      }
      updateData.role = body.role;
    }
    if (body.officeId !== undefined) {
      updateData.officeId = body.officeId || null;
    }
    if (body.password !== undefined && body.password) {
      updateData.passwordHash = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const authError = await authorizeAdmin(session);
    if (authError) return authError;

    const { id } = await params;

    // Delete user and associated records
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.feedback.deleteMany({ where: { authorId: id } });
    await prisma.feedback.deleteMany({ where: { targetUserId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
