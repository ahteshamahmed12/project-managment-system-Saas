import * as React from "react";
import { FolderKanban, ListTodo, Users, CheckCircle2 } from "lucide-react";

import StatCard from "./StatCard";
import UserOverview from "./UserOverview";
import ActivityOverview from "./ActivityOverview";

import {
  adminStats as initialAdminStats,
  userOverview,
  recentActivities as initialActivities,
} from "./adminDashboardData";
import { adminApi, type ActivityLog } from "@/lib/admin-api";
import { useUsers } from "@/context/UsersContext";
import { useProjects } from "@/context/Projectscontext";

const STAT_ICONS = {
  users: Users,
  projects: FolderKanban,
  tasks: ListTodo,
  completed: CheckCircle2,
} as const;

export default function AdminDashboard() {
  const { users } = useUsers();
  const { projects } = useProjects();

  const [stats, setStats] = React.useState(initialAdminStats);
  const [activities, setActivities] = React.useState(initialActivities);

  React.useEffect(() => {
    let cancelled = false;

    adminApi
      .getStats()
      .then((data) => {
        if (!cancelled && data) {
          setStats([
            {
              id: "users",
              title: "Total Users",
              value: String(data.users || users.length || initialAdminStats[0].value),
              change: "+12%",
              trend: "up",
              description: "Active platform users",
            },
            {
              id: "projects",
              title: "Total Projects",
              value: String(data.projects || projects.length || initialAdminStats[1].value),
              change: "+5%",
              trend: "up",
              description: "Active and completed projects",
            },
            {
              id: "tasks",
              title: "Total Tasks",
              value: String(data.tasks || initialAdminStats[2].value),
              change: "+18%",
              trend: "up",
              description: "Tasks across all projects",
            },
            {
              id: "completed",
              title: "Completed Tasks",
              value: String(data.completed || initialAdminStats[3].value),
              change: "+8%",
              trend: "up",
              description: "Successfully finished tasks",
            },
          ]);
        }
      })
      .catch(() => {
        // Keep initial stats if not logged in or backend offline
      });

    adminApi
      .getRecentActivity(10)
      .then((data: ActivityLog[]) => {
        if (!cancelled && data && data.length > 0) {
          const mapped = data.map((item, idx) => ({
            id: item.id || `activity-${idx}`,
            user: item.user || "Team Member",
            action: item.description || "Updated item",
            target: item.entity_type === "task" ? "Task" : "Sprint",
            time: item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
          }));
          setActivities(mapped);
        }
      })
      .catch(() => {
        // Keep initial activities
      });

    return () => {
      cancelled = true;
    };
  }, [users.length, projects.length]);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 py-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            trend={stat.trend}
            description={stat.description}
            icon={STAT_ICONS[stat.id as keyof typeof STAT_ICONS]}
          />
        ))}
      </div>

      {/* Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UserOverview data={userOverview} />
      </div>

      {/* Recent Activity */}
      <ActivityOverview activities={activities} />
    </div>
  );
}
