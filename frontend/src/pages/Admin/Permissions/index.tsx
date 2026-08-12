import * as React from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

import PermissionTable from "./PermissionTable";
import PermissionModal from "./PermissionModal";

import { permissionModules, roles, type Role } from "./permissionsData";

export default function PermissionsPage() {
  const [roleList, setRoleList] = React.useState<Role[]>(roles);

  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleEditRole = React.useCallback((role: Role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  }, []);

  const handleSaveRole = React.useCallback((updatedRole: Role) => {
    setRoleList((current) =>
      current.map((role) => (role.id === updatedRole.id ? updatedRole : role)),
    );

    setSelectedRole(null);
  }, []);

  const handleModalChange = React.useCallback((open: boolean) => {
    setIsModalOpen(open);

    if (!open) {
      setSelectedRole(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
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
                Manage roles and control system access permissions.
              </p>
            </div>
          </div>
        </div>

        <Button type="button" variant="outline" className="w-fit rounded-xl">
          {roleList.length} Roles
        </Button>
      </div>

      {/* Permission Table */}
      <PermissionTable
        roles={roleList}
        modules={permissionModules}
        onEdit={handleEditRole}
      />

      {/* Permission Modal */}
      <PermissionModal
        open={isModalOpen}
        onOpenChange={handleModalChange}
        role={selectedRole}
        modules={permissionModules}
        onSave={handleSaveRole}
      />
    </div>
  );
}
