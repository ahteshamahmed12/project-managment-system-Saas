import type { ReportSummary } from "../types";

export const reportSummary: ReportSummary = {
  users: 48,
  activeUsers: 42,
  activities: 326,
  tasks: 184,
  completedTasks: 121,
  projects: 12,
  activeProjects: 8,
  teams: 6,
  trackedHours: 742,
  productivity: 86,
  performance: 91,
  weeklyCompletion: [
    { week: "W1", completed: 18 }, { week: "W2", completed: 24 },
    { week: "W3", completed: 21 }, { week: "W4", completed: 31 },
    { week: "W5", completed: 35 }, { week: "W6", completed: 42 },
  ],
  taskStatus: [
    { name: "Done", value: 121 }, { name: "In Progress", value: 28 },
    { name: "Blocked", value: 11 }, { name: "Backlog", value: 24 },
  ],
  teamPerformance: [
    { name: "Design", completed: 34, rate: 94 },
    { name: "Engineering", completed: 48, rate: 91 },
    { name: "Marketing", completed: 25, rate: 87 },
    { name: "Planning", completed: 14, rate: 82 },
  ],
  activitiesFeed: [
    { id: "1", user: "Sarah K.", action: "completed", target: "Landing Page", time: "8 min ago" },
    { id: "2", user: "Marco D.", action: "commented on", target: "API Integration", time: "22 min ago" },
    { id: "3", user: "Priya M.", action: "created", target: "Sprint Planning", time: "41 min ago" },
    { id: "4", user: "Jin T.", action: "updated", target: "Dashboard UI", time: "1 hr ago" },
    { id: "5", user: "Lena F.", action: "completed", target: "User Profile", time: "2 hrs ago" },
  ],
};
