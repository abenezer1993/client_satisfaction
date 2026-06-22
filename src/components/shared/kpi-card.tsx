import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "teal" | "amber" | "slate";
}

const colorMap = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    text: "text-blue-700",
  },
  teal: {
    bg: "bg-teal-50",
    icon: "text-teal-600",
    text: "text-teal-700",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-600",
    text: "text-amber-700",
  },
  slate: {
    bg: "bg-slate-50",
    icon: "text-slate-600",
    text: "text-slate-700",
  },
};

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
}: KpiCardProps) {
  const colors = colorMap[color];

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {description && (
              <p className="text-xs text-slate-400">{description}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center gap-1 pt-1">
                {trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                ) : trend === "down" ? (
                  <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                ) : null}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" && "text-emerald-600",
                    trend === "down" && "text-red-600",
                    trend === "neutral" && "text-slate-500"
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-3", colors.bg)}>
              <Icon className={cn("h-5 w-5", colors.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
