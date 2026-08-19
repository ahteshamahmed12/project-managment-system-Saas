import { useEffect, useState } from "react";
import {
  Users,
  Activity,
  CheckSquare,
  FolderKanban,
  UsersRound,
  Clock3,
  TrendingUp,
  Award,
  Download,
} from "lucide-react";
import StatCard from "../../components/components/StatCard";
import ReportsCharts from "../../components/components/ReportsCharts";
import ActivityFeed from "../../components/components/ActivityFeed";
import { reportRepository } from "../../services/reportRepository";
import type { ReportSummary } from "../../types";

export default function Reports() {
  const [data, setData] = useState<ReportSummary | null>(null);

  useEffect(() => {
    reportRepository.getReportSummary().then(setData);
  }, []);

  if (!data)
    return <div className="p-8 text-slate-500">Loading reports...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Project Management SaaS
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Reports
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track projects, tasks and team productivity.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
              <option>All Projects</option>
              <option>Website Redesign</option>
              <option>Mobile App</option>
            </select>
            <select className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </select>
            <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white">
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Users"
            value={data.users}
            subtitle={`${data.activeUsers} active users`}
            icon={Users}
          />
          <StatCard
            title="Activities"
            value={data.activities}
            subtitle="Across workspace"
            icon={Activity}
          />
          <StatCard
            title="Tasks"
            value={data.tasks}
            subtitle={`${data.completedTasks} completed`}
            icon={CheckSquare}
          />
          <StatCard
            title="Projects"
            value={data.projects}
            subtitle={`${data.activeProjects} active`}
            icon={FolderKanban}
          />
          <StatCard
            title="Teams"
            value={data.teams}
            subtitle="Active teams"
            icon={UsersRound}
          />
          <StatCard
            title="Time Tracking"
            value={`${data.trackedHours}h`}
            subtitle="Hours tracked"
            icon={Clock3}
          />
          <StatCard
            title="Productivity"
            value={`${data.productivity}%`}
            subtitle="Workspace productivity"
            icon={TrendingUp}
          />
          <StatCard
            title="Performance"
            value={`${data.performance}%`}
            subtitle="Overall team score"
            icon={Award}
          />
        </div>

        <ReportsCharts data={data} />

        <div className="mt-6">
          <ActivityFeed items={data.activitiesFeed} />
        </div>
      </div>
    </main>
  );
}
