import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import { cn } from "@/modules/common/utils";
import type { DashboardStat } from "../types";

const trendConfig = {
  up: {
    icon: ArrowUpRight,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  down: {
    icon: ArrowDownRight,
    className: "text-red-600 dark:text-red-400",
  },
  neutral: {
    icon: Minus,
    className: "text-muted-foreground",
  },
} satisfies Record<
  DashboardStat["trend"],
  { icon: LucideIcon; className: string }
>;

interface StatCardProps {
  stat: DashboardStat;
}

export function StatCard({ stat }: StatCardProps) {
  const trend = trendConfig[stat.trend];
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
        <div className={cn("mt-1 flex items-center gap-1 text-xs", trend.className)}>
          <TrendIcon className="size-3.5" />
          <span>{stat.change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
