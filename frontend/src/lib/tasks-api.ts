import type { Task, TaskPriority, TaskStatus } from "@/pages/Tasks/taskData";

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
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/admin/login") {
        window.location.href = "/login";
      }
    }

    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

export interface BackendTask {
  id: number;
  project_id: number;
  sprint_id?: number | null;
  title: string;
  description?: string | null;
  status: string;
  priority?: string | null;
  story_points?: number | null;
  assigned_to?: string | null;
  due_date?: string | null;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function normalizeStatus(status: string): TaskStatus {
  const s = status.toLowerCase();
  if (s === "in_progress" || s === "in progress") return "In Progress";
  if (s === "in_review" || s === "review") return "Review";
  if (s === "done" || s === "completed") return "Completed";
  return "Todo";
}

function normalizePriority(priority?: string | null): TaskPriority {
  const p = (priority ?? "").toLowerCase();
  if (p === "high" || p === "critical") return "High";
  if (p === "low") return "Low";
  return "Medium";
}

export function mapBackendTaskToFrontend(raw: BackendTask, projectName = "Project Management SaaS"): Task {
  return {
    id: String(raw.id),
    task_name: raw.title,
    description: raw.description ?? "",
    project: projectName,
    assignee: raw.assigned_to ? "Assigned Member" : "Unassigned",
    priority: normalizePriority(raw.priority),
    status: normalizeStatus(raw.status),
    start_date: raw.created_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
    due_date: raw.due_date?.split("T")[0] ?? "",
    created_by: "Admin",
    created_at: raw.created_at ?? new Date().toISOString(),
    attachments: [],
  };
}

export const tasksApi = {
  getTasks: async (projectId?: number): Promise<Task[]> => {
    const qs = projectId ? `?project_id=${projectId}` : "";
    const rawList = await apiFetch<BackendTask[]>(`/v1/tasks/${qs}`);
    return rawList.map((t) => mapBackendTaskToFrontend(t));
  },

  createTask: async (task: Omit<Task, "id" | "created_at">): Promise<Task> => {
    const payload = {
      title: task.task_name,
      description: task.description,
      status: task.status.toLowerCase().replace(/\s+/g, "_"),
      priority: task.priority,
      project_name: task.project,
      due_date: task.due_date ? new Date(task.due_date).toISOString() : null,
    };

    const raw = await apiFetch<BackendTask>("/v1/tasks/", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return mapBackendTaskToFrontend(raw, task.project);
  },

  updateTask: async (id: string, updates: Partial<Task>): Promise<Task> => {
    const payload: Record<string, unknown> = {};
    if (updates.task_name !== undefined) payload.title = updates.task_name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status.toLowerCase().replace(/\s+/g, "_");
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.due_date !== undefined) {
      payload.due_date = updates.due_date ? new Date(updates.due_date).toISOString() : null;
    }

    const raw = await apiFetch<BackendTask>(`/v1/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    return mapBackendTaskToFrontend(raw, updates.project ?? "Project Management SaaS");
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiFetch<void>(`/v1/tasks/${id}`, { method: "DELETE" });
  },
};
