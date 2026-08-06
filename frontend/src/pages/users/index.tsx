import * as React from "react";
import { Plus, Search, RotateCcw, Users } from "lucide-react";

import { cn } from "@/lib/utils";

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

  const handleDelete = (user: User) => {
    if (!window.confirm(`Delete ${user.name}?`)) return;

    setUsers((prev) => prev.filter((x) => x.id !== user.id));
  };

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

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9"
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
        </div>
      </div>

      <UserTable
        users={filteredUsers}
        onChange={setUsers}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editingUser}
        onSave={handleSave}
      />
    </div>
  );
}
