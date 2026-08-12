export type NotificationType =
  | "task"
  | "project"
  | "sprint"
  | "team"
  | "system";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export const notificationData: Notification[] = [
  {
    id: "notification-001",
    title: "New Task Assigned",
    message: "You have been assigned a new task in Project Management SaaS.",
    type: "task",
    read: false,
    created_at: "2026-08-08T09:30:00Z",
  },
  {
    id: "notification-002",
    title: "Sprint Started",
    message: "Sprint 21 is now active.",
    type: "sprint",
    read: false,
    created_at: "2026-08-08T08:15:00Z",
  },
  {
    id: "notification-003",
    title: "Project Updated",
    message: "Project Management SaaS project details were updated.",
    type: "project",
    read: false,
    created_at: "2026-08-07T14:20:00Z",
  },
  {
    id: "notification-004",
    title: "New Team Member",
    message: "Ahmed Raza has been added to the Frontend Team.",
    type: "team",
    read: false,
    created_at: "2026-08-07T11:45:00Z",
  },
  {
    id: "notification-005",
    title: "Task Completed",
    message: "The task 'Dashboard UI' has been marked as completed.",
    type: "task",
    read: true,
    created_at: "2026-08-06T16:10:00Z",
  },
  {
    id: "notification-006",
    title: "System Update",
    message: "A new system update is available.",
    type: "system",
    read: true,
    created_at: "2026-08-06T10:00:00Z",
  },
  {
    id: "notification-007",
    title: "Sprint Deadline Approaching",
    message: "Sprint 21 will end in 2 days.",
    type: "sprint",
    read: false,
    created_at: "2026-08-05T13:30:00Z",
  },
  {
    id: "notification-008",
    title: "Project Completed",
    message: "The Mobile App project has been marked as completed.",
    type: "project",
    read: true,
    created_at: "2026-08-04T15:00:00Z",
  },
];
