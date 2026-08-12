export type CommentTargetType = "task" | "project";

export interface Comment {
  id: string;
  target_type: CommentTargetType;
  target_id: string;

  user_id: string;
  user_name: string;
  user_avatar?: string;

  content: string;
  created_at: string;
  updated_at?: string;
}

export const commentData: Comment[] = [
  {
    id: crypto.randomUUID(),
    target_type: "task",
    target_id: "task-1",
    user_id: "user-1",
    user_name: "Zain Qaimi",
    content: "Login UI ka design complete ho gaya hai.",
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    target_type: "task",
    target_id: "task-1",
    user_id: "user-2",
    user_name: "Ali Raza",
    content: "Looks good. Responsive version bhi check kar lena.",
    created_at: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    target_type: "project",
    target_id: "project-1",
    user_id: "user-1",
    user_name: "Zain Qaimi",
    content: "Project ka initial setup complete hai.",
    created_at: new Date().toISOString(),
  },
];
