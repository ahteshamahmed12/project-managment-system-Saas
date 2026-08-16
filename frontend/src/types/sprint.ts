// types/sprint.ts

export type BackendSprintStatus = "planning" | "active" | "completed" | "closed";

// Exactly what the backend returns from the sprints endpoints
export interface BackendSprint {
  id: number;
  project_id: number;
  project: string;
  name: string;
  description: string | null;
  status: BackendSprintStatus;
  start_date: string;
  end_date: string;
  goal: string | null;
  capacity: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string | null;
}
