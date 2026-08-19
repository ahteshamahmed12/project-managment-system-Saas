export type KanbanPriority = "critical" | "high" | "medium" | "low";
export type KanbanStatus =
  | "todo"
  | "in_progress"
  | "in_review"
  | "done"
  | "blocked";

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  status: KanbanStatus;
  wip_limit: number | null;
  order: number;
  created_at: string;
}

export interface KanbanTask {
  id: number;
  board_id: number;
  column_id: number;
  task_id: number | null;
  title: string;
  description: string | null;
  priority: KanbanPriority;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
  story_points: number | null;
  time_estimate: number | null;
  time_spent: number | null;
  due_date: string | null;
  order: number;
  status: KanbanStatus;
  is_blocked: boolean;
  blocked_reason: string | null;
  is_completed: boolean;
  tags: string[] | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
  comment_count: number;
}

export interface KanbanBoard {
  id: number;
  project_id: number;
  sprint_id: number | null;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface KanbanBoardDetail extends KanbanBoard {
  columns: KanbanColumnDetail[];
  tasks: KanbanTask[];
}

export interface KanbanColumnDetail extends KanbanColumn {
  tasks: KanbanTask[];
}

export interface BoardStats {
  board_id: number;
  total: number;
  by_status: Record<string, number>;
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  blocked: number;
  completed: number;
  completion_percentage: number;
  total_story_points: number;
  completed_story_points: number;
}

export interface ColumnStats {
  column_id: number;
  board_id: number;
  name: string;
  status: KanbanStatus;
  wip_limit: number | null;
  total_tasks: number;
  at_limit: boolean;
  over_limit: boolean;
  by_priority: Record<string, number>;
  blocked_count: number;
  avg_story_points: number | null;
  total_story_points: number;
  total_time_estimate: number;
  total_time_spent: number;
}

export interface TaskSearchResult {
  items: KanbanTask[];
  total: number;
  page: number;
  page_size: number;
}

export interface Workload {
  board_id: number;
  user_id: string;
  total_tasks: number;
  completed_tasks: number;
  blocked_tasks: number;
  in_progress_tasks: number;
  total_story_points: number;
  completed_story_points: number;
  total_time_spent: number;
  tasks: KanbanTask[];
}

export interface KanbanUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  column_id?: number | null;
  task_id?: number | null;
  priority?: KanbanPriority;
  assignee_id?: string | null;
  story_points?: number | null;
  time_estimate?: number | null;
  time_spent?: number | null;
  due_date?: string | null;
  order?: number | null;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  tags?: string[] | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  column_id?: number | null;
  priority?: KanbanPriority;
  assignee_id?: string | null;
  story_points?: number | null;
  time_estimate?: number | null;
  time_spent?: number | null;
  due_date?: string | null;
  order?: number | null;
  is_blocked?: boolean;
  blocked_reason?: string | null;
  tags?: string[] | null;
}

export interface BoardCreatePayload {
  project_id: number;
  sprint_id?: number | null;
  name: string;
  description?: string | null;
}

export interface ColumnCreatePayload {
  name: string;
  status: KanbanStatus;
  wip_limit?: number | null;
  order?: number | null;
}

export interface ColumnUpdatePayload {
  name?: string;
  status?: KanbanStatus;
  wip_limit?: number | null;
  order?: number | null;
}

export const PRIORITY_LABELS: Record<KanbanPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const STATUS_LABELS: Record<KanbanStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  blocked: "Blocked",
};