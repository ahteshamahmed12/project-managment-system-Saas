import {
  CheckCircle2,
  FileUp,
  FolderKanban,
  MessageCircle,
  Pencil,
  Plus,
  UserPlus,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { Activity } from "./activityData";

interface ActivityItemProps {
  activity: Activity;
}

const ACTIVITY_ICONS: Record<
  Activity["type"],
  React.ComponentType<{ className?: string }>
> = {
  project_created: FolderKanban,
  project_updated: Pencil,
  task_created: Plus,
  task_updated: Pencil,
  task_completed: CheckCircle2,
  comment_added: MessageCircle,
  file_uploaded: FileUp,
  member_added: UserPlus,
};

const ACTIVITY_STYLES: Record<Activity["type"], string> = {
  project_created:
    "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  project_updated:
    "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  task_created:
    "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  task_updated:
    "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  task_completed:
    "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  comment_added:
    "bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  file_uploaded:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-400",
  member_added:
    "bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400",
};

function formatActivityTime(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ActivityItem({
  activity,
}: ActivityItemProps): React.JSX.Element {
  const Icon = ACTIVITY_ICONS[activity.type];

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted/30">
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          ACTIVITY_STYLES[activity.type],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-5 text-foreground">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">{activity.message}</span>{" "}
          {activity.target && (
            <span className="font-medium text-foreground">
              {activity.target}
            </span>
          )}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {formatActivityTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
