import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { PerformanceData } from "./performanceData";

interface PerformanceCardProps {
  performance: PerformanceData;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export default function PerformanceCard({ performance }: PerformanceCardProps) {
  const {
    name,
    email,
    avatar,
    role,
    department,
    tasksAssigned,
    tasksCompleted,
    tasksPending,
    completionRate,
    productivity,
    rating,
    trend,
    trendPercentage,
  } = performance;

  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <Card className="overflow-hidden border-border bg-card transition-shadow hover:shadow-md">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-11 w-11 shrink-0">
              <AvatarImage src={avatar} alt={name} />

              <AvatarFallback className="bg-orange-100 font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <CardTitle className="truncate text-base font-semibold text-foreground">
                {name}
              </CardTitle>

              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          {/* Trend */}
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              isPositive &&
                "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400",
              isNegative &&
                "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400",
              !isPositive && !isNegative && "bg-muted text-muted-foreground",
            )}
          >
            {isPositive && <ArrowUp className="h-3.5 w-3.5" />}
            {isNegative && <ArrowDown className="h-3.5 w-3.5" />}

            {trend === "stable" ? "Stable" : `${trendPercentage}%`}
          </div>
        </div>

        {/* Role / Department */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
            {role}
          </span>

          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {department}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Completion Rate */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-orange-500" />

              <span className="text-sm font-medium text-foreground">
                Completion Rate
              </span>
            </div>

            <span className="text-sm font-semibold text-foreground">
              {completionRate}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Productivity */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-blue-500" />

              <span className="text-sm font-medium text-foreground">
                Productivity
              </span>
            </div>

            <span className="text-sm font-semibold text-foreground">
              {productivity}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${productivity}%` }}
            />
          </div>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <ClipboardList className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />

            <p className="text-lg font-semibold text-foreground">
              {tasksAssigned}
            </p>

            <p className="text-[11px] text-muted-foreground">Assigned</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-green-500" />

            <p className="text-lg font-semibold text-foreground">
              {tasksCompleted}
            </p>

            <p className="text-[11px] text-muted-foreground">Completed</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
            <Clock3 className="mx-auto mb-1 h-4 w-4 text-yellow-500" />

            <p className="text-lg font-semibold text-foreground">
              {tasksPending}
            </p>

            <p className="text-[11px] text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

            <span className="text-sm font-medium text-foreground">
              Performance Rating
            </span>
          </div>

          <span className="text-sm font-semibold text-foreground">
            {rating.toFixed(1)} / 5
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
