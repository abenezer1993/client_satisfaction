"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "./rating-stars";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FEEDBACK_STATUS_LABELS,
  FEEDBACK_STATUS_COLORS,
} from "@/lib/constants";
import { formatDateTime, getTimeAgo, getInitials } from "@/lib/utils";
import {
  MessageSquare,
  MoreHorizontal,
  CheckCircle2,
  Reply,
} from "lucide-react";

interface FeedbackCardProps {
  id: string;
  rating: number;
  comment?: string | null;
  status: string;
  authorName?: string | null;
  authorRole?: string | null;
  targetName?: string | null;
  officeName?: string | null;
  serviceName?: string | null;
  serviceCategory?: string | null;
  createdAt: Date | string;
  isAnonymous?: boolean;
  responseCount?: number;
  onRespond?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export function FeedbackCard({
  id,
  rating,
  comment,
  status,
  authorName,
  authorRole,
  targetName,
  officeName,
  serviceName,
  serviceCategory,
  createdAt,
  isAnonymous,
  responseCount = 0,
  onRespond,
  onResolve,
}: FeedbackCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {isAnonymous ? (
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-slate-200 text-slate-500">
                  ?
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {authorName ? getInitials(authorName) : "?"}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isAnonymous ? "Anonymous" : authorName || "Unknown"}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {authorRole && <span>{authorRole}</span>}
                {officeName && (
                  <>
                    <span>·</span>
                    <span>{officeName}</span>
                  </>
                )}
                <span>·</span>
                <span title={formatDateTime(createdAt)}>
                  {getTimeAgo(createdAt)}
                </span>
              </div>
            </div>
          </div>
          <Badge className={FEEDBACK_STATUS_COLORS[status] || ""}>
            {FEEDBACK_STATUS_LABELS[status] || status}
          </Badge>
        </div>

        <RatingStars rating={rating} size="sm" />

        {comment && (
          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            {comment}
          </p>
        )}

        {targetName && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>
              Feedback for <strong className="text-slate-700">{targetName}</strong>
            </span>
          </div>
        )}
        {serviceName && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Service: {serviceName}
              {serviceCategory && (
                <span className="text-blue-400">· {serviceCategory}</span>
              )}
            </span>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {responseCount > 0 && (
            <span className="text-xs text-slate-500">
              {responseCount} response{responseCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRespond && status !== "RESOLVED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRespond(id)}
              className="text-xs"
            >
              <Reply className="h-3.5 w-3.5 mr-1" />
              Respond
            </Button>
          )}
          {onResolve && status !== "RESOLVED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResolve(id)}
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
