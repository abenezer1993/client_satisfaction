"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, TrendingUp, Activity } from "lucide-react";

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  isAnonymous: boolean;
  author: { name: string; role: string } | null;
  targetUser: { name: string } | null;
  responses: any[];
}

export default function ProfileDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?period=30d").then((r) => r.json()),
      fetch("/api/feedback?limit=10").then((r) => r.json()),
    ])
      .then(([analyticsData, feedbackData]) => {
        setAnalytics(analyticsData);
        setFeedback(feedbackData.feedback || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Performance</h2>
        <p className="text-sm text-slate-500 mt-1">
          Your personal satisfaction metrics and feedback
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="My Average Rating"
          value={analytics ? `${Math.round(analytics.averageRating)}%` : "0%"}
          icon={Star}
          trend={analytics?.trend}
          trendValue={analytics?.trend === "up" ? "Improving" : "Declining"}
          color="blue"
        />
        <KpiCard
          title="Total Feedback"
          value={analytics?.totalFeedback || 0}
          icon={MessageSquare}
          color="teal"
        />
        <KpiCard
          title="Recent Rating"
          value={analytics ? `${Math.round(analytics.recentAvg)}%` : "0%"}
          icon={TrendingUp}
          trend={analytics?.trend}
          trendValue="Recent period"
          color="amber"
        />
        <KpiCard
          title="Resolved"
          value={analytics?.resolvedCount || 0}
          icon={Activity}
          color="slate"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={analytics?.trendData || []} title="My performance over time" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart data={analytics?.ratingDistribution || []} title="Rating distribution" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">
              No feedback received yet.
            </p>
          ) : (
            feedback.map((item) => (
              <FeedbackCard
                key={item.id}
                id={item.id}
                rating={item.rating}
                comment={item.comment}
                status={item.status}
                authorName={item.author?.name}
                authorRole={item.author?.role}
                createdAt={item.createdAt}
                isAnonymous={item.isAnonymous}
                responseCount={item.responses?.length || 0}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
