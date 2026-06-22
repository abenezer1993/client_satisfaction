import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");
    const targetUserId = searchParams.get("targetUserId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (officeId) where.officeId = officeId;
    if (targetUserId) where.targetUserId = targetUserId;
    if (status) where.status = status;

    // Role-based filtering
    if (session?.user) {
      const userRole = (session.user as any).role;
      const userOfficeId = (session.user as any).officeId;

      if (userRole === "OFFICE_USER") {
        where.OR = [
          { targetUserId: session.user.id },
          { authorId: session.user.id },
        ];
      } else if (userRole === "OFFICE_ADMIN" && userOfficeId) {
        where.officeId = where.officeId || userOfficeId;
      }
    }

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, role: true } },
          targetUser: { select: { id: true, name: true } },
          office: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, category: { select: { name: true } } } },
          responses: {
            include: {
              author: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json({ feedback, total, limit, offset });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { rating, comment, targetUserId, officeId, serviceId, isAnonymous, contactEmail } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        rating,
        comment: comment || null,
        targetUserId: targetUserId || null,
        officeId: officeId || null,
        serviceId: serviceId || null,
        isAnonymous: isAnonymous || false,
        contactEmail: contactEmail || null,
        authorId: session?.user?.id || null,
        status: "NEW",
      },
    });

    // Create notifications for relevant users
    if (targetUserId && targetUserId !== session?.user?.id) {
      await prisma.notification.create({
        data: {
          type: "NEW_FEEDBACK",
          title: "New Feedback Received",
          message: `You've received new feedback${isAnonymous ? " (anonymous)" : ""}`,
          link: `/dashboard/feedback?feedbackId=${feedback.id}`,
          userId: targetUserId,
          feedbackId: feedback.id,
        },
      });
    }

    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
