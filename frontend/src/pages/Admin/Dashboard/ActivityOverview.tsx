import { Clock3 } from "lucide-react";

import type { ActivityOverviewItem } from "./adminDashboardData";

interface ActivityOverviewProps {
  activities: ActivityOverviewItem[];
}

export default function ActivityOverview({
  activities,
}: ActivityOverviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Latest actions performed across the system.
        </p>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-1">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                <Clock3 className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{activity.user}</span>{" "}
                  <span className="text-muted-foreground">
                    {activity.action}
                  </span>{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No recent activity.
        </div>
      )}
    </div>
  );
}
