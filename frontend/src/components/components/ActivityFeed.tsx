import type { ReportSummary } from "../../types";

export default function ActivityFeed({
  items,
}: {
  items: ReportSummary["activitiesFeed"];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">Recent Activities</h2>
        <p className="text-sm text-slate-500">Latest team activity</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 border-b border-slate-100 pb-4 last:border-0"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold">
              {item.user
                .split(" ")
                .map((x) => x[0])
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-800">
                <strong>{item.user}</strong> {item.action}{" "}
                <strong>{item.target}</strong>
              </p>
              <p className="mt-1 text-xs text-slate-400">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
