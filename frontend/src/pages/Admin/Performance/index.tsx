import * as React from "react";
import { RotateCcw, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/context/UsersContext";

import PerformanceCard from "./PerformanceCard";
import PerformanceChart from "./PerformanceChart";
import { performanceData, type PerformanceData } from "./performanceData";

type PerformancePeriod = "All" | "Today" | "This Week" | "This Month";

export default function PerformancePage() {
  const { users } = useUsers();

  const [search, setSearch] = React.useState("");
  const [period, setPeriod] = React.useState<PerformancePeriod>("All");
  React.useState<PerformanceData | null>(null);

  /*
   * Merge actual users from UsersContext
   * with performance-specific metrics.
   *
   * User information:
   * name
   * email
   * avatar
   * role
   * department
   *
   * comes from UsersContext.
   *
   * Performance information:
   * tasksAssigned
   * tasksCompleted
   * tasksPending
   * completionRate
   * productivity
   * rating
   * trend
   *
   * comes from performanceData.ts.
   */
  const mergedPerformanceData = React.useMemo<PerformanceData[]>(() => {
    return performanceData
      .map((performance) => {
        const user = users.find((item) => item.id === performance.userId);

        if (!user) {
          return null;
        }

        return {
          ...performance,

          // Latest user information
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          department: user.department,
        };
      })
      .filter((item): item is PerformanceData => item !== null);
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
       *
       * Since performanceData currently contains one snapshot,
       * all periods display the same data.
       */
      const matchesPeriod =
        period === "All" ||
        period === "Today" ||
        period === "This Week" ||
        period === "This Month";

      return matchesSearch && matchesPeriod;
    });
  }, [mergedPerformanceData, search, period]);

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
          className="gap-2 rounded-xl border-border text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {/* Performance Chart */}
      {filteredPerformance.length > 0 && <PerformanceChart />}

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
