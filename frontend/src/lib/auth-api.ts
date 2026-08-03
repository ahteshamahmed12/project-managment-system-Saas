import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

const API_BASE = "http://127.0.0.1:8000";
const TOKEN_KEY = "auth_token";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.detail || "Something went wrong. Please try again.");
  }

  return data as T;
}

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const data = await request<{ access_token: string; user: User }>(
      "/auth/signup",
      { method: "POST", body: JSON.stringify(payload) },
    );
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return { user: data.user, token: data.access_token };
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const data = await request<{ access_token: string; user: User }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify(payload) },
    );
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return { user: data.user, token: data.access_token };
  },

  getCurrentUser: async (): Promise<User> => {
    return request<User>("/auth/me");
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    return request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  deleteAccount: async (): Promise<void> => {
    await request<void>("/auth/me", { method: "DELETE" });
    localStorage.removeItem(TOKEN_KEY);
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> => {
    return request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    return request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(TOKEN_KEY);
  },
};