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
import React from "react";

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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: sprint.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b last:border-b-0 hover:bg-gray-50"
    >
      {/* Drag */}

      <td className="w-12 px-4 py-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 transition hover:text-orange-500 active:cursor-grabbing"
          aria-label={`Drag ${sprint.sprint_name}`}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* Sprint */}

      <td className="px-4 py-4">
        <div>
          <p className="font-medium text-gray-900">{sprint.sprint_name}</p>

          <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
            {sprint.goal}
          </p>
        </div>
      </td>

      {/* Project */}

      <td className="px-4 py-4 text-sm text-gray-700">{sprint.project}</td>

      {/* Start Date */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
        {sprint.start_date}
      </td>

      {/* End Date */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600">
        {sprint.end_date}
      </td>

      {/* Status */}

      <td className="px-4 py-4">
        <StatusBadge status={sprint.status} />
      </td>

      {/* Created By */}

      <td className="px-4 py-4 text-sm text-gray-700">{sprint.created_by}</td>

      {/* Actions */}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => onEdit(sprint)}
            aria-label={`Edit ${sprint.sprint_name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={() => onDelete(sprint)}
            aria-label={`Delete ${sprint.sprint_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================
   TABLE
========================================================== */

export default function SprintTable({
  sprints,
  onEdit,
  onDelete,
  onChange,
}: SprintTableProps) {
  const sensors = useSensors(useSensor(PointerSensor));

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

  const handleDragEnd = (event: DragEndEvent) => {
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
  };

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!sprints.length) {
    return (
      <EmptyState
        icon={GripVertical}
        title="No sprints found"
        description="There are no sprints to display."
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
            items={sprints.map((sprint) => sprint.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-275 w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="w-12 px-4 py-3" />

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Sprint
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Project
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Start Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    End Date
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Created By
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedSprints.map((sprint) => (
                  <SortableRow
                    key={sprint.id}
                    sprint={sprint}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>

      {/* Pagination */}

      <div className="border-t bg-white px-6 py-4">
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
