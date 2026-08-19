export type TaskStatus = "Done" | "In Progress" | "Blocked" | "Backlog";

export interface ReportSummary {
  users: number;
  activeUsers: number;
  activities: number;
  tasks: number;
  completedTasks: number;
  projects: number;
  activeProjects: number;
  teams: number;
  trackedHours: number;
  productivity: number;
  performance: number;
  weeklyCompletion: { week: string; completed: number }[];
  taskStatus: { name: TaskStatus; value: number }[];
  teamPerformance: { name: string; completed: number; rate: number }[];
  activitiesFeed: { id: string; user: string; action: string; target: string; time: string }[];
}
