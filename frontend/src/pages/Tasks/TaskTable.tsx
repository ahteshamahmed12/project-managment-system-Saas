import * as React from "react";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  GripVertical,
  Pencil,
  Trash2,
  ClipboardCheck,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

import type { Task } from "./taskData";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
  onChange: (tasks: Task[]) => void;
}
const PAGE_SIZE = 8;

/* ==========================================================
   PRIORITY STYLES
========================================================== */

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  Low: "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-400",

  Medium:
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950/50 dark:text-yellow-400",

  High: "border-red-200 bg-red-100 text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400",
};

/* ==========================================================
   SORTABLE ROW
========================================================== */

function SortableRow({
  task,
  onEdit,
  onDelete,
  onView,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onView: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`border-b border-border bg-card transition-colors ${
        isDragging
          ? "bg-orange-100 dark:bg-orange-950/40"
          : "hover:bg-orange-50 dark:hover:bg-orange-950/30"
      }`}
    >
      {/* ==================================================
          DRAG
      ================================================== */}

      <td className="w-12 px-4 py-4">
        <button
          type="button"
          {...listeners}
          className="cursor-grab text-muted-foreground transition-colors hover:text-orange-500 active:cursor-grabbing"
          aria-label={`Drag ${task.task_name}`}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* ==================================================
          TASK
      ================================================== */}

      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-foreground">{task.task_name}</p>

          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        </div>
      </td>

      {/* ==================================================
          PROJECT
      ================================================== */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
        {task.project}
      </td>

      {/* ==================================================
          ASSIGNEE
      ================================================== */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
        {task.assignee}
      </td>

      {/* ==================================================
          PRIORITY
      ================================================== */}

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </td>

      {/* ==================================================
          STATUS
      ================================================== */}

      <td className="px-4 py-4">
        <StatusBadge status={task.status} />
      </td>
      <td className="px-4 py-4">
        {task.attachments?.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {task.attachments.map((file) => (
              <a
                key={file.id}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:hover:bg-orange-950/70"
                title={`Open ${file.name}`}
              >
                {file.name.length > 18
                  ? `${file.name.slice(0, 18)}...`
                  : file.name}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No files</span>
        )}
      </td>
      {/* ==================================================
          DUE DATE
      ================================================== */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
        {task.due_date}
      </td>

      {/* ==================================================
          ACTIONS
      ================================================== */}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => onView(task)}
            aria-label={`View ${task.task_name}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => onEdit(task)}
            aria-label={`Edit ${task.task_name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={() => onDelete(task)}
            aria-label={`Delete ${task.task_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================
   TASK TABLE
========================================================== */

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onView,
  onChange,
}: TaskTableProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const [page, setPage] = React.useState(1);

  /* ========================================================
     PAGINATION
  ======================================================== */

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedTasks = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return tasks.slice(start, start + PAGE_SIZE);
  }, [tasks, currentPage]);

  /* ========================================================
     DRAG END
  ======================================================== */

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = tasks.findIndex((task) => task.id === active.id);

    const newIndex = tasks.findIndex((task) => task.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove(tasks, oldIndex, newIndex));
  };

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!tasks.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No tasks found"
        description="There are no tasks available to display."
      />
    );
  }

  /* ========================================================
     UI
  ======================================================== */

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-250">
              {/* ==================================================
                  HEADER
              ================================================== */}

              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {/* Drag */}

                  <th className="w-12 px-4 py-3 text-left text-sm font-semibold text-foreground">
                    #
                  </th>

                  {/* Task */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Task
                  </th>

                  {/* Project */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Project
                  </th>

                  {/* Assignee */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Assignee
                  </th>

                  {/* Priority */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Priority
                  </th>

                  {/* Status */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Attachments
                  </th>

                  {/* Due Date */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Due Date
                  </th>
                  {/* Actions */}

                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* ==================================================
                  BODY
              ================================================== */}

              <tbody>
                {paginatedTasks.map((task) => (
                  <SortableRow
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      <div className="border-t border-border bg-card px-6 py-4">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={tasks.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
