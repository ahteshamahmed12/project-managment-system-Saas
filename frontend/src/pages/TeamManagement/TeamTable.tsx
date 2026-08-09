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

import { GripVertical, Pencil, Trash2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EmptyState } from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

import type { Team } from "./teamData";

interface TeamTableProps {
  teams: Team[];
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
  onChange: (teams: Team[]) => void;
}

const PAGE_SIZE = 8;

/* ==========================================================
   SORTABLE ROW
========================================================== */

function SortableRow({
  team,
  onEdit,
  onDelete,
}: {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: team.id,
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
      className={[
        "border-b border-border transition-colors",
        "hover:bg-orange-50 dark:hover:bg-orange-950/30",
        isDragging
          ? "relative z-10 bg-orange-100/80 shadow-md dark:bg-orange-950/50"
          : "",
      ].join(" ")}
    >
      {/* Drag */}

      <td className="w-12 px-4 py-4">
        <button
          type="button"
          {...listeners}
          className="cursor-grab text-muted-foreground transition hover:text-orange-500 active:cursor-grabbing"
          aria-label={`Reorder ${team.team_name}`}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* Team */}

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
            <Users className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="font-medium text-foreground">{team.team_name}</p>

            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
              {team.description}
            </p>
          </div>
        </div>
      </td>

      {/* Project */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
        {team.project}
      </td>

      {/* Team Lead */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-foreground">
        {team.team_lead}
      </td>

      {/* Members */}

      <td className="px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Users className="h-4 w-4 text-muted-foreground" />

          <span>{team.members.length}</span>
        </div>
      </td>

      {/* Status */}

      <td className="px-4 py-4">
        <StatusBadge status={team.status} />
      </td>

      {/* Created At */}

      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
        {new Date(team.created_at).toLocaleDateString()}
      </td>

      {/* Actions */}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => onEdit(team)}
            aria-label={`Edit ${team.team_name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            size="icon"
            variant="destructive"
            onClick={() => onDelete(team)}
            aria-label={`Delete ${team.team_name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================
   TEAM TABLE
========================================================== */

export default function TeamTable({
  teams,
  onEdit,
  onDelete,
  onChange,
}: TeamTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(teams.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedTeams = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return teams.slice(start, start + PAGE_SIZE);
  }, [teams, currentPage]);

  /* ========================================================
     DRAG END
  ======================================================== */

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = teams.findIndex((team) => team.id === active.id);

    const newIndex = teams.findIndex((team) => team.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove(teams, oldIndex, newIndex));
  };

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!teams.length) {
    return (
      <EmptyState
        icon={Users}
        title="No teams found"
        description="There are no teams available to display."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={teams.map((team) => team.id)}
          strategy={verticalListSortingStrategy}
        >
          {/* Table */}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-275 text-sm">
              {/* Header */}

              <thead className="border-b border-border bg-muted/40">
                <tr>
                  {/* Drag */}

                  <th className="w-12 px-4 py-3 text-left text-sm font-semibold text-foreground">
                    #
                  </th>

                  {/* Team */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Team
                  </th>

                  {/* Project */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Project
                  </th>

                  {/* Team Lead */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Team Lead
                  </th>

                  {/* Members */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Members
                  </th>

                  {/* Status */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>

                  {/* Created At */}

                  <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                    Created At
                  </th>

                  {/* Actions */}

                  <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Body */}

              <tbody>
                {paginatedTeams.map((team) => (
                  <SortableRow
                    key={team.id}
                    team={team}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination */}

      <div className="border-t border-border bg-card px-6 py-4">
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={teams.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
