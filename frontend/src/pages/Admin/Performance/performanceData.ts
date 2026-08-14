import type { UserRole, UserDepartment } from "@/pages/users/userData";
export type PerformanceTrend = "up" | "down" | "stable";

export interface PerformanceData {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;

  role: UserRole;
  department: UserDepartment;

  tasksAssigned: number;
  tasksCompleted: number;
  tasksPending: number;

  completionRate: number;
  productivity: number;
  rating: number;

  trend: PerformanceTrend;
  trendPercentage: number;

  lastUpdated: string;
}

export const performanceData: PerformanceData[] = [
  {
    id: "performance-001",
    userId: "user-001",
    name: "Syed Huzaifa",
    email: "huzaifa@example.com",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "Admin",
    department: "Development",

    tasksAssigned: 48,
    tasksCompleted: 44,
    tasksPending: 4,

    completionRate: 92,
    productivity: 95,
    rating: 4.8,

    trend: "up",
    trendPercentage: 12,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-002",
    userId: "user-002",
    name: "Zain Qaimi",
    email: "zain@example.com",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Manager",
    department: "Development",

    tasksAssigned: 42,
    tasksCompleted: 38,
    tasksPending: 4,

    completionRate: 90,
    productivity: 91,
    rating: 4.6,

    trend: "up",
    trendPercentage: 9,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-003",
    userId: "user-003",
    name: "Ali Raza",
    email: "ali@example.com",
    avatar: "https://i.pravatar.cc/150?img=13",
    role: "Developer",
    department: "Development",

    tasksAssigned: 55,
    tasksCompleted: 47,
    tasksPending: 8,

    completionRate: 85,
    productivity: 88,
    rating: 4.4,

    trend: "up",
    trendPercentage: 7,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-004",
    userId: "user-004",
    name: "Ahmed Khan",
    email: "ahmed@example.com",
    avatar: "https://i.pravatar.cc/150?img=14",
    role: "QA",
    department: "QA",

    tasksAssigned: 36,
    tasksCompleted: 29,
    tasksPending: 7,

    completionRate: 81,
    productivity: 83,
    rating: 4.2,

    trend: "stable",
    trendPercentage: 1,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-005",
    userId: "user-005",
    name: "Fatima Noor",
    email: "fatima@example.com",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "Designer",
    department: "Design",

    tasksAssigned: 40,
    tasksCompleted: 35,
    tasksPending: 5,

    completionRate: 88,
    productivity: 90,
    rating: 4.7,

    trend: "up",
    trendPercentage: 11,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-006",
    userId: "user-006",
    name: "Ayesha Malik",
    email: "ayesha@example.com",
    avatar: "https://i.pravatar.cc/150?img=16",
    role: "Developer",
    department: "Development",

    tasksAssigned: 50,
    tasksCompleted: 41,
    tasksPending: 9,

    completionRate: 82,
    productivity: 85,
    rating: 4.3,

    trend: "down",
    trendPercentage: 4,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-007",
    userId: "user-007",
    name: "Bilal Hassan",
    email: "bilal@example.com",
    avatar: "https://i.pravatar.cc/150?img=17",
    role: "Team Lead",
    department: "Development",

    tasksAssigned: 46,
    tasksCompleted: 42,
    tasksPending: 4,

    completionRate: 91,
    productivity: 93,
    rating: 4.7,

    trend: "up",
    trendPercentage: 8,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-008",
    userId: "user-008",
    name: "Hina Tariq",
    email: "hina@example.com",
    avatar: "https://i.pravatar.cc/150?img=18",
    role: "Manager",
    department: "Marketing",

    tasksAssigned: 34,
    tasksCompleted: 27,
    tasksPending: 7,

    completionRate: 79,
    productivity: 80,
    rating: 4.1,

    trend: "down",
    trendPercentage: 6,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-009",
    userId: "user-009",
    name: "Usman Shah",
    email: "usman@example.com",
    avatar: "https://i.pravatar.cc/150?img=19",
    role: "QA",
    department: "QA",

    tasksAssigned: 44,
    tasksCompleted: 39,
    tasksPending: 5,

    completionRate: 89,
    productivity: 87,
    rating: 4.5,

    trend: "up",
    trendPercentage: 5,

    lastUpdated: "2026-08-13",
  },

  {
    id: "performance-010",
    userId: "user-010",
    name: "Sara Khan",
    email: "sara@example.com",
    avatar: "https://i.pravatar.cc/150?img=20",
    role: "Designer",
    department: "Design",

    tasksAssigned: 38,
    tasksCompleted: 32,
    tasksPending: 6,

    completionRate: 84,
    productivity: 86,
    rating: 4.3,

    trend: "stable",
    trendPercentage: 2,

    lastUpdated: "2026-08-13",
  },
];
