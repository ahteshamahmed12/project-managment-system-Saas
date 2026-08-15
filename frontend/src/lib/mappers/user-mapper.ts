// lib/mappers/user-mapper.ts
import type { BackendUser } from "@/types/auth";
import type { User, UserRole } from "@/pages/users/userData";
import {
  createPermissions,
  type PermissionKey,
} from "@/pages/Admin/Permissions/permissionsData";

const ROLE_MAP: Record<string, UserRole> = {
  owner: "Admin",
  admin: "Admin",
  manager: "Manager",
  "team lead": "Team Lead",
  developer: "Developer",
  qa: "QA",
  designer: "Designer",
  member: "Member",
  viewer: "Member",
};

function normalizeRole(name: string | undefined): UserRole {
  const role = name?.toLowerCase();

  if (role && role in ROLE_MAP) {
    return ROLE_MAP[role];
  }

  return "Member";
}

const PERMISSION_KEY_MAP: Record<string, PermissionKey> = {
  "user:read": "userManagement",
  "user:update": "userManagement",
  "user:delete": "userManagement",
  "role:read": "allocateAuthority",
  "role:create": "allocateAuthority",
  "role:update": "allocateAuthority",
  "project:read": "reporting",
  "reporting": "reporting",
};

export function mapBackendUser(raw: BackendUser): User {
  const backendPermissionNames = raw.roles.flatMap((r) =>
    r.permissions.map((p) => p.name),
  );

  const permissions = Object.entries(PERMISSION_KEY_MAP)
    .filter(([backendName]) => backendPermissionNames.includes(backendName))
    .map(([, key]) => key)
    .filter((key, index, self) => self.indexOf(key) === index);

  const mapped = createPermissions(permissions);

  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone ?? "",
    avatar: raw.avatar ?? "",
    role: normalizeRole(raw.roles[0]?.name),
    department: raw.department ?? "Development",
    status: raw.status ?? (raw.is_active ? "Active" : "Inactive"),
    joining_date: raw.joining_date?.split("T")[0] ?? raw.created_at?.split("T")[0] ?? "",
    created_at: raw.created_at,
    permissions: mapped,
  };
}