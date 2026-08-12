import ActivitySection from "@/components/activity/ActivitySection";
import { activityData } from "@/components/activity/activityData";

export default function TeamActivityPage() {
  // Abhi dummy data use ho raha hai.
  // API connect hone par yahan team-specific activities filter/fetch hongi.
  const teamActivities = activityData.filter(
    (activity) =>
      activity.user.id === "user-1" ||
      activity.user.id === "user-2" ||
      activity.user.id === "user-3",
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Team Activity
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Track recent activities and updates from your team members.
        </p>
      </div>

      {/* Team Activities */}
      <ActivitySection activities={teamActivities} title="Team Activity" />
    </div>
  );
}
