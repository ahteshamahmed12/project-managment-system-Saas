import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { PerformanceData } from "./performanceData";

interface PerformanceChartProps {
  data: PerformanceData[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = data.map((user) => ({
    name: user.name.split(" ")[0],
    completion: user.completionRate,
    productivity: user.productivity,
  }));

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">Team Performance</CardTitle>

        <CardDescription>
          Compare task completion and productivity across team members.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-90 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 5,
              }}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="fill-muted-foreground text-xs"
              />

              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `${value}%`}
                className="fill-muted-foreground text-xs"
              />

              <Tooltip
                cursor={{ fill: "rgba(249, 115, 22, 0.06)" }}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === "completion" ? "Completion Rate" : "Productivity",
                ]}
              />

              <Bar
                dataKey="completion"
                name="Completion Rate"
                fill="#f97316"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />

              <Bar
                dataKey="productivity"
                name="Productivity"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-orange-500" />

            <span className="text-xs text-muted-foreground">
              Completion Rate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-blue-500" />

            <span className="text-xs text-muted-foreground">Productivity</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
