import axios, {
  AxiosError
} from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

const processQueue = (token: string) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem(
          REFRESH_TOKEN_KEY
        );

        if (!refreshToken) {
          throw new Error("Missing refresh token");
        }

        const response = await axios.post(
          `${API_BASE}/auth/refresh`,
          {
            refresh_token: refreshToken,
          }
        );

        const accessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          accessToken
        );

        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          newRefreshToken
        );

        processQueue(accessToken);

        originalRequest.headers.Authorization =
          `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        window.location.href = "/login";

        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      (error.response?.data as any)?.detail ??
      (error.response?.data as any)?.message ??
      (error.code === "ERR_NETWORK"
        ? "Network error. Please check your internet connection."
        : "Something went wrong.");

    return Promise.reject({
      ...error,
      message,
    });
  }
);