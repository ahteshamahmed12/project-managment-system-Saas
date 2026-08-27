import * as React from "react";
import { useAuth } from "@/context/AuthContext";
import {
  notificationsApi,
  getNotificationsWsUrl,
  type BackendNotification,
} from "@/lib/notifications-api";
import type { Notification } from "@/pages/Notifications/notificationData";

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;

  addNotification: (notification: Notification) => void;

  markAsRead: (id: string) => void;

  markAllAsRead: () => void;

  deleteNotification: (id: string) => void;

  clearNotifications: () => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const NotificationsContext = React.createContext<
  NotificationsContextValue | undefined
>(undefined);

/* =========================================================
   PROVIDER
========================================================= */

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);

  /* =======================================================
     LOAD NOTIFICATIONS FROM THE BACKEND
  ======================================================= */

  React.useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    notificationsApi
      .list()
      .then((fetched) => {
        if (!cancelled) {
          setNotifications(fetched as Notification[]);
        }
      })
      .catch(() => {
        // API error — start with an empty list.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  /* =======================================================
     REAL-TIME UPDATES VIA WEBSOCKET
  ======================================================= */

  React.useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = () => {
      if (cancelled) return;

      socket = new WebSocket(getNotificationsWsUrl());

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message?.type === "notification" && message.data) {
            const incoming = message.data as BackendNotification;
            setNotifications((prev) => {
              if (prev.some((n) => n.id === incoming.id)) return prev;
              return [incoming as Notification, ...prev];
            });
          }
        } catch {
          // Ignore malformed messages.
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        reconnectTimer = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [isAuthenticated]);

  /* =======================================================
     UNREAD COUNT
  ======================================================= */

  const unreadCount = React.useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  /* =======================================================
      ADD NOTIFICATION
  ======================================================= */

  const addNotification = React.useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  /* =======================================================
      MARK AS READ
  ======================================================= */

  const markAsRead = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification,
      ),
    );

    notificationsApi.markRead(id).catch(() => {});
  }, []);

  /* =======================================================
      MARK ALL AS READ
  ======================================================= */

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );

    notificationsApi.markAllRead().catch(() => {});
  }, []);

  /* =======================================================
      DELETE NOTIFICATION
  ======================================================= */

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );

    notificationsApi.remove(id).catch(() => {});
  }, []);

  /* =======================================================
      CLEAR ALL NOTIFICATIONS
  ======================================================= */

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);

    notificationsApi.clear().catch(() => {});
  }, []);

  /* =======================================================
      CONTEXT VALUE
  ======================================================= */

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
      loading,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const context = React.useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  }

  return context;
}
