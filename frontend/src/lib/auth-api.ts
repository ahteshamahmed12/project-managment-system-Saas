import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

const API_BASE = "http://127.0.0.1:8000/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  
}

// Normalizes FastAPI error shapes into a single readable string.
// Handles plain string `detail` (custom errors) and array `detail`
// (Pydantic 422 validation errors: [{ loc, msg, type }, ...]).
function extractErrorMessage(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first;
    if (first?.msg) return first.msg;
  }

  return "Something went wrong. Please try again.";
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  const headers = new Headers(options.headers);

  const isFormBody =
    options.body instanceof FormData ||
    options.body instanceof URLSearchParams;

  if (!isFormBody) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data?.detail));
  }

  return data as T;
}

function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const authApi = {
  async signup(payload: SignupPayload): Promise<User> {
    return request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    // OAuth2PasswordRequestForm requires x-www-form-urlencoded,
    // and the username field is always literally named "username"
    // even when it holds an email address.
    const formBody = new URLSearchParams();
    formBody.append("username", payload.email);
    formBody.append("password", payload.password);

    const tokenData = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: formBody,
    });

    saveTokens(tokenData.access_token, tokenData.refresh_token);

    // Backend's /auth/login only returns tokens, not a user object,
    // so fetch the user separately using the token we just saved.
    const user = await request<User>("/auth/me");

    return {
      user,
      token: tokenData.access_token,
    };
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      throw new Error("Refresh token not found.");
    }

    const data = await request<TokenResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    saveTokens(data.access_token, data.refresh_token);

    return data.access_token;
  },

  async getCurrentUser(): Promise<User> {
    return request<User>("/auth/me");
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    return request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteAccount(): Promise<void> {
    await request<void>("/auth/me", {
      method: "DELETE",
    });

    clearTokens();
  },

  async forgotPassword(
    payload: ForgotPasswordPayload
  ): Promise<{ message: string }> {
    return request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async resetPassword(
    payload: ResetPasswordPayload
  ): Promise<{ message: string }> {
    return request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  logout() {
    clearTokens();
  },

  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  isAuthenticated() {
    return !!localStorage.getItem(ACCESS_TOKEN_KEY);
  },
};