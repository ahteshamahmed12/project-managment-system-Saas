import ActivitySection from "@/components/activity/ActivitySection";
import { activityData } from "@/components/activity/activityData";

export default function ActivityPage() {
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
      <ActivitySection activities={activityData} />
    </div>
  );
}
