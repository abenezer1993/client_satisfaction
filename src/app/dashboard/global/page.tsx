"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, Star, MessageSquare } from "lucide-react";

interface Analytics {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: { rating: string; count: number; percentage: number }[];
  trendData: { date: string; average: number; count: number }[];
  resolvedCount: number;
  openCount: number;
  trend: "up" | "down" | "neutral";
  recentAvg: number;
  olderAvg: number;
}

interface Office {
  id: string;
  name: string;
  _count: { members: number; feedbackGiven: number };
}

export default function GlobalAdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/analytics?period=30d").then((r) => r.json()),
      fetch("/api/offices").then((r) => r.json()),
    ])
      .then(([analyticsData, officesData]) => {
        setAnalytics(analyticsData);
        setOffices(officesData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse"
            >
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
        <h2 className="text-2xl font-bold text-slate-900">
          Global Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Organization-wide overview and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Overall Rating"
          value={analytics?.averageRating.toFixed(1) || "0.0"}
          icon={Star}
          trend={analytics?.trend}
          trendValue={
            analytics
              ? `${analytics.recentAvg.toFixed(1)} vs ${analytics.olderAvg.toFixed(1)}`
              : ""
          }
          color="blue"
        />
        <KpiCard
          title="Total Feedback"
          value={analytics?.totalFeedback || 0}
          icon={MessageSquare}
          trend="up"
          trendValue={`${analytics?.openCount || 0} open`}
          color="teal"
        />
        <KpiCard
          title="Offices"
          value={offices.length}
          icon={Building2}
          description={
            offices.reduce((sum, o) => sum + o._count.members, 0) +
            " total users"
          }
          color="amber"
        />
        <KpiCard
          title="Resolved"
          value={analytics?.resolvedCount || 0}
          icon={Users}
          trend="neutral"
          trendValue={`${analytics ? Math.round((analytics.resolvedCount / analytics.totalFeedback) * 100) : 0}% resolution rate`}
          color="slate"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={analytics?.trendData || []}
              title="Average rating over the last 30 days"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart
              data={analytics?.ratingDistribution || []}
              title="Distribution of ratings"
            />
          </CardContent>
        </Card>
      </div>

      {/* Offices List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Offices Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {offices.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No offices configured yet. Add your first office to get started.
              </p>
            ) : (
              offices.map((office) => (
                <div
                  key={office.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {office.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {office._count.members} members ·{" "}
                        {office._count.feedbackGiven} feedback items
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/dashboard/office/${office.id}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Office
                  </a>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
