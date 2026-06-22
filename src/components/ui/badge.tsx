import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-slate-100 text-slate-800": variant === "default",
          "bg-emerald-50 text-emerald-700 border border-emerald-200":
            variant === "success",
          "bg-amber-50 text-amber-700 border border-amber-200":
            variant === "warning",
          "bg-red-50 text-red-700 border border-red-200": variant === "danger",
          "bg-blue-50 text-blue-700 border border-blue-200": variant === "info",
          "border border-slate-300 text-slate-600": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
