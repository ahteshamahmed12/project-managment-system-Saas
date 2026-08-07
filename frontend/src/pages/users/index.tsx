import * as React from "react";
import { Plus, Search, RotateCcw, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import DeleteConfirm from "@/components/common/DeleteConfirm";
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

import { userData, type User } from "./userData";
import SearchFilterBar from "@/components/common/SearchFilterBar";
type StatusFilter = "All" | User["status"];
type RoleFilter = "All" | User["role"];

type UserFormValues = Omit<User, "id" | "created_at">;

const STATUS_OPTIONS: StatusFilter[] = [
  "All",
  "Active",
  "Inactive",
  "Suspended",
];

const ROLE_OPTIONS: RoleFilter[] = ["All", "Admin", "Manager", "Member"];
export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(userData);

  const [search, setSearch] = React.useState("");

  const [status, setStatus] = React.useState<StatusFilter>("All");

  const [role, setRole] = React.useState<RoleFilter>("All");

  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        search === "" ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());

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

    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));

    setSelectedUser(null);
    setDeleteOpen(false);

    // TODO:
    // await userApi.delete(selectedUser.id)
  }, [selectedUser]);

  const handleSave = (values: UserFormValues) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...values,
              }
            : u,
        ),
      );
    } else {
      setUsers((prev) => [
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...values,
        },
        ...prev,
      ]);
    }

    setModalOpen(false);
    setEditingUser(null);
  };
  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-500 p-3 text-white">
            <Users className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Users</h1>

            <p className="text-sm text-gray-500">Manage your team members.</p>
          </div>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <SearchFilterBar>
        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="rounded-xl border-gray-200 pl-9 focus-visible:ring-orange-500"
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger>
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

        <Select value={role} onValueChange={(v) => setRole(v as RoleFilter)}>
          <SelectTrigger>
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
            "gap-2",
            (search || role !== "All" || status !== "All") &&
              "border-orange-300 text-orange-600",
          )}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </SearchFilterBar>
      <UserTable
        users={filteredUsers}
        onChange={setUsers}
        onEdit={handleEdit}
        onDelete={handleDeleteUser}
      />

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSave={handleSave}
      />
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
