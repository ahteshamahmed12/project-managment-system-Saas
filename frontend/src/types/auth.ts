export interface BackendUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  user: BackendUser;
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
}

export interface ForgotPasswordPayload { email: string; }
export interface ResetPasswordPayload { token: string; password: string; }
export interface ApiErrorShape { message: string; errors?: Record<string, string>; }
