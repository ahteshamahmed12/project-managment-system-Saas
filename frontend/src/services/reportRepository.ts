import { reportSummary } from "../data/reportData";
import type { ReportSummary } from "../types";
import { adminApi } from "@/lib/admin-api";

export const reportRepository = {
  async getReportSummary(): Promise<ReportSummary> {
    try {
      const stats = await adminApi.getStats();
      const recentActivities = await adminApi.getRecentActivity(5).catch(() => []);

      return {
        ...reportSummary,
        users: stats.users || reportSummary.users,
        activeUsers: stats.users || reportSummary.activeUsers,
        tasks: stats.tasks || reportSummary.tasks,
        completedTasks: stats.completed || reportSummary.completedTasks,
        projects: stats.projects || reportSummary.projects,
        activeProjects: stats.projects || reportSummary.activeProjects,
        activitiesFeed: recentActivities.length > 0
          ? recentActivities.map((act, idx) => ({
              id: act.id || String(idx),
              user: act.user || "Team Member",
              action: act.description || "Updated item",
              target: act.entity_type === "task" ? "Task" : "Sprint",
              time: act.created_at ? new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
            }))
          : reportSummary.activitiesFeed,
      };
    } catch {
      return reportSummary;
    }
  },
};
