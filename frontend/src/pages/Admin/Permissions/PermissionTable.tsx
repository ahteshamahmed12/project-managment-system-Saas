import { Settings, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { PermissionUser } from "./permissionsData";

interface PermissionTableProps {
  users: PermissionUser[];
  onEdit: (user: PermissionUser) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getEnabledCount(user: PermissionUser) {
  return user.permissions.filter((permission) => permission.enabled).length;
}

export default function PermissionTable({
  users,
  onEdit,
}: PermissionTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            User Permissions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage permissions and access for individual users.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-212.5 text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-4 text-left font-semibold text-foreground">
                User
              </th>

              <th className="px-4 py-4 text-left font-semibold text-foreground">
                Role
              </th>

              <th className="px-4 py-4 text-left font-semibold text-foreground">
                Status
              </th>

              <th className="px-4 py-4 text-center font-semibold text-foreground">
                Permissions
              </th>

              <th className="px-5 py-4 text-right font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => {
              const enabledCount = getEnabledCount(user);
              const totalCount = user.permissions.length;

              return (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-orange-50/50 dark:hover:bg-orange-950/10"
                >
                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />

                        <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1"
                    >
                      {user.role}
                    </Badge>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={
                        user.status === "Active"
                          ? "rounded-full border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
                          : "rounded-full border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
                      }
                    >
                      {user.status}
                    </Badge>
                  </td>

                  {/* Permission Count */}
                  <td className="px-4 py-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                      <span className="font-semibold text-foreground">
                        {enabledCount}
                      </span>

                      <span className="text-muted-foreground">/</span>

                      <span className="text-muted-foreground">
                        {totalCount}
                      </span>

                      <span className="hidden text-xs text-muted-foreground sm:inline">
                        enabled
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(user)}
                      className="gap-2 rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-900/50 dark:text-orange-400 dark:hover:bg-orange-950/30"
                    >
                      <Settings className="h-4 w-4" />
                      Permissions
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground" />

          <p className="mt-3 text-sm font-medium text-foreground">
            No users found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            There are no users available to manage permissions.
          </p>
        </div>
      )}
    </div>
  );
}
