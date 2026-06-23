import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface FeedbackRecord {
  id: string;
  rating: number;
  status: string;
  createdAt: Date;
  officeId: string | null;
}

interface TrendEntry {
  total: number;
  count: number;
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const officeId = searchParams.get("officeId");
    const period = searchParams.get("period") || "30d";

    const now = new Date();
    let startDate: Date;
    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: Record<string, unknown> = {
      createdAt: { gte: startDate },
    };

    if (officeId) where.officeId = officeId;

    if (session?.user) {
      const userRole = (session.user as Record<string, unknown>).role as string;
      const userOfficeId = (session.user as Record<string, unknown>).officeId as string | null;

      if (userRole === "OFFICE_ADMIN" && userOfficeId) {
        where.officeId = where.officeId || userOfficeId;
      } else if (userRole === "OFFICE_USER") {
        where.targetUserId = session.user.id;
      }
    }

    const feedback = await prisma.feedback.findMany({
      where,
      select: {
        id: true,
        rating: true,
        status: true,
        createdAt: true,
        officeId: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalFeedback = feedback.length;
    const averageRating =
      totalFeedback > 0
        ? feedback.reduce((sum: number, f: FeedbackRecord) => sum + f.rating, 0) / totalFeedback
        : 0;
    const ratingDistribution = [0, 0, 0, 0, 0];
    feedback.forEach((f: FeedbackRecord) => {
      ratingDistribution[f.rating - 1]++;
    });

    const midPoint = new Date(
      startDate.getTime() + (now.getTime() - startDate.getTime()) / 2
    );
    const recentFeedback = feedback.filter((f: FeedbackRecord) => f.createdAt >= midPoint);
    const olderFeedback = feedback.filter((f: FeedbackRecord) => f.createdAt < midPoint);

    // Convert 1-5 scale to percentage (0-100%)
    const toPercent = (val: number) => Math.round(val * 20 * 10) / 10;

    const recentAvg =
      recentFeedback.length > 0
        ? recentFeedback.reduce((s: number, f: FeedbackRecord) => s + f.rating, 0) / recentFeedback.length
        : 0;
    const olderAvg =
      olderFeedback.length > 0
        ? olderFeedback.reduce((s: number, f: FeedbackRecord) => s + f.rating, 0) / olderFeedback.length
        : 0;

    const trendMap = new Map<string, TrendEntry>();
    feedback.forEach((f: FeedbackRecord) => {
      const dateKey = f.createdAt.toISOString().split("T")[0];
      const existing = trendMap.get(dateKey) || { total: 0, count: 0 };
      existing.total += f.rating;
      existing.count++;
      trendMap.set(dateKey, existing);
    });

    const trendData = Array.from(trendMap.entries())
      .sort(([a]: [string, TrendEntry], [b]: [string, TrendEntry]) => a.localeCompare(b))
      .map(([date, entry]: [string, TrendEntry]) => ({
        date,
        average: toPercent(entry.total / entry.count),
        count: entry.count,
      }));

    const distributionData = ratingDistribution.map((count: number, i: number) => ({
      rating: `${(i + 1) * 20}%`,
      count,
      percentage:
        totalFeedback > 0 ? Math.round((count / totalFeedback) * 100) : 0,
    }));

    return NextResponse.json({
      totalFeedback,
      averageRating: toPercent(averageRating),
      ratingDistribution: distributionData,
      trendData,
      recentAvg: toPercent(recentAvg),
      olderAvg: toPercent(olderAvg),
      trend:
        toPercent(recentAvg) > toPercent(olderAvg) ? "up" : toPercent(recentAvg) < toPercent(olderAvg) ? "down" : "neutral",
      resolvedCount: feedback.filter((f: FeedbackRecord) => f.status === "RESOLVED").length,
      openCount: feedback.filter((f: FeedbackRecord) => f.status !== "RESOLVED").length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
