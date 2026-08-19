import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  PRIORITY_LABELS,
  type KanbanColumn,
  type KanbanPriority,
  type KanbanTask,
  type KanbanUser,
} from "@/types/kanban";

interface KanbanTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: KanbanTask | null;
  columns: KanbanColumn[];
  users: KanbanUser[];
  onCreate: (payload: {
    title: string;
    description: string | null;
    column_id: number | null;
    priority: KanbanPriority;
    assignee_id: string | null;
    story_points: number | null;
    time_estimate: number | null;
    due_date: string | null;
    tags: string[];
  }) => Promise<void>;
  onUpdate: (
    taskId: number,
    payload: {
      title: string;
      description: string | null;
      column_id: number | null;
      priority: KanbanPriority;
      assignee_id: string | null;
      story_points: number | null;
      time_estimate: number | null;
      due_date: string | null;
      tags: string[];
      is_blocked: boolean;
      blocked_reason: string | null;
    },
  ) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
  saving: boolean;
}

interface FormState {
  title: string;
  description: string;
  column_id: string;
  priority: KanbanPriority;
  assignee_id: string;
  story_points: string;
  time_estimate: string;
  due_date: string;
  tags: string;
  is_blocked: boolean;
  blocked_reason: string;
}

function toForm(task: KanbanTask | null, columns: KanbanColumn[]): FormState {
  if (!task) {
    return {
      title: "",
      description: "",
      column_id: columns[0] ? String(columns[0].id) : "",
      priority: "medium",
      assignee_id: "",
      story_points: "",
      time_estimate: "",
      due_date: "",
      tags: "",
      is_blocked: false,
      blocked_reason: "",
    };
  }

  return {
    title: task.title,
    description: task.description ?? "",
    column_id: String(task.column_id),
    priority: task.priority,
    assignee_id: task.assignee_id ?? "",
    story_points: task.story_points != null ? String(task.story_points) : "",
    time_estimate:
      task.time_estimate != null ? String(task.time_estimate) : "",
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    tags: (task.tags ?? []).join(", "),
    is_blocked: task.is_blocked,
    blocked_reason: task.blocked_reason ?? "",
  };
}

export default function KanbanTaskModal({
  open,
  onOpenChange,
  task,
  columns,
  users,
  onCreate,
  onUpdate,
  onDelete,
  saving,
}: KanbanTaskModalProps) {
  const [form, setForm] = React.useState<FormState>(() =>
    toForm(task, columns),
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm(toForm(task, columns));
      setError(null);
    }
  }, [open, task, columns]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    const storyPoints =
      form.story_points.trim() === ""
        ? null
        : Number(form.story_points);
    if (
      storyPoints !== null &&
      (Number.isNaN(storyPoints) || storyPoints < 0)
    ) {
      setError("Story points must be a positive number.");
      return;
    }

    const timeEstimate =
      form.time_estimate.trim() === ""
        ? null
        : Number(form.time_estimate);
    if (
      timeEstimate !== null &&
      (Number.isNaN(timeEstimate) || timeEstimate < 0)
    ) {
      setError("Time estimate must be a positive number.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      column_id: form.column_id ? Number(form.column_id) : null,
      priority: form.priority,
      assignee_id:
        form.assignee_id === "__unassigned__" || form.assignee_id === ""
          ? null
          : form.assignee_id,
      story_points: storyPoints,
      time_estimate: timeEstimate,
      due_date: form.due_date || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (task) {
        await onUpdate(task.id, {
          ...payload,
          is_blocked: form.is_blocked,
          blocked_reason: form.is_blocked
            ? form.blocked_reason.trim() || null
            : null,
        });
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Title */}
          <div>
            <Label>Task Title</Label>
            <Input
              name="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          {/* Description */}
          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Enter description"
            />
          </div>

          {/* Column, Priority, Assignee */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Column</Label>
              <Select
                value={form.column_id}
                onValueChange={(value) => set("column_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={String(column.id)}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  set("priority", value as KanbanPriority)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as KanbanPriority[]).map(
                    (priority) => (
                      <SelectItem key={priority} value={priority}>
                        {PRIORITY_LABELS[priority]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label>Assignee</Label>
              <Select
                value={form.assignee_id}
                onValueChange={(value) => set("assignee_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Story points, estimate, due date */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label>Story Points</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                name="story_points"
                value={form.story_points}
                onChange={(e) => set("story_points", e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Time Estimate (hrs)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                name="time_estimate"
                value={form.time_estimate}
                onChange={(e) => set("time_estimate", e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={(e) => set("due_date", e.target.value)}
                className="scheme-light dark:scheme-dark"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags (comma separated)</Label>
            <Input
              name="tags"
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="frontend, bug, v2"
            />
          </div>

          {/* Blocked */}
          {task && (
            <div className="space-y-3 rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="blocked"
                  checked={form.is_blocked}
                  onCheckedChange={(checked) =>
                    set("is_blocked", checked === true)
                  }
                />
                <Label htmlFor="blocked" className="cursor-pointer">
                  Blocked
                </Label>
              </div>

              {form.is_blocked && (
                <Input
                  name="blocked_reason"
                  value={form.blocked_reason}
                  onChange={(e) => set("blocked_reason", e.target.value)}
                  placeholder="Reason for blocking"
                />
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            {task ? (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  try {
                    await onDelete(task.id);
                    onOpenChange(false);
                  } catch (err) {
                    setError(
                      err instanceof Error
                        ? err.message
                        : "Failed to delete task.",
                    );
                  }
                }}
                disabled={saving}
              >
                Delete
              </Button>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {saving ? "Saving..." : task ? "Update Task" : "Create Task"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}