import { api } from "./axios";
import type { LoginPayload, SignupPayload } from "@/types/auth";

export interface BackendUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
  permissions: string[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const authApi = {
  async login(payload: LoginPayload): Promise<{ user: BackendUser; token: string }> {
    const body = new URLSearchParams();
    body.set("username", payload.email);
    body.set("password", payload.password);

    const { data } = await api.post<TokenResponse>("/auth/login", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);

    const user = await this.getCurrentUser();
    localStorage.setItem("current_user", JSON.stringify(user));
    return { user, token: data.access_token };
  },

  async signup(payload: SignupPayload): Promise<{ user: BackendUser }> {
    const { data } = await api.post<BackendUser>("/auth/signup", {
      username: payload.name,
      email: payload.email,
      password: payload.password,
    });
    return { user: data };
  },

  async refresh(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) throw new Error("No refresh token available");

    const { data } = await api.post<TokenResponse>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    return data.access_token;
  },

  async getCurrentUser(): Promise<BackendUser> {
    const { data } = await api.get<BackendUser>("/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("current_user");
  },
};
