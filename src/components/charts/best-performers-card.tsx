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
}

const periodOptions = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
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
}: BestPerformersCardProps) {
  const [period, setPeriod] = useState("month");
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ period, limit: String(limit) });
    if (officeId) params.set("officeId", officeId);

    fetch(`/api/analytics/best-performers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPerformers(data.performers || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, officeId, limit]);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-4 px-5">
        <div className="flex items-center gap-2 min-w-0">
          <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
          <CardTitle className="text-sm font-semibold truncate">
            {title || "Best Performers"}
          </CardTitle>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "px-2 py-1 text-xs font-medium rounded-md transition-colors",
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
      <CardContent className="px-5 pb-5 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : performers.length === 0 ? (
          <div className="text-center py-8">
            <Medal className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No performers yet</p>
            <p className="text-xs text-slate-400 mt-0.5">
              No feedback received in this period
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {performers.map((p) => (
              <div
                key={p.userId}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 transition-colors",
                  "hover:bg-slate-50"
                )}
              >
                {/* Rank */}
                <div className="w-6 shrink-0 text-center">
                  {p.rank <= 3 ? (
                    <Trophy
                      className={cn(
                        "h-4 w-4 mx-auto",
                        rankIcons[p.rank - 1]
                      )}
                    />
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400">
                      #{p.rank}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(p.userName)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate leading-tight">
                    {p.userName}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Star className="h-2.5 w-2.5 text-amber-400" />
                      {p.averageRatingPercent}%
                    </span>
                    <span className="shrink-0">·</span>
                    <span className="flex items-center gap-0.5 shrink-0">
                      <MessageSquare className="h-2.5 w-2.5" />
                      {p.feedbackCount}
                    </span>
                    {p.officeName && !officeId && (
                      <>
                        <span className="shrink-0">·</span>
                        <span className="truncate">{p.officeName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="shrink-0 text-right ml-1">
                  <div className="text-xs font-bold text-blue-600 leading-tight">
                    {p.weightedScorePercent}%
                  </div>
                  <div className="text-[9px] text-slate-400 leading-tight">
                    Score
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
