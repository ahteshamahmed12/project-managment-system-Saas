import { CheckCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import NotificationList from "./NotificationList";

import { useNotifications } from "@/context/NotificationsContext";

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Notifications
            </h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Stay updated with your latest activities and alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={markAllAsRead}
            className="w-full gap-2 rounded-xl border-border sm:w-auto"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notification List */}

      <NotificationList
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    </div>
  );
}
