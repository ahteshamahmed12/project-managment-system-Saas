import { Pencil, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type {
  PermissionModule,
  Role,
  PermissionAction,
} from "./permissionsData";

interface PermissionTableProps {
  roles: Role[];
  modules: PermissionModule[];
  onEdit: (role: Role) => void;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  manage: "Manage",
};

function hasPermission(role: Role, moduleId: string, action: PermissionAction) {
  const rolePermission = role.permissions.find(
    (permission) => permission.moduleId === moduleId,
  );

  return rolePermission?.permissions.includes(action) ?? false;
}

export default function PermissionTable({
  roles,
  modules,
  onEdit,
}: PermissionTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-foreground">
            Role Permissions
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage access levels and permissions for each role.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-250 text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-4 text-left font-semibold text-foreground">
                Role
              </th>

              <th className="px-4 py-4 text-left font-semibold text-foreground">
                Users
              </th>

              {modules.map((module) => (
                <th
                  key={module.id}
                  className="px-4 py-4 text-center font-semibold text-foreground"
                >
                  {module.name}
                </th>
              ))}

              <th className="px-5 py-4 text-right font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role) => (
              <tr
                key={role.id}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                {/* Role */}
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-foreground">{role.name}</p>

                    <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </td>

                {/* Users */}
                <td className="px-4 py-4">
                  <Badge variant="secondary" className="rounded-full">
                    {role.usersCount}
                  </Badge>
                </td>

                {/* Permissions */}
                {modules.map((module) => {
                  const enabledActions = module.actions.filter((action) =>
                    hasPermission(role, module.id, action),
                  );

                  return (
                    <td key={module.id} className="px-4 py-4 text-center">
                      {enabledActions.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                          {enabledActions.map((action) => (
                            <Badge
                              key={action}
                              variant="outline"
                              className="rounded-full border-orange-200 bg-orange-50 text-xs text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/30 dark:text-orange-400"
                            >
                              {ACTION_LABELS[action]}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No access
                        </span>
                      )}
                    </td>
                  );
                })}

                {/* Action */}
                <td className="px-5 py-4 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(role)}
                    className="gap-2 rounded-xl"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {roles.length === 0 && (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No roles found.
        </div>
      )}
    </div>
  );
}
