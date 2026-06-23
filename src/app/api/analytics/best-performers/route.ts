import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface PerformerEntry {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  officeId: string | null;
  officeName: string | null;
  sumRating: number;
  count: number;
  resolvedCount: number;
}

interface OfficeInfo {
  id: string;
  name: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "month";
    const officeId = searchParams.get("officeId") || null;
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Calculate start date based on period
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "week":
        // Start of current week (Monday)
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 1
        startDate = new Date(now);
        startDate.setDate(now.getDate() - diff);
        startDate.setHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Find the target users who received feedback in this period
    const where: Record<string, unknown> = {
      createdAt: { gte: startDate },
      targetUserId: { not: null },
    };

    // If office filter is applied, only include feedback for users in that office
    if (officeId) {
      where.officeId = officeId;
    }

    const feedback = await prisma.feedback.findMany({
      where,
      select: {
        rating: true,
        targetUserId: true,
        status: true,
        targetUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            officeId: true,
            office: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    // Group by target user and calculate stats
    const performerMap = new Map<string, PerformerEntry>();

    for (const f of feedback) {
      if (!f.targetUserId || !f.targetUser) continue;

      const existing = performerMap.get(f.targetUserId) || {
        userId: f.targetUserId,
        userName: f.targetUser.name,
        userEmail: f.targetUser.email,
        userRole: f.targetUser.role,
        officeId: f.targetUser.officeId,
        officeName: f.targetUser.office?.name || null,
        sumRating: 0,
        count: 0,
        resolvedCount: 0,
      };

      existing.sumRating += f.rating;
      existing.count += 1;
      if (f.status === "RESOLVED") {
        existing.resolvedCount += 1;
      }

      performerMap.set(f.targetUserId, existing);
    }

    // Calculate global average for Bayesian correction
    const allRatings = feedback.filter((f) => f.targetUserId != null);
    const globalSum = allRatings.reduce((s, f) => s + f.rating, 0);
    const globalCount = allRatings.length;
    const globalAverage = globalCount > 0 ? globalSum / globalCount : 3.0;

    // Bayesian constant — higher = more feedback needed to deviate from average
    const BAYESIAN_C = 5;

    // Convert to array and calculate weighted scores
    const performers = Array.from(performerMap.values())
      .map((p) => {
        const avgRating = p.count > 0 ? p.sumRating / p.count : 0;
        // Bayesian Average: pulls scores toward global average when feedback count is low
        const weightedScore =
          (p.sumRating + BAYESIAN_C * globalAverage) / (p.count + BAYESIAN_C);
        const avgPercent = Math.round(avgRating * 20);
        const scorePercent = Math.round(weightedScore * 20);

        return {
          userId: p.userId,
          userName: p.userName,
          userEmail: p.userEmail,
          userRole: p.userRole,
          officeId: p.officeId,
          officeName: p.officeName,
          averageRating: Math.round(avgRating * 10) / 10,
          averageRatingPercent: avgPercent,
          feedbackCount: p.count,
          resolvedCount: p.resolvedCount,
          weightedScore: Math.round(weightedScore * 100) / 100,
          weightedScorePercent: scorePercent,
        };
      })
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, limit)
      .map((p, i) => ({
        ...p,
        rank: i + 1,
      }));

    return NextResponse.json({
      performers,
      period,
      globalAverage: Math.round(globalAverage * 10) / 10,
      globalAveragePercent: Math.round(globalAverage * 20),
      totalEligibleUsers: performerMap.size,
    });
  } catch (error) {
    console.error("Error fetching best performers:", error);
    return NextResponse.json(
      { error: "Failed to fetch best performers" },
      { status: 500 }
    );
  }
}
