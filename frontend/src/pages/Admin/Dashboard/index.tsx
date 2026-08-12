import { FolderKanban, ListTodo, Users, CheckCircle2 } from "lucide-react";

import StatCard from "./StatCard";
import UserOverview from "./UserOverview";
import ActivityOverview from "./ActivityOverview";

import {
  adminStats,
  userOverview,
  recentActivities,
} from "./adminDashboardData";

const STAT_ICONS = {
  users: Users,
  projects: FolderKanban,
  tasks: ListTodo,
  completed: CheckCircle2,
} as const;

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage and monitor your project management system.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((stat) => (
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
      <ActivityOverview activities={recentActivities} />
    </div>
  );
}
