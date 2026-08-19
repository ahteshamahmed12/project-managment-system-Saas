import { Droppable } from "@hello-pangea/dnd";
import { Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import KanbanTaskCard from "./KanbanTaskCard";
import type { KanbanColumnDetail, KanbanTask } from "@/types/kanban";

interface KanbanColumnProps {
  column: KanbanColumnDetail;
  tasks: KanbanTask[];
  onAddTask: (columnId: number) => void;
  onOpenTask: (task: KanbanTask) => void;
  onDeleteColumn: (column: KanbanColumnDetail) => void;
}

export default function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onOpenTask,
  onDeleteColumn,
}: KanbanColumnProps) {
  const atLimit =
    column.wip_limit != null && tasks.length >= column.wip_limit;
  const overLimit =
    column.wip_limit != null && tasks.length > column.wip_limit;

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-muted/40">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {column.name}
          </span>

          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
              overLimit
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : atLimit
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
            )}
          >
            {tasks.length}
          </span>

          {column.wip_limit != null && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                overLimit
                  ? "text-red-500"
                  : atLimit
                    ? "text-yellow-500"
                    : "text-muted-foreground",
              )}
            >
              / {column.wip_limit} WIP
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Add task to ${column.name}`}
            onClick={() => onAddTask(column.id)}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
          >
            <Plus className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${column.name}`}
            onClick={() => onDeleteColumn(column)}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <Droppable droppableId={`column-${column.id}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex min-h-40 flex-1 flex-col gap-2.5 overflow-y-auto p-3 transition-colors",
              snapshot.isDraggingOver &&
                "bg-orange-50/70 dark:bg-orange-950/20",
            )}
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task.id}
                task={task}
                index={index}
                onOpen={onOpenTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No tasks here yet
              </p>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}