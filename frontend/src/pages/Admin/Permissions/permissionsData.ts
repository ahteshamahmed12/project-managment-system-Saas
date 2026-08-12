export type PermissionAction = "view" | "create" | "edit" | "delete" | "manage";

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  actions: PermissionAction[];
}

export interface RolePermission {
  moduleId: string;
  permissions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: RolePermission[];
}

export const permissionModules: PermissionModule[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    description: "Access dashboard and system overview.",
    actions: ["view"],
  },
  {
    id: "projects",
    name: "Projects",
    description: "Create and manage projects.",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "tasks",
    name: "Tasks",
    description: "Manage project tasks and assignments.",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "sprints",
    name: "Sprints",
    description: "Manage project sprints and progress.",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "users",
    name: "Users",
    description: "Manage users and user accounts.",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "team-management",
    name: "Team Management",
    description: "Manage teams and team members.",
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "reports",
    name: "Reports",
    description: "View and manage project reports.",
    actions: ["view", "create", "manage"],
  },
  {
    id: "settings",
    name: "Settings",
    description: "Manage application settings.",
    actions: ["view", "edit", "manage"],
  },
];

export const roles: Role[] = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to the entire system.",
    usersCount: 2,
    permissions: permissionModules.map((module) => ({
      moduleId: module.id,
      permissions: [...module.actions],
    })),
  },

  {
    id: "project-manager",
    name: "Project Manager",
    description: "Can manage projects, tasks, sprints and teams.",
    usersCount: 4,
    permissions: [
      {
        moduleId: "dashboard",
        permissions: ["view"],
      },
      {
        moduleId: "projects",
        permissions: ["view", "create", "edit"],
      },
      {
        moduleId: "tasks",
        permissions: ["view", "create", "edit", "delete"],
      },
      {
        moduleId: "sprints",
        permissions: ["view", "create", "edit"],
      },
      {
        moduleId: "users",
        permissions: ["view"],
      },
      {
        moduleId: "team-management",
        permissions: ["view", "create", "edit"],
      },
      {
        moduleId: "reports",
        permissions: ["view", "create"],
      },
      {
        moduleId: "settings",
        permissions: ["view"],
      },
    ],
  },

  {
    id: "team-member",
    name: "Team Member",
    description: "Can view assigned work and update tasks.",
    usersCount: 12,
    permissions: [
      {
        moduleId: "dashboard",
        permissions: ["view"],
      },
      {
        moduleId: "projects",
        permissions: ["view"],
      },
      {
        moduleId: "tasks",
        permissions: ["view", "create", "edit"],
      },
      {
        moduleId: "sprints",
        permissions: ["view"],
      },
      {
        moduleId: "users",
        permissions: ["view"],
      },
      {
        moduleId: "team-management",
        permissions: ["view"],
      },
      {
        moduleId: "reports",
        permissions: ["view"],
      },
      {
        moduleId: "settings",
        permissions: ["view"],
      },
    ],
  },

  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to project information.",
    usersCount: 6,
    permissions: [
      {
        moduleId: "dashboard",
        permissions: ["view"],
      },
      {
        moduleId: "projects",
        permissions: ["view"],
      },
      {
        moduleId: "tasks",
        permissions: ["view"],
      },
      {
        moduleId: "sprints",
        permissions: ["view"],
      },
      {
        moduleId: "users",
        permissions: ["view"],
      },
      {
        moduleId: "team-management",
        permissions: ["view"],
      },
      {
        moduleId: "reports",
        permissions: ["view"],
      },
      {
        moduleId: "settings",
        permissions: [],
      },
    ],
  },
];
