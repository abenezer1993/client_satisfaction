"use client";

import { useEffect, useState } from "react";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, Filter, RefreshCw } from "lucide-react";

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

export default function FeedbackFeedPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") params.set("status", statusFilter.toUpperCase());

      const res = await fetch(`/api/feedback?${params}`);
      const data = await res.json();
      setFeedback(data.feedback || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const filteredFeedback = feedback.filter((item) => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        item.comment?.toLowerCase().includes(searchLower) ||
        item.author?.name?.toLowerCase().includes(searchLower) ||
        item.targetUser?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (ratingFilter !== "all" && item.rating !== parseInt(ratingFilter))
      return false;
    return true;
  });

  const handleResolve = async (id: string) => {
    try {
      await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      fetchFeedback();
    } catch (error) {
      console.error("Error resolving feedback:", error);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Feedback</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total} total feedback items
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search feedback..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => (
              <SelectItem key={r} value={r.toString()}>
                {r} Star{r > 1 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="md" onClick={fetchFeedback}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-full bg-slate-200" />
                  <div>
                    <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
              </div>
            ))}
          </div>
        ) : filteredFeedback.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                title="No feedback found"
                description={
                  search || statusFilter !== "all" || ratingFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No feedback has been submitted yet"
                }
              />
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <FeedbackCard
              key={item.id}
              id={item.id}
              rating={item.rating}
              comment={item.comment}
              status={item.status}
              authorName={item.author?.name}
              authorRole={item.author?.role}
              targetName={item.targetUser?.name}
              officeName={item.office?.name}
              serviceName={item.service?.name}
              serviceCategory={item.service?.category?.name}
              createdAt={item.createdAt}
              isAnonymous={item.isAnonymous}
              responseCount={item.responses?.length || 0}
              onResolve={handleResolve}
            />
          ))
        )}
      </div>
    </div>
  );
}
