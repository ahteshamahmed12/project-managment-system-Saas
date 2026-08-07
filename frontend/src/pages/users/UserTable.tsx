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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { EmptyState } from "@/components/common/EmptyState";

import type { User } from "./userData";
import Pagination from "@/components/common/Pagination";
import StatusBadge from "@/components/common/StatusBadge";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onChange: (users: User[]) => void;
}

const PAGE_SIZE = 8;

function SortableRow({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: user.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="border-b transition-colors hover:bg-orange-50/40"
    >
      {/* Drag */}

      <td className="w-12 px-4 py-4">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 transition hover:text-orange-500 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </td>

      {/* User */}

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} />

            <AvatarFallback className="bg-orange-100 text-orange-600">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-medium text-gray-900">{user.name}</p>

            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Phone */}

      <td className="px-4 py-4 text-sm">{user.phone}</td>

      {/* Role */}

      <td className="px-4 py-4">{user.role}</td>

      {/* Department */}

      <td className="px-4 py-4">{user.department}</td>

      {/* Status */}

      <td className="px-4 py-4">
        <StatusBadge status={user.status} />
      </td>

      {/* Joining */}

      <td className="px-4 py-4 whitespace-nowrap">{user.joining_date}</td>

      {/* Actions */}

      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2">
          <Button size="icon" variant="outline" onClick={() => onEdit(user)}>
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(user)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  onChange,
}: UserTableProps) {
  const sensors = useSensors(useSensor(PointerSensor));

  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);

  const paginatedUsers = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return users.slice(start, start + PAGE_SIZE);
  }, [users, currentPage]);
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = users.findIndex((u) => u.id === active.id);
    const newIndex = users.findIndex((u) => u.id === over.id);

    onChange(arrayMove(users, oldIndex, newIndex));
  };

  if (!users.length) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="Create your first user to get started."
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
            items={users.map((u) => u.id)}
            strategy={verticalListSortingStrategy}
          >
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-b">
                  <th className="w-12 px-4 py-3"></th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    User
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Role
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Department
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Joining Date
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((user) => (
                  <SortableRow
                    key={user.id}
                    user={user}
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
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        totalItems={users.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  );
}
