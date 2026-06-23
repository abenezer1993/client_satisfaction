"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import {
  Trophy,
  Medal,
  Loader2,
  Star,
  MessageSquare,
} from "lucide-react";

interface Performer {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  officeId: string | null;
  officeName: string | null;
  averageRating: number;
  averageRatingPercent: number;
  feedbackCount: number;
  resolvedCount: number;
  weightedScore: number;
  weightedScorePercent: number;
}

interface BestPerformersCardProps {
  title?: string;
  officeId?: string;
  limit?: number;
  className?: string;
  compact?: boolean;
}

const periodOptions = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
];

const rankStyles = [
  "bg-amber-100 text-amber-700 border-amber-300", // 1st - gold
  "bg-slate-100 text-slate-600 border-slate-300",  // 2nd - silver
  "bg-orange-100 text-orange-700 border-orange-300", // 3rd - bronze
];

const rankIcons = [
  "text-amber-500",
  "text-slate-400",
  "text-orange-600",
];

export function BestPerformersCard({
  title = "Best Performers",
  officeId,
  limit = 5,
  className,
  compact = false,
}: BestPerformersCardProps) {
  const [period, setPeriod] = useState("month");
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalAvg, setGlobalAvg] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period, limit: String(limit) });
    if (officeId) params.set("officeId", officeId);

    fetch(`/api/analytics/best-performers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPerformers(data.performers || []);
        setGlobalAvg(data.globalAveragePercent || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, officeId, limit]);

  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <div className="flex gap-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-colors",
                period === opt.value
                  ? "bg-blue-100 text-blue-700"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : performers.length === 0 ? (
          <div className="text-center py-10">
            <Medal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No performers yet</p>
            <p className="text-xs text-slate-400 mt-1">
              No feedback received in this period
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {performers.map((p) => (
              <div
                key={p.userId}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  "hover:bg-slate-50",
                  p.rank <= 3 && "bg-slate-50/50"
                )}
              >
                {/* Rank Badge */}
                <div className="flex-shrink-0 w-8 text-center">
                  {p.rank <= 3 ? (
                    <Trophy
                      className={cn(
                        "h-5 w-5 mx-auto",
                        rankIcons[p.rank - 1]
                      )}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">
                      #{p.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(p.userName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {p.userName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-amber-400" />
                      {p.averageRatingPercent}%
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5">
                      <MessageSquare className="h-3 w-3" />
                      {p.feedbackCount}
                    </span>
                    {p.officeName && !officeId && (
                      <>
                        <span>·</span>
                        <span>{p.officeName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {p.weightedScorePercent}%
                  </div>
                  <div className="text-[10px] text-slate-400">Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
