import * as React from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";

import NotificationItem from "./NotificationItem";
import { useNotifications } from "@/context/NotificationsContext";

export default function NotificationDropdown() {
  const [open, setOpen] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  /* =========================================================
     CLOSE ON OUTSIDE CLICK
  ========================================================= */

  React.useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  /* =========================================================
     CLOSE ON ESC
  ========================================================= */

  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  /* =========================================================
     VIEW ALL
  ========================================================= */

  const handleViewAll = () => {
    setOpen(false);
    navigate("/notifications");
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell */}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((previous) => !previous)}
        className="relative rounded-full bg-card shadow-sm"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5 text-foreground" />

        {/* Unread Count */}

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown */}

      {open && (
        <div
          className="
            absolute right-0 top-full z-50 mt-3
            w-[calc(100vw-2rem)] max-w-md
            overflow-hidden rounded-2xl
            border border-border
            bg-card shadow-xl
          "
        >
          {/* Header */}

          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>

              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="
                    h-8 gap-1.5 rounded-lg px-2 text-xs
                    text-orange-600
                    hover:bg-orange-50
                    hover:text-orange-700
                    dark:text-orange-400
                    dark:hover:bg-orange-950/30
                  "
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="
                  h-8 w-8 rounded-lg
                  text-muted-foreground
                  hover:bg-muted
                "
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notification List */}

          <div
            className="
              max-h-105
              overflow-y-auto
              overscroll-contain
              scrollbar-none
            "
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>

                <p className="font-medium text-foreground">No notifications</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  You don't have any notifications right now.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="border-t border-border bg-card px-4 py-3">
            <button
              type="button"
              onClick={handleViewAll}
              className="
                w-full text-center text-sm font-medium
                text-orange-600
                transition-colors
                hover:text-orange-700
                dark:text-orange-400
                dark:hover:text-orange-300
              "
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
