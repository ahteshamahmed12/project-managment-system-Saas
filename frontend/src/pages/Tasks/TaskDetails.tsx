import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Flag,
  FolderKanban,
  Pencil,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CommentSection from "@/components/comments/CommentSection";

import type { Task } from "./taskData";

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  Low: "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400",

  Medium:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-400",

  High: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskDetails() {
  const navigate = useNavigate();

  const location = useLocation();

  const task = location.state?.task as Task | undefined;

  if (!task) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center text-center">
        {" "}
        <h2 className="text-xl font-semibold text-foreground">
          Task not found{" "}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The task details could not be loaded.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="mt-4 gap-2 rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/tasks")}
          className="w-fit gap-2 rounded-xl"
        >
          {" "}
          <ArrowLeft className="h-4 w-4" />
          Back to Tasks{" "}
        </Button>
        <Button
          type="button"
          onClick={() => navigate("/tasks")}
          className="w-fit gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
        >
          <Pencil className="h-4 w-4" />
          Edit Task
        </Button>
      </div>
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {task.task_name}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Task details and discussion
        </p>
      </div>
      {/* Main Content */}

      <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* LEFT SIDE */}
        <div className="min-w-0 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Description
            </p>

            <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              {task.description || "No description provided."}
            </div>
          </div>

          {/* Task Information */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">
              Task Information
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Project */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <FolderKanban className="h-5 w-5 shrink-0 text-orange-500" />

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Project</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.project || "—"}
                  </p>
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <User className="h-5 w-5 shrink-0 text-orange-500" />

                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Assignee</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {task.assignee || "—"}
                  </p>
                </div>
              </div>

              {/* Priority */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Flag className="h-5 w-5 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs text-muted-foreground">Priority</p>

                  <Badge
                    variant="outline"
                    className={`mt-1 rounded-full ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs text-muted-foreground">Status</p>

                  <p className="text-sm font-medium text-foreground">
                    {task.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">Dates</p>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Start Date */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <CalendarDays className="h-5 w-5 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>

                  <p className="text-sm font-medium text-foreground">
                    {task.start_date || "—"}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-3 rounded-xl border border-border p-3">
                <CalendarDays className="h-5 w-5 shrink-0 text-orange-500" />

                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>

                  <p className="text-sm font-medium text-foreground">
                    {task.due_date || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Attachments
              </p>

              <span className="text-xs text-muted-foreground">
                {task.attachments?.length ?? 0} file
                {(task.attachments?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>

            {task.attachments && task.attachments.length > 0 ? (
              <div className="space-y-2">
                {task.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium text-foreground"
                        title={file.name}
                      >
                        {file.name}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                No attachments.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE — COMMENTS */}
        <div className="min-w-0">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-6">
            {/* Comments Header */}
            <div className="mb-4 shrink-0">
              <p className="text-sm font-semibold text-foreground">Comments</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Discuss this task with your team.
              </p>
            </div>

            {/* Comments */}
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <CommentSection targetId={task.id} targetType="task" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
