"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: RatingStarsProps) {
  const stars = Array.from({ length: maxRating }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      <div className="flex">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && onChange?.(star)}
            className={cn(
              "transition-all duration-150",
              interactive
                ? "cursor-pointer hover:scale-110"
                : "cursor-default",
              star <= rating
                ? "text-amber-400 fill-amber-400"
                : "text-slate-200 fill-slate-200"
            )}
          >
            <Star className={cn(sizeMap[size], "fill-current")} />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-slate-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
