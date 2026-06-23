import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        officeId: true,
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
