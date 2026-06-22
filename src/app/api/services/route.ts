import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");

    if (!officeId) {
      return NextResponse.json(
        { error: "officeId is required" },
        { status: 400 }
      );
    }

    const services = await prisma.service.findMany({
      where: { officeId, isActive: true },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, categoryId, officeId } = body;

    if (!name || !officeId) {
      return NextResponse.json(
        { error: "Name and officeId are required" },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const lastService = await prisma.service.findFirst({
      where: { officeId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        categoryId: categoryId || null,
        officeId,
        sortOrder: (lastService?.sortOrder ?? -1) + 1,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}
