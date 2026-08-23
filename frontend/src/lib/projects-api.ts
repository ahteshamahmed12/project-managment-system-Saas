import type { Project } from "@/pages/Projects/projectData";

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
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

interface BackendProject {
  id: number;
  name: string;
  description: string | null;
  project_image: string | null;
  status: string | null;
  priority: string | null;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

export function mapBackendProject(raw: BackendProject): Project {
  return {
    id: String(raw.id),
    project_name: raw.name,
    project_image: raw.project_image ?? "",
    description: raw.description ?? "",
    status:
      raw.status === "On Hold" || raw.status === "Completed"
        ? raw.status
        : "Active",
    priority:
      raw.priority === "Low" || raw.priority === "High"
        ? raw.priority
        : "Medium",
    start_date: raw.start_date ?? "",
    end_date: raw.end_date ?? "",
    created_by: raw.created_by ?? "",
    created_at: raw.created_at ?? "",
    attachments: [],
  };
}

export function toProjectPayload(project: Project) {
  return {
    name: project.project_name,
    description: project.description,
    project_image: project.project_image,
    status: project.status,
    priority: project.priority,
    start_date: project.start_date,
    end_date: project.end_date,
  };
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const raw = await apiFetch<BackendProject[]>("/projects/");
    return raw.map(mapBackendProject);
  },

  createProject: async (project: Project): Promise<Project> => {
    const raw = await apiFetch<BackendProject>("/projects/", {
      method: "POST",
      body: JSON.stringify(toProjectPayload(project)),
    });
    return mapBackendProject(raw);
  },

  updateProject: async (project: Project): Promise<Project> => {
    const raw = await apiFetch<BackendProject>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(toProjectPayload(project)),
    });
    return mapBackendProject(raw);
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiFetch<void>(`/projects/${id}`, { method: "DELETE" });
  },
};

export { apiFetch };