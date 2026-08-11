import type { AnalyticsData } from "./AnalyticsChart";

export const projectProgressData: AnalyticsData[] = [
  { project: "Website Development", progress: 85 },
  { project: "Mobile App", progress: 65 },
  { project: "CRM System", progress: 72 },
  { project: "Dashboard UI", progress: 90 },
  { project: "E-commerce", progress: 58 },
];

export const projectWorkloadData: AnalyticsData[] = [
  { member: "Sam", tasks: 7 },
  { member: "Emily", tasks: 10 },
  { member: "Ken", tasks: 8 },
  { member: "Daisy", tasks: 12 },
  { member: "Vega", tasks: 9 },
  { member: "Kamal", tasks: 4 },
];

export const monthlyTasksData: AnalyticsData[] = [
  { month: "Jan", completed: 32 },
  { month: "Feb", completed: 41 },
  { month: "Mar", completed: 48 },
  { month: "Apr", completed: 56 },
  { month: "May", completed: 63 },
  { month: "Jun", completed: 72 },
];

export const taskStatusData: AnalyticsData[] = [
  { status: "Completed", count: 35 },
  { status: "Delayed", count: 15 },
  { status: "Ongoing", count: 35 },
  { status: "Pending", count: 10 },
];
