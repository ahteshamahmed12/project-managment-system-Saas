import { UserRound, UserCheck, UserX, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";

import type { UserOverviewData } from "./adminDashboardData";

interface UserOverviewProps {
  data: UserOverviewData;
}

const USER_STATS = [
  {
    key: "total",
    label: "Total Users",
    icon: UserRound,
    iconClass:
      "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  },
  {
    key: "active",
    label: "Active Users",
    icon: UserCheck,
    iconClass:
      "bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400",
  },
  {
    key: "inactive",
    label: "Inactive Users",
    icon: UserX,
    iconClass: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
  },
  {
    key: "newThisMonth",
    label: "New This Month",
    icon: UserPlus,
    iconClass:
      "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
] as const;

export default function UserOverview({ data }: UserOverviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-foreground">
          User Overview
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Current user statistics and account activity.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {USER_STATS.map((item) => {
          const Icon = item.icon;
          const value = data[item.key];

          return (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  item.iconClass,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{item.label}</p>

                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
