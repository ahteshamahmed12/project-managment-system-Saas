import * as React from "react";

import ActivityItem from "./ActivityItem";
import type { Activity } from "./activityData";

interface ActivitySectionProps {
  activities: Activity[];
  title?: string;
}

export default function ActivitySection({
  activities,
  title = "Recent Activity",
}: ActivitySectionProps): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Recent actions and updates
          </p>
        </div>

        <span className="text-xs text-muted-foreground">
          {activities.length}{" "}
          {activities.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      {/* Activities */}
      {activities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium text-foreground">No activity yet</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Recent project and task activity will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </section>
  );
}
