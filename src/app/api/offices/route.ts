import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const offices = await prisma.office.findMany({
      include: {
        _count: {
          select: { members: true, feedbackGiven: true },
        },
        settings: true,
        parent: {
          select: { id: true, name: true },
        },
        children: {
          select: { id: true, name: true, _count: { select: { members: true } } },
        },
        globalAdmin: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(offices);
  } catch (error) {
    console.error("Error fetching offices:", error);
    return NextResponse.json(
      { error: "Failed to fetch offices" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, globalAdminId, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Office name is required" },
        { status: 400 }
      );
    }

    const office = await prisma.office.create({
      data: {
        name,
        description: description || null,
        globalAdminId: globalAdminId || null,
        parentId: parentId || null,
      },
    });

    // Create default settings for the new office
    await prisma.officeSettings.create({
      data: {
        officeId: office.id,
      },
    });

    return NextResponse.json(office, { status: 201 });
  } catch (error) {
    console.error("Error creating office:", error);
    return NextResponse.json(
      { error: "Failed to create office" },
      { status: 500 }
    );
  }
}
