import type { NotificationType } from "@/pages/Notifications/notificationData";

const API_BASE = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api"
).replace(/\/$/, "");

const TOKEN_KEY = "auth_token";

export interface BackendNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType | string;
  read: boolean;
  created_at: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export interface CreateNotificationPayload {
  user_id: string;
  title: string;
  message: string;
  type?: NotificationType | string;
}

export const notificationsApi = {
  list: () => apiFetch<BackendNotification[]>("/notifications"),

  create: (payload: CreateNotificationPayload) =>
    apiFetch<BackendNotification>("/notifications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  markRead: (id: string) =>
    apiFetch<BackendNotification>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    apiFetch<{ success: boolean }>("/notifications/read-all", {
      method: "POST",
    }),

  remove: (id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}`, {
      method: "DELETE",
    }),

  clear: () =>
    apiFetch<{ success: boolean }>("/notifications", {
      method: "DELETE",
    }),
};

/** Build the websocket URL used to receive real-time notifications. */
export function getNotificationsWsUrl(): string {
  const base =
    (import.meta.env.VITE_API_URL ??
      import.meta.env.VITE_API_BASE_URL ??
      "/api") + "";

  const httpBase = base.replace(/\/$/, "");
  const wsBase = httpBase
    .replace(/^http:\/\//i, "ws://")
    .replace(/^https:\/\//i, "wss://");

  // Strip a trailing /api if present. /ws lives at the server root.
  const root = wsBase.replace(/\/api\/?$/i, "");

  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  return `${root}/ws/notifications?token=${encodeURIComponent(token)}`;
}
