import type { BackendSprint } from "@/types/sprint";
import type { Sprint } from "@/pages/Sprints/sprintData";
import {
  mapBackendSprint,
  mapSprintStatusToBackend,
} from "@/lib/mappers/sprint-mapper";

const API_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "auth_token";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_URL}${endpoint}`, {
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
      window.location.href = "/login";
    }

    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

function toPayload(sprint: Sprint) {
  return {
    name: sprint.sprint_name,
    project: sprint.project,
    goal: sprint.goal,
    start_date: sprint.start_date,
    end_date: sprint.end_date,
    status: mapSprintStatusToBackend(sprint.status),
  };
}

export const sprintsApi = {
  getSprints: async (): Promise<Sprint[]> => {
    const raw = await apiFetch<BackendSprint[]>("/sprints/");

    return raw.map(mapBackendSprint);
  },

  createSprint: async (sprint: Sprint): Promise<Sprint> => {
    const raw = await apiFetch<BackendSprint>("/sprints/", {
      method: "POST",
      body: JSON.stringify(toPayload(sprint)),
    });

    return mapBackendSprint(raw);
  },

  updateSprint: async (sprint: Sprint): Promise<Sprint> => {
    const raw = await apiFetch<BackendSprint>(`/sprints/${sprint.id}`, {
      method: "PUT",
      body: JSON.stringify(toPayload(sprint)),
    });

    return mapBackendSprint(raw);
  },

  deleteSprint: async (id: string): Promise<void> => {
    await apiFetch<void>(`/sprints/${id}`, { method: "DELETE" });
  },
};