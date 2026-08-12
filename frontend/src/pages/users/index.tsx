import * as React from "react";
import { Plus, Search, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { useUsers } from "@/context/UsersContext";

import DeleteConfirm from "@/components/common/DeleteConfirm";
import SearchFilterBar from "@/components/common/SearchFilterBar";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import UserTable from "./UserTable";
import UserModal from "./UserModal";

import type { User } from "./userData";

type StatusFilter = "All" | User["status"];
type RoleFilter = "All" | User["role"];

type UserFormValues = Omit<User, "id" | "created_at">;

const STATUS_OPTIONS: StatusFilter[] = [
  "All",
  "Active",
  "Inactive",
  "Suspended",
];

const ROLE_OPTIONS: RoleFilter[] = [
  "All",
  "Admin",
  "Manager",
  "Team Lead",
  "Developer",
  "QA",
  "Designer",
  "Member",
];

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useUsers();

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("All");
  const [role, setRole] = React.useState<RoleFilter>("All");

  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        search === "" ||
        user.name.toLowerCase().includes(searchValue) ||
        user.email.toLowerCase().includes(searchValue);

      const matchesStatus = status === "All" || user.status === status;

      const matchesRole = role === "All" || user.role === role;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, status, role]);

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = React.useCallback((user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id);

    setSelectedUser(null);
    setDeleteOpen(false);
  }, [selectedUser, deleteUser]);

  const handleSave = (values: UserFormValues) => {
    if (editingUser) {
      updateUser(editingUser.id, values);
    } else {
      addUser({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...values,
      });
    }

    setModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>

          <p className="text-sm text-muted-foreground">
            Manage your team members.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-orange-500 text-white hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filters */}

      <SearchFilterBar>
        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="rounded-xl border-border bg-background pl-9 focus-visible:ring-orange-500"
          />
        </div>

        <Select
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
        >
          <SelectTrigger className="border-border bg-background">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {STATUS_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={role}
          onValueChange={(value) => setRole(value as RoleFilter)}
        >
          <SelectTrigger className="border-border bg-background">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {ROLE_OPTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setRole("All");
            setStatus("All");
          }}
          className={cn(
            "gap-2 border-border text-muted-foreground",
            (search || role !== "All" || status !== "All") &&
              "border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </SearchFilterBar>

      {/* Table */}

      <UserTable
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDeleteUser}
      />

      {/* User Modal */}

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}

      <DeleteConfirm
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${selectedUser?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
