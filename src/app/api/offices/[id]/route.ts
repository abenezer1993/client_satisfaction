import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, parentId, globalAdminId, isActive } = body;

    const office = await prisma.office.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(globalAdminId !== undefined && { globalAdminId: globalAdminId || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(office);
  } catch (error) {
    console.error("Error updating office:", error);
    return NextResponse.json(
      { error: "Failed to update office" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if office has children
    const children = await prisma.office.findMany({
      where: { parentId: id },
      select: { id: true, name: true },
    });

    if (children.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete office with child offices",
          children: children.map((c) => c.name),
        },
        { status: 409 }
      );
    }

    // Delete office settings first, then office
    await prisma.officeSettings.deleteMany({ where: { officeId: id } });
    await prisma.auditLog.deleteMany({ where: { officeId: id } });

    // Unlink users from this office
    await prisma.user.updateMany({
      where: { officeId: id },
      data: { officeId: null },
    });

    await prisma.office.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting office:", error);
    return NextResponse.json(
      { error: "Failed to delete office" },
      { status: 500 }
    );
  }
}
