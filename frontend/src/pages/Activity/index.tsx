import * as React from "react";
import ActivitySection from "@/components/activity/ActivitySection";
import { activityData as fallbackActivityData, type Activity } from "@/components/activity/activityData";
import { adminApi, type ActivityLog } from "@/lib/admin-api";

export default function ActivityPage() {
  const [activities, setActivities] = React.useState<Activity[]>(fallbackActivityData);

  React.useEffect(() => {
    let cancelled = false;

    adminApi
      .getRecentActivity(50)
      .then((data: ActivityLog[]) => {
        if (!cancelled && data && data.length > 0) {
          const mapped: Activity[] = data.map((item, idx) => ({
            id: item.id || `activity-${idx}`,
            type: item.type === "sprint_update" ? "project_updated" : "task_updated",
            user: {
              id: `user-${idx}`,
              name: item.user || "Team Member",
            },
            message: item.description ? item.description.replace(/^Task '.*?' status is /, "updated status to ") : "updated status",
            target: item.entity_type === "task" ? "Task" : "Sprint",
            created_at: item.created_at || new Date().toISOString(),
          }));
          setActivities(mapped);
        }
      })
      .catch(() => {
        // Keep fallback data
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Activity
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          View recent activity across your projects and tasks.
        </p>
      </div>

      {/* Activity List */}
      <ActivitySection activities={activities} />
    </div>
  );
}
