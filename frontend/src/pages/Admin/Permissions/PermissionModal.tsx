import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import {
  roleOptions,
  type PermissionKey,
  type PermissionUser,
} from "./permissionsData";

interface PermissionModalProps {
  user: PermissionUser | null;
  open: boolean;
  onClose: () => void;
  onSave: (updatedUser: PermissionUser) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PermissionModal({
  user,
  open,
  onClose,
  onSave,
}: PermissionModalProps) {
  const [permissions, setPermissions] = useState<PermissionUser["permissions"]>(
    [],
  );

  const [selectedRole, setSelectedRole] = useState("");

  useEffect(() => {
    if (user && open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPermissions(user.permissions.map((permission) => ({ ...permission })));
      setSelectedRole(user.role);
    }
  }, [user, open]);

  if (!user || !open) {
    return null;
  }

  const handlePermissionChange = (
    permissionKey: PermissionKey,
    enabled: boolean,
  ) => {
    setPermissions((currentPermissions) =>
      currentPermissions.map((permission) =>
        permission.key === permissionKey
          ? { ...permission, enabled }
          : permission,
      ),
    );
  };

  const handleSave = () => {
    const updatedUser: PermissionUser = {
      ...user,
      role: selectedRole,
      permissions,
    };

    onSave(updatedUser);
    onClose();
  };

  const enabledCount = permissions.filter(
    (permission) => permission.enabled,
  ).length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Side Panel */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="permission-panel-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="permission-panel-title"
              className="text-lg font-semibold text-foreground"
            >
              User Permissions
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage this user's access and permissions.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close permissions"
            className="ml-3 shrink-0 rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-5">
            {/* User */}
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.name} />

                <AvatarFallback className="bg-orange-100 font-semibold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {user.name}
                </p>

                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-400"
              >
                {user.status}
              </Badge>
            </div>

            {/* Information */}
            <div className="rounded-xl border border-orange-200 bg-orange-50/70 p-4 dark:border-orange-900/40 dark:bg-orange-950/20">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                Permission settings
              </p>

              <p className="mt-1 text-xs leading-5 text-orange-700/80 dark:text-orange-400/80">
                Changes made here will control which features and information
                this user can access.
              </p>
            </div>

            {/* User Group */}
            <div className="space-y-2">
              <Label htmlFor="permission-role">User Group</Label>

              <select
                id="permission-role"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Permission Summary */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Enabled permissions
                </p>

                <p className="text-xs text-muted-foreground">
                  Access currently enabled for this user
                </p>
              </div>

              <div className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600 dark:bg-orange-950/30 dark:text-orange-400">
                {enabledCount} / {permissions.length}
              </div>
            </div>

            <Separator />

            {/* Permissions */}
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div
                  key={permission.key}
                  className="flex items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-medium text-foreground">
                      {permission.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {permission.description}
                    </p>
                  </div>

                  <Switch
                    checked={permission.enabled}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.key, checked)
                    }
                    aria-label={`Toggle ${permission.label}`}
                    className="data-[state=checked]:bg-orange-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-background p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleSave}
              className="flex-1 gap-2 rounded-xl bg-orange-500 hover:bg-orange-600"
            >
              <Check className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
