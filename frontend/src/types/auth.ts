// types/auth.ts

import type { User } from "@/pages/users/userData";

// Exactly what the backend actually returns from GET /me
export interface BackendUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  phone: string | null;
  avatar: string | null;
  department:
    | "Development"
    | "Design"
    | "QA"
    | "Marketing"
    | "HR"
    | "Sales"
    | null;
  status: "Active" | "Inactive" | "Suspended";
  joining_date: string | null;
  created_at: string;
  roles: {
    name: string;
    permissions: { name: string }[];
  }[];
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  new_password: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}