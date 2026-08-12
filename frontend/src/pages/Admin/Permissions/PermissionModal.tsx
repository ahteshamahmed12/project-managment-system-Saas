import * as React from "react";
import { Check, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type {
  PermissionAction,
  PermissionModule,
  Role,
  RolePermission,
} from "./permissionsData";

interface PermissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  modules: PermissionModule[];
  onSave: (role: Role) => void;
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  manage: "Manage",
};

function createInitialPermissions(
  role: Role,
  modules: PermissionModule[],
): RolePermission[] {
  return modules.map((module) => {
    const existing = role.permissions.find(
      (permission) => permission.moduleId === module.id,
    );

    return {
      moduleId: module.id,
      permissions: existing ? [...existing.permissions] : [],
    };
  });
}

export default function PermissionModal({
  open,
  onOpenChange,
  role,
  modules,
  onSave,
}: PermissionModalProps) {
  const [permissions, setPermissions] = React.useState<RolePermission[]>([]);

  React.useEffect(() => {
    if (role && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermissions(createInitialPermissions(role, modules));
    }
  }, [role, modules, open]);

  if (!role) {
    return null;
  }

  const hasPermission = (moduleId: string, action: PermissionAction) => {
    const modulePermission = permissions.find(
      (permission) => permission.moduleId === moduleId,
    );

    return modulePermission?.permissions.includes(action) ?? false;
  };

  const togglePermission = (moduleId: string, action: PermissionAction) => {
    setPermissions((current) =>
      current.map((permission) => {
        if (permission.moduleId !== moduleId) {
          return permission;
        }

        const hasAction = permission.permissions.includes(action);

        return {
          ...permission,
          permissions: hasAction
            ? permission.permissions.filter((item) => item !== action)
            : [...permission.permissions, action],
        };
      }),
    );
  };

  const handleSave = () => {
    onSave({
      ...role,
      permissions,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            Edit Permissions
          </DialogTitle>

          <DialogDescription>
            Manage permissions for the{" "}
            <span className="font-medium text-foreground">{role.name}</span>{" "}
            role.
          </DialogDescription>
        </DialogHeader>

        {/* Role Info */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <p className="text-sm font-semibold text-foreground">{role.name}</p>

          <p className="mt-1 text-xs text-muted-foreground">
            {role.description}
          </p>
        </div>

        {/* Permissions */}
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="grid grid-cols-[minmax(180px,1fr)_repeat(5,80px)] border-b border-border bg-muted/30">
            <div className="px-4 py-3 text-sm font-semibold text-foreground">
              Module
            </div>

            {(Object.keys(ACTION_LABELS) as PermissionAction[]).map(
              (action) => (
                <div
                  key={action}
                  className="px-2 py-3 text-center text-xs font-semibold text-foreground"
                >
                  {ACTION_LABELS[action]}
                </div>
              ),
            )}
          </div>

          <div>
            {modules.map((module) => (
              <div
                key={module.id}
                className="grid grid-cols-[minmax(180px,1fr)_repeat(5,80px)] border-b border-border last:border-0"
              >
                {/* Module */}
                <div className="px-4 py-4">
                  <p className="text-sm font-medium text-foreground">
                    {module.name}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {module.description}
                  </p>
                </div>

                {/* Actions */}
                {(Object.keys(ACTION_LABELS) as PermissionAction[]).map(
                  (action) => {
                    const isAvailable = module.actions.includes(action);

                    const checked = hasPermission(module.id, action);

                    return (
                      <div
                        key={action}
                        className="flex items-center justify-center px-2 py-4"
                      >
                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() => togglePermission(module.id, action)}
                            aria-label={`${ACTION_LABELS[action]} ${module.name}`}
                            className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                              checked
                                ? "border-orange-500 bg-orange-500 text-white"
                                : "border-border bg-background hover:border-orange-400"
                            }`}
                          >
                            {checked && <Check className="h-4 w-4" />}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-orange-500 hover:bg-orange-600"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
