import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DollarSign,
  FolderKanban,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

/* ---------- helpers ---------- */

function CircularProgress({
  value,
  size = 40,
}: {
  value: number;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#f97316"
          strokeWidth={4}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
        {value}%
      </span>
    </div>
  );
}

function SemiGauge({ value }: { value: number }) {
  const r = 80;
  const cx = 100;
  const cy = 100;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + (value / 100) * (endAngle - startAngle);
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  const largeArc = value > 50 ? 1 : 0;

  return (
    <div className="relative mx-auto w-50">
      <svg viewBox="0 0 200 120" className="w-full">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={14}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <p className="text-3xl font-bold">{value}%</p>
        <p className="text-sm text-gray-500">Completed</p>
      </div>
    </div>
  );
}

function WorkloadChart() {
  const data = [
    { name: "Sam", count: 4 },
    { name: "Meldy", count: 6 },
    { name: "Ken", count: 3 },
    { name: "Dmitry", count: 10 },
    { name: "Vego", count: 5 },
    { name: "Kadin", count: 7 },
    { name: "Melin", count: 4 },
  ];
  // const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="flex items-end justify-between gap-2 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {data.map((d) => (
        <div
          key={d.name}
          className="flex min-w-12 flex-1 flex-col items-center gap-2"
        >
          <div className="flex flex-col-reverse items-center gap-1">
            {Array.from({ length: d.count }).map((_, i) => (
              <div
                key={i}
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-black text-[9px] font-bold sm:h-7 sm:w-7 sm:text-[10px] ${
                  i === d.count - 1
                    ? "bg-orange-500 text-white border-orange-500"
                    : "bg-white"
                }`}
              >
                {i === d.count - 1 ? d.count : ""}
              </div>
            ))}
          </div>
          <span className="w-full truncate text-center text-xs text-gray-600">
            {d.name}
          </span>
        </div>
      ))}
    </div>
  );
}

const statusColor: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  Delayed: "bg-yellow-100 text-yellow-700",
  "At risk": "bg-red-100 text-red-700",
  "On going": "bg-orange-100 text-orange-700",
  Approved: "bg-green-100 text-green-700",
  "In review": "bg-red-100 text-red-700",
};

/* ---------- page ---------- */

export default function Dashboard() {
  const overviewCards = [
    {
      title: "Total revenue",
      value: "$53,00989",
      change: "2% increase from last month",
      up: true,
      icon: DollarSign,
      bg: "bg-purple-100 text-purple-600",
    },
    {
      title: "Projects",
      value: "95 / 100",
      change: "10% decrease from last month",
      up: false,
      icon: FolderKanban,
      bg: "bg-orange-100 text-orange-600",
    },
    {
      title: "Time spent",
      value: "1022 / 1300 Hrs",
      change: "8% increase from last month",
      up: true,
      icon: Clock,
      bg: "bg-blue-100 text-blue-600",
    },
    {
      title: "Resources",
      value: "101 / 120",
      change: "2% increase from last month",
      up: true,
      icon: Users,
      bg: "bg-yellow-100 text-yellow-600",
    },
  ];

  const projects = [
    {
      name: "Nexus",
      manager: "Alex",
      due: "Feb 20, 2024",
      status: "Completed",
      progress: 100,
    },
    {
      name: "Pulse",
      manager: "Sam",
      due: "Mar 10, 2024",
      status: "Delayed",
      progress: 36,
    },
    {
      name: "Orbit",
      manager: "Ken",
      due: "Apr 5, 2024",
      status: "At risk",
      progress: 68,
    },
    {
      name: "Vertex",
      manager: "Meldy",
      due: "May 1, 2024",
      status: "On going",
      progress: 52,
    },
  ];

  const tasks = [
    { text: "Review design mockups", done: true, status: "Approved" },
    { text: "Update project timeline", done: false, status: "In review" },
    { text: "Prepare sprint report", done: false, status: "On going" },
    { text: "Client feedback call", done: true, status: "Approved" },
    { text: "Deploy staging build", done: false, status: "On going" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <Select defaultValue="30">
            <SelectTrigger className="w-35 rounded-full bg-white border-0 shadow-sm">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((c) => (
            <Card key={c.title} className="rounded-2xl border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">{c.title}</span>
                  <div className={`rounded-lg p-2 ${c.bg}`}>
                    <c.icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p
                  className={`mt-1 flex items-center gap-1 text-xs ${c.up ? "text-green-600" : "text-red-500"}`}
                >
                  {c.up ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {c.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Project Summary */}
        <Card className="rounded-2xl border-0 shadow-sm xl:col-span-2">
          <CardHeader className="flex flex-col gap-3 pb-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Project summary</CardTitle>
            <div className="flex flex-wrap gap-2">
              {["Project", "Project manager", "Status"].map((f) => (
                <Select key={f}>
                  <SelectTrigger className="h-8 w-28 min-w-0 flex-1 rounded-full bg-gray-50 text-xs border-0 sm:w-32.5 sm:flex-none">
                    <SelectValue placeholder={f} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Project manager</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.manager}</TableCell>
                    <TableCell>{p.due}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`rounded-full ${statusColor[p.status]}`}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <CircularProgress value={p.progress} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Overall Progress</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-20 rounded-full bg-gray-50 text-xs border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <SemiGauge value={72} />
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div>
                <span className="font-bold">95</span>{" "}
                <span className="text-gray-500">Total projects</span>
              </div>
              <div>
                <span className="font-bold text-green-600">26</span>{" "}
                <span className="text-gray-500">Completed</span>
              </div>
              <div>
                <span className="font-bold text-yellow-600">35</span>{" "}
                <span className="text-gray-500">Delayed</span>
              </div>
              <div>
                <span className="font-bold text-orange-500">35</span>{" "}
                <span className="text-gray-500">On going</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Today Task */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Today task</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="important">
              <TabsList className="mb-4 max-w-full overflow-x-auto bg-transparent p-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[
                  { v: "all", l: "All (10)" },
                  { v: "important", l: "Important" },
                  { v: "notes", l: "Notes (05)" },
                  { v: "links", l: "Links (10)" },
                ].map((t) => (
                  <TabsTrigger
                    key={t.v}
                    value={t.v}
                    className="shrink-0 rounded-none border-b-2 border-transparent px-2 text-xs data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-3 sm:text-sm"
                  >
                    {t.l}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="important" className="space-y-3">
                {tasks.map((task, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Checkbox
                        checked={task.done}
                        className="shrink-0 rounded-full data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <span
                        className={`min-w-0 truncate ${
                          task.done ? "line-through text-gray-400" : ""
                        }`}
                      >
                        {task.text}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`rounded-full ${statusColor[task.status]}`}
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Projects Workload */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Projects Workload</CardTitle>
            <Select defaultValue="3">
              <SelectTrigger className="h-8 w-35 rounded-full bg-gray-50 text-xs border-0">
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <WorkloadChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
