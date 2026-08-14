export type PermissionKey =
  | "auditing"
  | "allocateAuthority"
  | "candidateActivation"
  | "candidateDocuments"
  | "financialInformation"
  | "jobPosting"
  | "candidateManagement"
  | "userManagement"
  | "reporting"
  | "settings";

export interface Permission {
  key: PermissionKey;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PermissionUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
  permissions: Permission[];
}

/* ==========================================================
   PERMISSION MODULES
========================================================== */

export const permissionModules: Omit<Permission, "enabled">[] = [
  {
    key: "auditing",
    label: "Auditing",
    description: "Allows the user to access and manage auditing information.",
  },
  {
    key: "allocateAuthority",
    label: "Allocate as authority",
    description: "Allows the user to allocate authority to other users.",
  },
  {
    key: "candidateActivation",
    label: "Candidate activation",
    description: "Allows the user to activate or deactivate candidates.",
  },
  {
    key: "candidateDocuments",
    label: "Candidate documents",
    description: "Allows the user to view and manage candidate documents.",
  },
  {
    key: "financialInformation",
    label: "Financial information",
    description: "Allows the user to access financial information.",
  },
  {
    key: "jobPosting",
    label: "Job posting",
    description: "Allows the user to create and manage job postings.",
  },
  {
    key: "candidateManagement",
    label: "Candidate management",
    description: "Allows the user to manage candidate records.",
  },
  {
    key: "userManagement",
    label: "User management",
    description: "Allows the user to manage system users.",
  },
  {
    key: "reporting",
    label: "Reporting",
    description: "Allows the user to access reports and analytics.",
  },
  {
    key: "settings",
    label: "Settings",
    description: "Allows the user to access application settings.",
  },
];

/* ==========================================================
   HELPERS
========================================================== */

export const createPermissions = (
  enabledPermissions: PermissionKey[],
): Permission[] => {
  return permissionModules.map((permission) => ({
    ...permission,
    enabled: enabledPermissions.includes(permission.key),
  }));
};

/* ==========================================================
   USERS
========================================================== */

export const permissionUsers: PermissionUser[] = [
  {
    id: "user-001",
    name: "Arlene McCoy",
    email: "arlene.mccoy@example.com",
    role: "Consultant",
    status: "Active",

    permissions: createPermissions([
      "auditing",
      "allocateAuthority",
      "candidateActivation",
      "candidateDocuments",
      "reporting",
    ]),
  },

  {
    id: "user-002",
    name: "Gary Hawkins",
    email: "gary.hawkins@example.com",
    role: "Administrator",
    status: "Active",

    permissions: createPermissions([
      "auditing",
      "allocateAuthority",
      "candidateActivation",
      "candidateDocuments",
      "financialInformation",
      "jobPosting",
      "candidateManagement",
      "userManagement",
      "reporting",
      "settings",
    ]),
  },

  {
    id: "user-003",
    name: "Diana Russell",
    email: "diana.russell@example.com",
    role: "Manager",
    status: "Active",

    permissions: createPermissions([
      "auditing",
      "candidateActivation",
      "candidateDocuments",
      "candidateManagement",
      "reporting",
    ]),
  },

  {
    id: "user-004",
    name: "Jacob Jones",
    email: "jacob.jones@example.com",
    role: "Recruiter",
    status: "Active",

    permissions: createPermissions([
      "candidateActivation",
      "candidateDocuments",
      "jobPosting",
      "candidateManagement",
    ]),
  },

  {
    id: "user-005",
    name: "Brooklyn Simmons",
    email: "brooklyn.simmons@example.com",
    role: "HR Manager",
    status: "Inactive",

    permissions: createPermissions([
      "candidateDocuments",
      "financialInformation",
      "candidateManagement",
      "reporting",
    ]),
  },

  {
    id: "user-006",
    name: "Leslie Alexander",
    email: "leslie.alexander@example.com",
    role: "Consultant",
    status: "Active",

    permissions: createPermissions([
      "auditing",
      "candidateDocuments",
      "reporting",
    ]),
  },
];

/* ==========================================================
   ROLE OPTIONS
========================================================== */

export const roleOptions = [
  "Administrator",
  "Manager",
  "HR Manager",
  "Recruiter",
  "Consultant",
] as const;
