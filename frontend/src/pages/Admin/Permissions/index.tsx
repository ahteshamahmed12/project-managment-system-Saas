import { useMemo, useState } from "react";
import { Search, ShieldCheck, Users } from "lucide-react";

import { Input } from "@/components/ui/input";

import PermissionModal from "./PermissionModal";
import PermissionTable from "./PermissionTable";

import { permissionUsers, type PermissionUser } from "./permissionsData";

export default function Permissions() {
  const [users, setUsers] = useState<PermissionUser[]>(permissionUsers);

  const [selectedUser, setSelectedUser] = useState<PermissionUser | null>(null);

  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    );
  }, [users, search]);

  const handleEdit = (user: PermissionUser) => {
    setSelectedUser(user);
  };

  const handleClose = () => {
    setSelectedUser(null);
  };

  const handleSave = (updatedUser: PermissionUser) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === updatedUser.id ? updatedUser : user,
      ),
    );

    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Permissions
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage access and permissions for individual users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Users */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>

              <p className="mt-1 text-2xl font-bold text-foreground">
                {users.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>

              <p className="mt-1 text-2xl font-bold text-foreground">
                {users.filter((user) => user.status === "Active").length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/30 dark:text-green-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Total Enabled Permissions */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Enabled Permissions
              </p>

              <p className="mt-1 text-2xl font-bold text-foreground">
                {users.reduce(
                  (total, user) =>
                    total +
                    user.permissions.filter((permission) => permission.enabled)
                      .length,
                  0,
                )}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">User Access</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Select a user to manage their permissions.
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users..."
            className="h-10 rounded-xl pl-9"
          />
        </div>
      </div>

      {/* =====================================================
          USER PERMISSION TABLE
      ====================================================== */}
      <PermissionTable users={filteredUsers} onEdit={handleEdit} />

      {/* =====================================================
          PERMISSION SIDE PANEL
      ====================================================== */}
      <PermissionModal
        user={selectedUser}
        open={Boolean(selectedUser)}
        onClose={handleClose}
        onSave={handleSave}
      />
    </div>
  );
}
