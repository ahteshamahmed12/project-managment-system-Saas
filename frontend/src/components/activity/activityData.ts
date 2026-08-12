export type ActivityType =
  | "project_created"
  | "project_updated"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "comment_added"
  | "file_uploaded"
  | "member_added";

export interface Activity {
  id: string;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  message: string;
  target?: string;
  created_at: string;
}

export const activityData: Activity[] = [
  {
    id: "activity-1",
    type: "task_completed",
    user: {
      id: "user-1",
      name: "Zain Ul Abdin",
    },
    message: "completed task",
    target: "Implement Authentication",
    created_at: "2026-08-11T09:30:00",
  },
  {
    id: "activity-2",
    type: "comment_added",
    user: {
      id: "user-2",
      name: "Ahmed Khan",
    },
    message: "commented on task",
    target: "Dashboard UI",
    created_at: "2026-08-11T10:15:00",
  },
  {
    id: "activity-3",
    type: "file_uploaded",
    user: {
      id: "user-3",
      name: "Ali Raza",
    },
    message: "uploaded a file to",
    target: "Project Management SaaS",
    created_at: "2026-08-11T11:20:00",
  },
  {
    id: "activity-4",
    type: "task_created",
    user: {
      id: "user-1",
      name: "Zain Ul Abdin",
    },
    message: "created task",
    target: "Implement Comments",
    created_at: "2026-08-11T12:05:00",
  },
  {
    id: "activity-5",
    type: "project_updated",
    user: {
      id: "user-2",
      name: "Ahmed Khan",
    },
    message: "updated project",
    target: "Project Management SaaS",
    created_at: "2026-08-11T13:10:00",
  },
  {
    id: "activity-6",
    type: "member_added",
    user: {
      id: "user-3",
      name: "Ali Raza",
    },
    message: "added a new member to",
    target: "Team A",
    created_at: "2026-08-11T14:00:00",
  },
];
