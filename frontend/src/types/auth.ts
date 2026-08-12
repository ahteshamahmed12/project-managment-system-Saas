import type { User } from "@/pages/users/userData";

export interface AuthResponse {
  user: User;
  token: string;
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

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role?: User["role"];
  department?: User["department"];
  status?: User["status"];
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface ApiErrorShape {
  message: string;
  errors?: Record<string, string>;
}
