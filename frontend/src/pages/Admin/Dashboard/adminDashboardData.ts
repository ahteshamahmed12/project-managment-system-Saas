export interface AdminStat {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

export interface UserOverviewData {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

export interface ProjectOverviewData {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export interface ActivityOverviewItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export const adminStats: AdminStat[] = [
  {
    id: "users",
    title: "Total Users",
    value: "128",
    change: "+12.5%",
    trend: "up",
    description: "from last month",
  },
  {
    id: "projects",
    title: "Total Projects",
    value: "24",
    change: "+8.2%",
    trend: "up",
    description: "from last month",
  },
  {
    id: "tasks",
    title: "Total Tasks",
    value: "486",
    change: "+15.4%",
    trend: "up",
    description: "from last month",
  },
  {
    id: "completed",
    title: "Completed Tasks",
    value: "342",
    change: "+10.8%",
    trend: "up",
    description: "from last month",
  },
];

export const userOverview: UserOverviewData = {
  total: 128,
  active: 112,
  inactive: 16,
  newThisMonth: 14,
};

export const projectOverview: ProjectOverviewData = {
  total: 24,
  active: 15,
  completed: 7,
  overdue: 2,
};

export const recentActivities: ActivityOverviewItem[] = [
  {
    id: "activity-1",
    user: "Zain Ul Abdin",
    action: "created a new task",
    target: "Design Dashboard UI",
    time: "10 minutes ago",
  },
  {
    id: "activity-2",
    user: "Ali Raza",
    action: "completed task",
    target: "Setup Authentication",
    time: "35 minutes ago",
  },
  {
    id: "activity-3",
    user: "Sarah Khan",
    action: "created project",
    target: "E-Commerce Platform",
    time: "1 hour ago",
  },
  {
    id: "activity-4",
    user: "Ahmed Hassan",
    action: "updated task",
    target: "API Integration",
    time: "2 hours ago",
  },
  {
    id: "activity-5",
    user: "Zain Ul Abdin",
    action: "uploaded attachment",
    target: "Project Documentation",
    time: "3 hours ago",
  },
];
