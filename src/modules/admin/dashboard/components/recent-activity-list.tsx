import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import type { RecentActivity } from "../types";

interface RecentActivityListProps {
  activities: RecentActivity[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest changes across your catalog</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex items-start justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="truncate text-sm text-muted-foreground" title={activity.target}>
                    {activity.target}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {activity.timestamp}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
