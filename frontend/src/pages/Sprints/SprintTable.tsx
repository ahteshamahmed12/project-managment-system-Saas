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

import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

import type { Sprint } from "./sprintData";

interface SprintTableProps {
  sprints: Sprint[];
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
  onChange: (sprints: Sprint[]) => void;
}

const PAGE_SIZE = 8;

/* ==========================================================
   SORTABLE ROW
========================================================== */

function SortableRow({
  sprint,
  onEdit,
  onDelete,
}: {
  sprint: Sprint;
  onEdit: (sprint: Sprint) => void;
  onDelete: (sprint: Sprint) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sprint.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group border-b border-border transition-colors hover:bg-orange-50/60 dark:hover:bg-orange-950/20 ${
        isDragging
          ? "bg-orange-50 shadow-lg ring-1 ring-orange-300 dark:bg-orange-950/30"
          : ""
      }`}
    >
      {/* Drag */}

      <td className="w-10 py-3">
        <button
          type="button"
          aria-label={`Drag ${sprint.sprint_name}`}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* Sprint */}

      <td className="px-4 py-3">
        <div>
          <p className="font-semibold text-foreground">{sprint.sprint_name}</p>

          <p
            className="mt-1 max-w-xs truncate text-xs text-muted-foreground"
            title={sprint.goal}
          >
            {sprint.goal}
          </p>
        </div>
      </td>

      {/* Project */}

      <td className="px-4 py-3 text-sm text-foreground">{sprint.project}</td>

      {/* Start Date */}

      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {sprint.start_date}
      </td>

      {/* End Date */}

      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {sprint.end_date}
      </td>

      {/* Status */}

      <td className="px-4 py-3">
        <StatusBadge status={sprint.status} />
      </td>

      {/* Created By */}

      <td className="px-4 py-3 text-sm text-foreground">{sprint.created_by}</td>

      {/* Actions */}

      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${sprint.sprint_name}`}
            onClick={() => onEdit(sprint)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${sprint.sprint_name}`}
            onClick={() => onDelete(sprint)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================
   MAIN TABLE
========================================================== */

export default function SprintTable({
  sprints,
  onEdit,
  onDelete,
  onChange,
}: SprintTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(sprints.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedSprints = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return sprints.slice(start, start + PAGE_SIZE);
  }, [sprints, currentPage]);

  /* ========================================================
     DRAG END
  ======================================================== */

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = sprints.findIndex((sprint) => sprint.id === active.id);

      const newIndex = sprints.findIndex((sprint) => sprint.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      onChange(arrayMove(sprints, oldIndex, newIndex));
    },
    [sprints, onChange],
  );

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!sprints.length) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={Trash2}
          title="No sprints found"
          description="Create a sprint to start planning and tracking your work."
        />
      </div>
    );
  }

  /* ========================================================
     TABLE
  ======================================================== */

  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
      <div className="w-full overflow-x-auto rounded-2xl">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="min-w-250 w-full">
            {/* Table Header */}

            <thead>
              <tr className="border-b border-border bg-muted/50 hover:bg-muted/70">
                <th className="w-10 px-2 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  #
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Sprint
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Project
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Start Date
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  End Date
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Created By
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody>
              <SortableContext
                items={paginatedSprints.map((sprint) => sprint.id)}
                strategy={verticalListSortingStrategy}
              >
                {paginatedSprints.map((sprint) => (
                  <SortableRow
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div>

      {/* Pagination */}

      <div className="border-t border-border bg-card px-6 py-4">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={sprints.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
