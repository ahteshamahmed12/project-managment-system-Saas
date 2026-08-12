import * as React from "react";

import {
  notificationData,
  type Notification,
} from "@/pages/Notifications/notificationData";

/* =========================================================
   CONTEXT TYPE
========================================================= */

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;

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
  const [notifications, setNotifications] =
    React.useState<Notification[]>(notificationData);

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
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  }, []);

  /* =======================================================
     MARK ALL AS READ
  ======================================================= */

  const markAllAsRead = React.useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }, []);

  /* =======================================================
     DELETE NOTIFICATION
  ======================================================= */

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  /* =======================================================
     CLEAR ALL NOTIFICATIONS
  ======================================================= */

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearNotifications,
    }),
    [
      notifications,
      unreadCount,
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
