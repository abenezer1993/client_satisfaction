"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { KpiCard } from "@/components/shared/kpi-card";
import { BarChart3, Star, MessageSquare } from "lucide-react";

export default function OfficeMetricsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/analytics?officeId=${id}&period=90d`)
      .then((r) => r.json())
      .then(setAnalytics)
      .catch(console.error);
  }, [id]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900">Office Metrics</h2>
      <p className="text-sm text-slate-500">Detailed analytics for this office</p>

      <div className="grid gap-6 sm:grid-cols-3">
        <KpiCard title="Average Rating" value={analytics ? `${Math.round(analytics.averageRating)}%` : "—"} icon={Star} color="blue" />
        <KpiCard title="Total Feedback" value={analytics?.totalFeedback || 0} icon={MessageSquare} color="teal" />
        <KpiCard title="Resolution Rate" value={analytics ? `${Math.round((analytics.resolvedCount / analytics.totalFeedback) * 100)}%` : "—"} icon={BarChart3} color="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">90-Day Trend</CardTitle></CardHeader>
          <CardContent><TrendChart data={analytics?.trendData || []} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Distribution</CardTitle></CardHeader>
          <CardContent><DistributionChart data={analytics?.ratingDistribution || []} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
