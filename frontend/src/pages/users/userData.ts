import {
  createPermissions,
  type Permission,
} from "../Admin/Permissions/permissionsData";

export type UserRole =
  | "Admin"
  | "Manager"
  | "Team Lead"
  | "Developer"
  | "QA"
  | "Designer"
  | "Member";

export type UserDepartment =
  | "Development"
  | "Design"
  | "QA"
  | "Marketing"
  | "HR"
  | "Sales";

export type UserStatus = "Active" | "Inactive" | "Suspended";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  department: UserDepartment;
  status: UserStatus;
  joining_date: string;
  created_at: string;
  permissions: Permission[];
}

export const userData: User[] = [
  {
    id: "user-001",
    name: "Syed Huzaifa",
    email: "huzaifa@example.com",
    phone: "+92 300 1234567",
    avatar: "https://i.pravatar.cc/150?img=11",
    role: "Admin",
    department: "Development",
    status: "Active",
    joining_date: "2025-01-10",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-002",
    name: "Zain Qaimi",
    email: "zain@example.com",
    phone: "+92 301 9876543",
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "Manager",
    department: "Development",
    status: "Active",
    joining_date: "2025-02-15",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-003",
    name: "Ali Raza",
    email: "ali@example.com",
    phone: "+92 302 1112233",
    avatar: "https://i.pravatar.cc/150?img=13",
    role: "Developer",
    department: "Development",
    status: "Active",
    joining_date: "2025-03-01",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-004",
    name: "Ahmed Khan",
    email: "ahmed@example.com",
    phone: "+92 333 4455667",
    avatar: "https://i.pravatar.cc/150?img=14",
    role: "QA",
    department: "QA",
    status: "Inactive",
    joining_date: "2025-01-22",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-005",
    name: "Fatima Noor",
    email: "fatima@example.com",
    phone: "+92 311 4567890",
    avatar: "https://i.pravatar.cc/150?img=15",
    role: "Designer",
    department: "Design",
    status: "Active",
    joining_date: "2025-04-12",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-006",
    name: "Ayesha Malik",
    email: "ayesha@example.com",
    phone: "+92 322 1110099",
    avatar: "https://i.pravatar.cc/150?img=16",
    role: "Developer",
    department: "Development",
    status: "Active",
    joining_date: "2025-02-28",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-007",
    name: "Bilal Hassan",
    email: "bilal@example.com",
    phone: "+92 334 5671234",
    avatar: "https://i.pravatar.cc/150?img=17",
    role: "Team Lead",
    department: "Development",
    status: "Active",
    joining_date: "2025-01-18",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-008",
    name: "Hina Tariq",
    email: "hina@example.com",
    phone: "+92 345 2223344",
    avatar: "https://i.pravatar.cc/150?img=18",
    role: "Manager",
    department: "Marketing",
    status: "Inactive",
    joining_date: "2025-03-18",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-009",
    name: "Usman Shah",
    email: "usman@example.com",
    phone: "+92 300 7788990",
    avatar: "https://i.pravatar.cc/150?img=19",
    role: "QA",
    department: "QA",
    status: "Active",
    joining_date: "2025-04-25",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
  {
    id: "user-010",
    name: "Sara Khan",
    email: "sara@example.com",
    phone: "+92 321 5566778",
    avatar: "https://i.pravatar.cc/150?img=20",
    role: "Designer",
    department: "Design",
    status: "Active",
    joining_date: "2025-05-10",
    created_at: new Date().toISOString(),
    permissions: createPermissions([]),
  },
];
