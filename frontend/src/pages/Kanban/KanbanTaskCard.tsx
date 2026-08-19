import { Draggable } from "@hello-pangea/dnd";
import { Calendar, MessageSquare, OctagonAlert, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  PRIORITY_LABELS,
  type KanbanTask,
} from "@/types/kanban";

const PRIORITY_STYLES: Record<KanbanTask["priority"], string> = {
  critical:
    "border border-red-300 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  high: "border border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  medium:
    "border border-purple-300 bg-purple-100 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  low: "border border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

function formatDueDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

interface KanbanTaskCardProps {
  task: KanbanTask;
  index: number;
  onOpen: (task: KanbanTask) => void;
}

export default function KanbanTaskCard({
  task,
  index,
  onOpen,
}: KanbanTaskCardProps) {
  const isOverdue =
    task.due_date &&
    !task.is_completed &&
    new Date(task.due_date).getTime() < Date.now();

  return (
    <Draggable draggableId={`task-${task.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpen(task)}
          className={cn(
            "cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:hover:border-orange-800",
            snapshot.isDragging &&
              "rotate-2 border-orange-400 shadow-xl ring-2 ring-orange-300 dark:ring-orange-800",
            task.is_blocked && "border-red-300 dark:border-red-800",
          )}
          style={provided.draggableProps.style}
        >
          {/* Title */}
          <p className="line-clamp-2 text-sm font-semibold text-foreground">
            {task.title}
          </p>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Meta row */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  PRIORITY_STYLES[task.priority],
                )}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>

              {task.story_points != null && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Plus className="h-3 w-3" />
                  {task.story_points}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {task.is_blocked && (
                <OctagonAlert
                  className="h-4 w-4 text-red-500"
                  aria-label="Blocked"
                />
              )}

              {task.due_date && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-[11px]",
                    isOverdue
                      ? "font-semibold text-red-600 dark:text-red-400"
                      : "text-muted-foreground",
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {formatDueDate(task.due_date)}
                </span>
              )}

              {task.comment_count > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {task.comment_count}
                </span>
              )}

              {task.assignee_name && (
                <Avatar size="sm" className="h-6 w-6">
                  <AvatarImage
                    src={task.assignee_avatar ?? undefined}
                    alt={task.assignee_name}
                  />
                  <AvatarFallback>
                    {task.assignee_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}