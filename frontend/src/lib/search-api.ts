// Matches the fallback chain used by the other API clients. Without the
// fallback this resolved to the string "undefined" whenever only
// VITE_API_BASE_URL was set, producing requests to "undefined/search/".
const API_URL = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api"
).replace(/\/$/, "");

const TOKEN_KEY = "auth_token";

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  department: string | null;
}

export interface SearchProject {
  id: number;
  name: string;
  description: string | null;
}

export interface SearchSprint {
  id: number;
  name: string;
  goal: string | null;
  description: string | null;
  status: string;
  project: string;
}

export interface SearchTask {
  id: number;
  title: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  project_id: number | null;
}

export interface SearchResults {
  users: SearchUser[];
  projects: SearchProject[];
  sprints: SearchSprint[];
  tasks: SearchTask[];
}

export interface SearchResponse {
  query: string;
  count: number;
  data: SearchResults;
}

export async function globalSearch(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(
    `${API_URL}/search/?q=${encodeURIComponent(query)}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal,
    },
  );

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Search failed.");
  }

  return res.json() as Promise<SearchResponse>;
}