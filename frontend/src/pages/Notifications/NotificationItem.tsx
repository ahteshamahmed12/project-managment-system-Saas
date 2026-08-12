import {
  Check,
  ClipboardCheck,
  FolderKanban,
  Settings,
  Users,
  Zap,
} from "lucide-react";

import type { Notification } from "./notificationData";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const NOTIFICATION_ICONS = {
  task: ClipboardCheck,
  project: FolderKanban,
  sprint: Zap,
  team: Users,
  system: Settings,
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];

  return (
    <div
      className={[
        "group flex gap-3 border-b border-border px-4 py-4 transition-colors",
        "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        !notification.read
          ? "bg-orange-50/60 dark:bg-orange-950/20"
          : "bg-background",
      ].join(" ")}
    >
      {/* Icon */}
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          !notification.read
            ? "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={[
                "text-sm",
                !notification.read
                  ? "font-semibold text-foreground"
                  : "font-medium text-foreground",
              ].join(" ")}
            >
              {notification.title}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {notification.message}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleString()}
            </p>
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <span
              className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500"
              aria-label="Unread notification"
            />
          )}
        </div>

        {/* Actions */}
        {(onMarkAsRead || onDelete) && (
          <div className="mt-3 flex items-center gap-3">
            {!notification.read && onMarkAsRead && (
              <button
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              >
                <Check className="h-3.5 w-3.5" />
                Mark as read
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(notification.id)}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
