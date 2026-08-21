import type {
  BoardCreatePayload,
  BoardStats,
  ColumnCreatePayload,
  ColumnStats,
  ColumnUpdatePayload,
  KanbanBoard,
  KanbanBoardDetail,
  KanbanColumn,
  KanbanColumnDetail,
  KanbanTask,
  KanbanUser,
  TaskCreatePayload,
  TaskSearchResult,
  TaskUpdatePayload,
  Workload,
} from "@/types/kanban";

export type {
  TaskStatusUpdateRequest,
  TaskResponse,
} from "@/types/task";

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

export const kanbanApi = {
  /* ---------------- Boards ---------------- */

  listProjectBoards: (projectId: number | string): Promise<KanbanBoard[]> =>
    apiFetch(`/v1/kanban/projects/${projectId}/boards`),

  getBoard: (boardId: number): Promise<KanbanBoardDetail> =>
    apiFetch(`/v1/kanban/boards/${boardId}`),

  createBoard: (payload: BoardCreatePayload): Promise<KanbanBoardDetail> =>
    apiFetch("/v1/kanban/boards", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateBoard: (
    boardId: number,
    payload: { name?: string; description?: string | null; sprint_id?: number | null },
  ): Promise<KanbanBoardDetail> =>
    apiFetch(`/v1/kanban/boards/${boardId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteBoard: (boardId: number): Promise<void> =>
    apiFetch(`/v1/kanban/boards/${boardId}`, { method: "DELETE" }),

  /* ---------------- Columns ---------------- */

  createColumn: (
    boardId: number,
    payload: ColumnCreatePayload,
  ): Promise<KanbanColumn> =>
    apiFetch(`/v1/kanban/boards/${boardId}/columns`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateColumn: (
    columnId: number,
    payload: ColumnUpdatePayload,
  ): Promise<KanbanColumn> =>
    apiFetch(`/v1/kanban/columns/${columnId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteColumn: (columnId: number): Promise<void> =>
    apiFetch(`/v1/kanban/columns/${columnId}`, { method: "DELETE" }),

  reorderColumnTasks: (
    columnId: number,
    taskIds: number[],
  ): Promise<KanbanTask[]> =>
    apiFetch(`/v1/kanban/columns/${columnId}/reorder`, {
      method: "POST",
      body: JSON.stringify({ task_ids: taskIds }),
    }),

  /* ---------------- Tasks ---------------- */

  createTask: (
    boardId: number,
    payload: TaskCreatePayload,
  ): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/boards/${boardId}/tasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getTask: (taskId: number): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}`),

  updateTask: (
    taskId: number,
    payload: TaskUpdatePayload,
  ): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  deleteTask: (taskId: number): Promise<void> =>
    apiFetch(`/v1/kanban/tasks/${taskId}`, { method: "DELETE" }),

  moveTask: (
    taskId: number,
    columnId: number,
    order?: number | null,
  ): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}/move`, {
      method: "POST",
      body: JSON.stringify({ column_id: columnId, order: order ?? null }),
    }),

  moveTasksBulk: (
    taskIds: number[],
    columnId: number,
    order?: number | null,
  ): Promise<KanbanTask[]> =>
    apiFetch("/v1/kanban/tasks/move-bulk", {
      method: "POST",
      body: JSON.stringify({
        task_ids: taskIds,
        column_id: columnId,
        order: order ?? null,
      }),
    }),

  assignTasksBulk: (
    taskIds: number[],
    assigneeId: string | null,
  ): Promise<KanbanTask[]> =>
    apiFetch("/v1/kanban/tasks/assign-bulk", {
      method: "POST",
      body: JSON.stringify({ task_ids: taskIds, assignee_id: assigneeId }),
    }),

  updatePriorityBulk: (
    taskIds: number[],
    priority: string,
  ): Promise<KanbanTask[]> =>
    apiFetch("/v1/kanban/tasks/priority-bulk", {
      method: "POST",
      body: JSON.stringify({ task_ids: taskIds, priority }),
    }),

  completeTask: (taskId: number): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}/complete`, { method: "POST" }),

  reopenTask: (taskId: number): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}/reopen`, { method: "POST" }),

  blockTask: (taskId: number, reason?: string | null): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}/block`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? null }),
    }),

  unblockTask: (taskId: number): Promise<KanbanTask> =>
    apiFetch(`/v1/kanban/tasks/${taskId}/unblock`, { method: "POST" }),

  /* ---------------- Search / stats / workload ---------------- */

  searchTasks: (
    boardId: number,
    params: {
      q?: string;
      priority?: string;
      status?: string;
      assignee_id?: string;
      is_blocked?: boolean;
      page?: number;
      page_size?: number;
    },
  ): Promise<TaskSearchResult> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });
    const qs = query.toString();
    return apiFetch(`/v1/kanban/boards/${boardId}/tasks/search${qs ? `?${qs}` : ""}`);
  },

  getBoardStats: (boardId: number): Promise<BoardStats> =>
    apiFetch(`/v1/kanban/boards/${boardId}/stats`),

  getColumnStats: (columnId: number): Promise<ColumnStats> =>
    apiFetch(`/v1/kanban/columns/${columnId}/stats`),

  getUserWorkload: (
    boardId: number,
    userId: string,
  ): Promise<Workload> =>
    apiFetch(`/v1/kanban/boards/${boardId}/workload/${userId}`),

  /* ---------------- Task Flow & Status API (new) ---------------- */

  listTasksByProject: (projectId: number): Promise<TaskResponse[]> =>
    apiFetch(`/api/v1/tasks`),

  createTask: (
    projectId: number,
    title: string,
    description?: string | null,
    status?: string,
    priority?: string | null,
    dueDate?: string | null,
    assignedId?: number | null,
  ): Promise<TaskResponse> =>
    apiFetch("/api/v1/tasks", {
      method: "POST",
      body: JSON.stringify({ project_id: projectId, title, description, status, priority, due_date: dueDate, assigned_id: assignedId }),
    }),

  getTask: (taskId: number): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}`),

  updateTaskStatus: (taskId: number, status: string): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  completeTask: (taskId: number): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}/complete`, { method: "POST" }),

  reopenTask: (taskId: number): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}/reopen`, { method: "POST" }),

  blockTask: (taskId: number, reason?: string | null): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}/block`, {
      method: "POST",
      body: JSON.stringify({ reason: reason ?? null }),
    }),

  unblockTask: (taskId: number): Promise<TaskResponse> =>
    apiFetch(`/api/v1/tasks/${taskId}/unblock`, { method: "POST" }),

  deleteTask: (taskId: number): Promise<void> =>
    apiFetch(`/api/v1/tasks/${taskId}`, { method: "DELETE" }),

  /* ---------------- Users (for assignee pickers) ---------------- */

  listUsers: async (): Promise<KanbanUser[]> => {
    try {
      return await apiFetch<KanbanUser[]>("/users/");
    } catch {
      return [];
    }
  },
};

export { apiFetch };

export type { KanbanColumnDetail };