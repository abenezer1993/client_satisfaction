"use client";

import { useEffect, useState, use, useCallback } from "react";
import { KpiCard } from "@/components/shared/kpi-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DistributionChart } from "@/components/charts/distribution-chart";
import { BestPerformersCard } from "@/components/charts/best-performers-card";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { CreateUserDialog } from "@/components/shared/create-user-dialog";
import { ServicesManager } from "@/components/shared/services-manager";
import { Users, Star, MessageSquare, Activity, Wrench } from "lucide-react";

interface Office {
  id: string;
  name: string;
  description: string | null;
  _count: { members: number; feedbackGiven: number };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  createdAt: string;
  isAnonymous: boolean;
  author: { name: string; role: string } | null;
  targetUser: { name: string } | null;
  office?: { name: string } | null;
  service?: { name: string; category: { name: string } | null } | null;
  responses: any[];
}

export default function OfficeDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [office, setOffice] = useState<Office | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/users?officeId=${id}`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      const [analyticsData, feedbackData, usersData] = await Promise.all([
        fetch(`/api/analytics?officeId=${id}&period=30d`).then((r) => r.json()),
        fetch(`/api/feedback?officeId=${id}&limit=10`).then((r) => r.json()),
        fetch(`/api/users?officeId=${id}`).then((r) => r.json()),
      ]);

      setUsers(usersData);
      setAnalytics(analyticsData);
      setFeedback(feedbackData.feedback || []);
      setOffice({
        id,
        name: "Office",
        description: null,
        _count: {
          members: usersData.length,
          feedbackGiven: feedbackData.total || 0,
        },
      });
      setLoading(false);
    };

    loadData().catch(console.error);
  }, [id]);

  if (loading) {
    return (
      <div className="py-6 animate-fade-in">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-6">
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
    <div className="py-6 space-y-6 animate-fade-in">
      <div className="px-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {office?.name || "Office Dashboard"}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {office?.description || `Office overview and performance metrics`}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Office Rating"
              value={analytics ? `${Math.round(analytics.averageRating)}%` : "0%"}
              icon={Star}
              trend={analytics?.trend}
              trendValue={
                analytics
                  ? `${Math.round(analytics.recentAvg)}% vs ${Math.round(analytics.olderAvg)}%`
                  : ""
              }
              color="blue"
            />
            <KpiCard
              title="Feedback"
              value={analytics?.totalFeedback || 0}
              icon={MessageSquare}
              color="teal"
            />
            <KpiCard
              title="Team Members"
              value={users.length}
              icon={Users}
              color="amber"
            />
            <KpiCard
              title="Resolution Rate"
              value={
                analytics
                  ? `${Math.round((analytics.resolvedCount / analytics.totalFeedback) * 100)}%`
                  : "0%"
              }
              icon={Activity}
              color="slate"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Rating Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart
                  data={analytics?.trendData || []}
                  title="30-day trend"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart
                  data={analytics?.ratingDistribution || []}
                  title="Rating distribution"
                />
              </CardContent>
            </Card>
          </div>

          {/* Top Performers — full width */}
          <BestPerformersCard title="Top Performers" officeId={id} limit={10} />
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Office Members</CardTitle>
              <CreateUserDialog
                preselectedOfficeId={id}
                onUserCreated={() => fetchUsers()}
              />
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <EmptyState
                  title="No users yet"
                  description="Add users to this office to start collecting feedback."
                />
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        {user.role === "OFFICE_ADMIN"
                          ? "Admin"
                          : user.role === "OFFICE_USER"
                            ? "User"
                            : user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  title="No feedback yet"
                  description="Feedback submitted for this office will appear here."
                />
              </CardContent>
            </Card>
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
                targetName={item.targetUser?.name}
                serviceName={item.service?.name}
                serviceCategory={item.service?.category?.name}
                createdAt={item.createdAt}
                isAnonymous={item.isAnonymous}
                responseCount={item.responses?.length || 0}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4 text-slate-500" />
                Service Catalog
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesManager officeId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart
                  data={analytics?.trendData || []}
                  title="Rating trend over time"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart
                  data={analytics?.ratingDistribution || []}
                  title="How ratings are distributed"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
