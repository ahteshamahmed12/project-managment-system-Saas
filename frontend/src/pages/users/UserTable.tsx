import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ExternalLink,
  GripVertical,
  MoreVertical,
  Pencil,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { EmptyState } from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

import type { User } from "./userData";

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onPermissions: (user: User) => void;
  onChange?: (users: User[]) => void;
}

const PAGE_SIZE = 8;

/* ==========================================================
   SORTABLE ROW
========================================================== */

function SortableRow({
  user,
  onView,
  onEdit,
  onDelete,
  onPermissions,
}: {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onPermissions: (user: User) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: user.id,
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
          {...attributes}
          {...listeners}
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30 active:cursor-grabbing"
          aria-label={`Reorder ${user.name}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>

      {/* User */}

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} />

            <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              {user.name
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold text-foreground">{user.name}</p>

            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Phone */}

      <td className="px-4 py-3 text-sm text-foreground">{user.phone}</td>

      {/* Role */}

      <td className="px-4 py-3 text-sm text-foreground">{user.role}</td>

      {/* Department */}

      <td className="px-4 py-3 text-sm text-foreground">{user.department}</td>

      {/* Status */}

      <td className="px-4 py-3">
        <StatusBadge status={user.status} />
      </td>

      {/* Joining Date */}

      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
        {user.joining_date}
      </td>

      {/* Actions */}

      <td className="px-4 py-3 text-right">
        <div className="flex space-x-2 items-center justify-between">
          {/* View Profile */}
          <Button
            // type="button"
            variant="ghost"
            // size="icon"
            aria-label={`View ${user.name}`}
            onClick={() => onView(user)}
            className="text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:te-orange-950/30"
          >
            <span> View Profile </span>
            <ExternalLink className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`More actions for ${user.name}`}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-950/30"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onPermissions(user)}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Permissions
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================
   MAIN TABLE
========================================================== */

export default function UserTable({
  users,
  onView,
  onEdit,
  onDelete,
  onPermissions,
  onChange,
}: UserTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return users.slice(start, start + PAGE_SIZE);
  }, [users, currentPage]);

  /* ========================================================
     DRAG END
  ======================================================== */

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = users.findIndex((user) => user.id === active.id);

      const newIndex = users.findIndex((user) => user.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      onChange?.(arrayMove(users, oldIndex, newIndex));
    },
    [users, onChange],
  );

  /* ========================================================
     EMPTY STATE
  ======================================================== */

  if (!users.length) {
    return (
      <div className="w-full rounded-2xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={Trash2}
          title="No users found"
          description="Create a user to start managing your team members."
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
                  User
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Phone
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Role
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Department
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Status
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Joining Date
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}

            <tbody>
              <SortableContext
                items={paginatedUsers.map((user) => user.id)}
                strategy={verticalListSortingStrategy}
              >
                {paginatedUsers.map((user) => (
                  <SortableRow
                    key={user.id}
                    user={user}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onPermissions={onPermissions}
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
          totalItems={users.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
