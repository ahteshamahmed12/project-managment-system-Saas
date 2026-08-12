import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export type ChartType = "bar" | "line" | "pie";

export interface AnalyticsData {
  [key: string]: string | number;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
  xKey: string;
  dataKey: string;
  title?: string;
  description?: string;
  chartType?: ChartType;
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  emptyMessage?: string;
}

const CHART_COLORS = [
  "#F97316",
  "#22C55E",
  "#3B82F6",
  "#EAB308",
  "#A855F7",
  "#EF4444",
];

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  xKey,
  dataKey,
  title = "Analytics",
  description,
  chartType = "bar",
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  valuePrefix = "",
  valueSuffix = "",
  emptyMessage = "No analytics data available",
}) => {
  const formatTooltipValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    return `${valuePrefix}${String(value)}${valueSuffix}`;
  };

  const tooltipFormatter = (value: unknown) => [
    formatTooltipValue(value),
    dataKey,
  ];

  if (!data || data.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
        <div
          className="flex items-center justify-center text-sm text-gray-400"
          style={{ height }}
        >
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height}>
        {chartType === "line" ? (
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
            )}
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#F97316"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        ) : chartType === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius="75%"
              innerRadius="45%"
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
          </PieChart>
        ) : (
          <BarChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
            )}
            <XAxis dataKey={xKey} axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            {showTooltip && <Tooltip formatter={tooltipFormatter} />}
            {showLegend && <Legend />}
            <Bar
              dataKey={dataKey}
              fill="#F97316"
              radius={[6, 6, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
