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

import { GripVertical, Pencil, Trash2, ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

import type { Task } from "./taskData";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChange: (tasks: Task[]) => void;
}

const PAGE_SIZE = 8;

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  Low: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

function SortableRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
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
      className="border-b transition hover:bg-orange-50/40"
    >
      {/* Drag */}

      <td className="w-12 px-4 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-orange-500 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* Task */}

      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{task.task_name}</p>

          <p className="mt-1 line-clamp-2 text-xs text-gray-500">
            {task.description}
          </p>
        </div>
      </td>

      {/* Project */}

      <td className="px-4 py-4 whitespace-nowrap">{task.project}</td>

      {/* Assignee */}

      <td className="px-4 py-4 whitespace-nowrap">{task.assignee}</td>
      {/* Priority */}

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
            PRIORITY_STYLES[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </td>

      {/* Status */}

      <td className="px-4 py-4">
        <StatusBadge status={task.status} />
      </td>

      {/* Due Date */}

      <td className="whitespace-nowrap px-4 py-4">{task.due_date}</td>

      {/* Actions */}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button size="icon" variant="outline" onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(task)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onChange,
}: TaskTableProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedTasks = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return tasks.slice(start, start + PAGE_SIZE);
  }, [tasks, currentPage]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((task) => task.id === active.id);

    const newIndex = tasks.findIndex((task) => task.id === over.id);

    onChange(arrayMove(tasks, oldIndex, newIndex));
  };

  if (!tasks.length) {
    return (
      <EmptyState
        icon={ClipboardCheck}
        title="No Tasks Found"
        description="Create your first task to get started."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-275 w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-12 px-4 py-3"></th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Task
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Project
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Assignee
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Priority
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Due Date
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedTasks.map((task) => (
                  <SortableRow
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={tasks.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
