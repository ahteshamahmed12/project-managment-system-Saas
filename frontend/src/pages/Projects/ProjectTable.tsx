"use client";

import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* =========================================================
   TYPES
========================================================= */

export interface Project {
  id: string;
  project_name: string;
  project_image: string;
  description: string;
  status: "Active" | "On Hold" | "Completed";
  priority: "Low" | "Medium" | "High";
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
}

export interface ProjectTableProps {
  projects: Project[];
  onChange: (projects: Project[]) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

/* =========================================================
   STATIC CONFIG
========================================================= */

const STATUS_STYLES: Record<Project["status"], string> = {
  Active: "bg-green-100 text-green-700 border border-green-300",
  "On Hold": "bg-yellow-100 text-yellow-700 border border-yellow-300",
  Completed: "bg-blue-100 text-blue-700 border border-blue-300",
};

const PRIORITY_STYLES: Record<Project["priority"], string> = {
  Low: "bg-gray-100 text-gray-700 border border-gray-300",
  Medium: "bg-orange-100 text-orange-700 border border-orange-300",
  High: "bg-red-100 text-red-700 border border-red-300",
};

const TABLE_COLUMNS = [
  { id: "drag", label: "", className: "w-10" },
  { id: "image", label: "Image", className: "w-16" },
  { id: "project_name", label: "Project Name", className: "min-w-[160px]" },
  { id: "description", label: "Description", className: "min-w-[220px]" },
  { id: "status", label: "Status", className: "w-32" },
  { id: "priority", label: "Priority", className: "w-28" },
  { id: "start_date", label: "Start Date", className: "w-32" },
  { id: "end_date", label: "End Date", className: "w-32" },
  { id: "actions", label: "Actions", className: "w-28 text-right" },
] as const;

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* =========================================================
   PROJECT IMAGE
========================================================= */

interface ProjectImageProps {
  src: string;
  alt: string;
}

function ProjectImage({ src, alt }: ProjectImageProps): React.JSX.Element {
  const [hasError, setHasError] = React.useState<boolean>(!src);

  if (hasError) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-gray-400">
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="h-11 w-11 shrink-0 rounded-xl border border-gray-200 object-cover shadow-sm"
    />
  );
}

/* =========================================================
   SORTABLE ROW
========================================================= */

interface SortableRowProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function SortableRow({
  project,
  onEdit,
  onDelete,
}: SortableRowProps): React.JSX.Element {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group border-b border-gray-100 transition-colors hover:bg-orange-50/60",
        isDragging && "bg-orange-50 shadow-lg ring-1 ring-orange-300",
      )}
    >
      <TableCell className="w-10 py-3">
        <button
          type="button"
          aria-label="Drag to reorder"
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-orange-100 hover:text-orange-600 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>

      <TableCell className="py-3">
        <ProjectImage src={project.project_image} alt={project.project_name} />
      </TableCell>

      <TableCell className="max-w-50 py-3 font-semibold text-gray-900">
        <span className="line-clamp-1">{project.project_name}</span>
      </TableCell>

      <TableCell className="max-w-65 py-3 text-sm text-gray-500">
        <span
          className="line-clamp-1 block truncate"
          title={project.description}
        >
          {project.description || "—"}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-2.5 py-0.5 font-medium",
            STATUS_STYLES[project.status],
          )}
        >
          {project.status}
        </Badge>
      </TableCell>

      <TableCell className="py-3">
        <Badge
          variant="outline"
          className={cn(
            "rounded-full px-2.5 py-0.5 font-medium",
            PRIORITY_STYLES[project.priority],
          )}
        >
          {project.priority}
        </Badge>
      </TableCell>

      <TableCell className="whitespace-nowrap py-3 text-sm text-gray-600">
        {formatDate(project.start_date)}
      </TableCell>

      <TableCell className="whitespace-nowrap py-3 text-sm text-gray-600">
        {formatDate(project.end_date)}
      </TableCell>

      <TableCell className="py-3 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Edit ${project.project_name}`}
            onClick={() => onEdit(project)}
            className="h-8 w-8 rounded-lg text-gray-500 hover:bg-orange-100 hover:text-orange-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Delete ${project.project_name}`}
            onClick={() => onDelete(project)}
            className="h-8 w-8 rounded-lg text-gray-500 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState(): React.JSX.Element {
  return (
    <TableRow>
      <TableCell colSpan={TABLE_COLUMNS.length} className="py-16 text-center">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
            <ImageOff className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-gray-700">No projects yet</p>
          <p className="text-xs text-gray-400">
            Projects you create will appear here.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function ProjectTable({
  projects,
  onChange,
  onEdit,
  onDelete,
}: ProjectTableProps): React.JSX.Element {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = projects.findIndex((p) => p.id === active.id);
      const newIndex = projects.findIndex((p) => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      onChange(arrayMove(projects, oldIndex, newIndex));
    },
    [projects, onChange],
  );

  const projectIds = React.useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto rounded-2xl">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Table className="min-w-240">
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-gray-50/80 hover:bg-gray-50/80">
                {TABLE_COLUMNS.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "py-3 text-xs font-semibold uppercase tracking-wide text-gray-500",
                      column.className,
                    )}
                  >
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {projects.length === 0 ? (
                <EmptyState />
              ) : (
                <SortableContext
                  items={projectIds}
                  strategy={verticalListSortingStrategy}
                >
                  {projects.map((project) => (
                    <SortableRow
                      key={project.id}
                      project={project}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}

export default ProjectTable;
