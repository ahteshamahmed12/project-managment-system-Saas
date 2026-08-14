import * as React from "react";
import { notificationData, type Notification } from "@/pages/Notifications/notificationData";
import { connectWebSocket, disconnectWebSocket } from "@/lib/websocket";
import { useAuth } from "@/context/AuthContext";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationsContext = React.createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = React.useState<Notification[]>(notificationData);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const socket = connectWebSocket((message) => {
      try {
        const parsed = JSON.parse(message) as Notification;
        if (parsed && parsed.id) setNotifications((prev) => [parsed, ...prev]);
      } catch {
        // Ignore non-notification socket messages.
      }
    });
    return () => {
      socket?.close();
      disconnectWebSocket();
    };
  }, [isAuthenticated]);

  const unreadCount = React.useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const addNotification = React.useCallback((notification: Notification) => setNotifications((prev) => [notification, ...prev]), []);
  const markAsRead = React.useCallback((id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n)), []);
  const markAllAsRead = React.useCallback(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))), []);
  const deleteNotification = React.useCallback((id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id)), []);
  const clearNotifications = React.useCallback(() => setNotifications([]), []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification, clearNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
}
