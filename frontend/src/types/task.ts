export interface TaskStatusUpdateRequest {
  status: string; // "todo" | "in_progress" | "in_review" | "done" | "blocked"
}

export interface TaskResponse {
  id: number;
  title: string;
  status: string;
  assignee_id: number | null;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}