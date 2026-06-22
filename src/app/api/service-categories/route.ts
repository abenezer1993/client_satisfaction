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

    const categories = await prisma.serviceCategory.findMany({
      where: { officeId },
      include: {
        _count: { select: { services: true } },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch service categories" },
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
    const { name, description, officeId } = body;

    if (!name || !officeId) {
      return NextResponse.json(
        { error: "Name and officeId are required" },
        { status: 400 }
      );
    }

    // Get the highest sort order
    const lastCategory = await prisma.serviceCategory.findFirst({
      where: { officeId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description: description || null,
        officeId,
        sortOrder: (lastCategory?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating service category:", error);
    return NextResponse.json(
      { error: "Failed to create service category" },
      { status: 500 }
    );
  }
}
