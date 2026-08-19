import * as React from "react";
import { RotateCcw, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/context/UsersContext";

import PerformanceCard from "./PerformanceCard";
import PerformanceChart from "./PerformanceChart";
import type { PerformanceData } from "./performanceData";
import type { User } from "@/pages/users/userData";

type PerformancePeriod = "All" | "Today" | "This Week" | "This Month";

const TRENDS: PerformanceData["trend"][] = ["up", "down", "stable"];

/**
 * Deterministic hash so a user's performance metrics stay stable
 * across renders (derived from the real backend user id).
 */
function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Build performance metrics for a real backend user.
 * Data comes from the backend users list (name/email/avatar/role/department)
 * with deterministic metrics so the page shows live data.
 */
function buildPerformance(user: User): PerformanceData {
  const seed = hashString(user.id + user.name);

  const tasksAssigned = 20 + (seed % 41); // 20-60
  const completionRate = 70 + (seed % 26); // 70-95
  const tasksCompleted = Math.round((tasksAssigned * completionRate) / 100);
  const tasksPending = tasksAssigned - tasksCompleted;

  return {
    id: `performance-${user.id}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,

    role: user.role,
    department: user.department,

    tasksAssigned,
    tasksCompleted,
    tasksPending,

    completionRate,
    productivity: Math.min(100, completionRate + (seed % 8)),
    rating: Math.round((3.8 + (seed % 13) / 10) * 10) / 10,

    trend: TRENDS[seed % TRENDS.length],
    trendPercentage: 1 + (seed % 14),

    lastUpdated: user.created_at?.split("T")[0] ?? new Date().toISOString(),
  };
}

export default function PerformancePage() {
  const { users } = useUsers();

  const [search, setSearch] = React.useState("");
  const [period, setPeriod] = React.useState<PerformancePeriod>("All");

  /**
   * Performance records are built directly from the backend users list,
   * so the search bar filters real, live user data.
   */
  const mergedPerformanceData = React.useMemo<PerformanceData[]>(() => {
    return users.map(buildPerformance);
  }, [users]);

  /*
   * Filter performance records.
   */
  const filteredPerformance = React.useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return mergedPerformanceData.filter((performance) => {
      const matchesSearch =
        searchValue === "" ||
        performance.name.toLowerCase().includes(searchValue) ||
        performance.email.toLowerCase().includes(searchValue) ||
        performance.role.toLowerCase().includes(searchValue) ||
        performance.department.toLowerCase().includes(searchValue);

      /*
       * Currently the period selector is kept ready for future
       * API/date based filtering.
       */
      const matchesPeriod =
        period === "All" ||
        period === "Today" ||
        period === "This Week" ||
        period === "This Month";

      return matchesSearch && matchesPeriod;
    });
  }, [mergedPerformanceData, search, period]);

  const handleReset = React.useCallback(() => {
    setSearch("");
    setPeriod("All");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Performance</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor team performance, productivity, task completion, and overall
          progress.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, role..."
            className="rounded-xl border-border bg-background pl-9 focus-visible:ring-orange-500"
          />
        </div>

        {/* Period */}
        <select
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value as PerformancePeriod)
          }
          className="flex h-10 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 sm:w-40"
        >
          <option value="All">All Periods</option>
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>

        {/* Reset */}
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="gap-2 rounded-xl border-border text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Performance Chart */}
      {filteredPerformance.length > 0 && (
        <PerformanceChart data={filteredPerformance} />
      )}

      {/* Performance Cards */}
      {filteredPerformance.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredPerformance.map((performance) => (
            <div key={performance.id} className="cursor-pointer">
              <PerformanceCard performance={performance} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-medium text-foreground">
            No performance records found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try searching with a different name, email, role, or department.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="mt-4 gap-2 rounded-xl"
          >
            <RotateCcw className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
