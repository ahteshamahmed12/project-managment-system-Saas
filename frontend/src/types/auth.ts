// src/types/auth.ts

export interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
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
  errors?: Record<string, string[]>;
}