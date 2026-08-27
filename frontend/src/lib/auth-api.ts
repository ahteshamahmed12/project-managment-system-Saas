import type {
  AuthResponse,
  BackendUser,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "@/types/auth";

import type { User } from "@/pages/users/userData";
import { mapBackendUser } from "@/lib/mappers/user-mapper";

const API_BASE = (
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  "/api"
).replace(/\/$/, "");
const TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "current_user";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  const res = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? body.message ?? "Request failed.");
  }

  if (res.status === 204) return undefined as T; // logout/delete often return no body

  return res.json() as Promise<T>;
}

/*
|--------------------------------------------------------------------------
| Auth API
|--------------------------------------------------------------------------
| Same public interface as the mock version — components don't need to
| change. Only the implementation changed: real HTTP calls to FastAPI.
|--------------------------------------------------------------------------
*/

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    // TODO: confirm path — /auth/register, /auth/signup, /users?
    await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // If your register endpoint already returns a token, use that
    // directly instead of chaining a second login call.
    return authApi.login({ email: payload.email, password: payload.password });
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // TODO: if you used FastAPI's OAuth2PasswordRequestForm, this route
    // expects form-encoded "username"/"password", not JSON — see note below.
    const { access_token } = await apiFetch<{
      access_token: string;
      token_type: string;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    localStorage.setItem(TOKEN_KEY, access_token);

    const user = await authApi.getCurrentUser();

    return { user, token: access_token };
  },

  getCurrentUser: async (): Promise<User> => {
    const raw = await apiFetch<BackendUser>("/auth/me");

    const user = mapBackendUser(raw);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    const raw = await apiFetch<BackendUser>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    const user = mapBackendUser(raw);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  },

  deleteAccount: async (): Promise<void> => {
    await apiFetch<void>("/auth/me", { method: "DELETE" });

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string; reset_link?: string }> => {
    return apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    return apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    // Only add a server call here if your backend actually tracks/
    // blacklists tokens. Plain JWT usually needs no round-trip to log out.
  },
};