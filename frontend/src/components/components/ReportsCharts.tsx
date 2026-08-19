import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import type { ReportSummary } from "../../types";

const PIE = ["#111827", "#64748b", "#94a3b8", "#cbd5e1"];

export default function ReportsCharts({ data }: { data: ReportSummary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">
            Tasks Completed per Week
          </h2>
          <p className="text-sm text-slate-500">Weekly completion trend</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.weeklyCompletion}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" radius={[6, 6, 0, 0]} fill="#111827" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Tasks by Status</h2>
          <p className="text-sm text-slate-500">Current task distribution</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.taskStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={105}
                paddingAngle={3}
              >
                {data.taskStatus.map((_, i) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {data.taskStatus.map((item) => (
            <div
              key={item.name}
              className="flex justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <span>{item.name}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Team Performance</h2>
          <p className="text-sm text-slate-500">Completed tasks by team</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.teamPerformance}
              layout="vertical"
              margin={{ left: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
              <Tooltip />
              <Bar dataKey="completed" radius={[0, 6, 6, 0]} fill="#111827" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
