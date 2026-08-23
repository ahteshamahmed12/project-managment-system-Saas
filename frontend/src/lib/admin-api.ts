const API_BASE = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api"
).replace(/\/$/, "");

const TOKEN_KEY = "auth_token";

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

export interface AdminStats {
  users: number;
  projects: number;
  tasks: number;
  completed: number;
  sprints: number;
}

export interface ActivityLog {
  id: string;
  type: string;
  description: string;
  entity_type: string;
  entity_id: number;
  created_at: string;
  user: string;
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    return apiFetch<AdminStats>("/admin/stats");
  },

  getRecentActivity: async (limit = 20): Promise<ActivityLog[]> => {
    return apiFetch<ActivityLog[]>(`/activity/recent?limit=${limit}`);
  },
};
