import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the stored auth token (if any) to every outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize API errors into a single readable message string,
// so every page can display errors the same way.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string> }>) => {
    const message =
      error.response?.data?.message ??
      (error.code === "ERR_NETWORK"
        ? "Network error. Please check your connection and try again."
        : "Something went wrong. Please try again.");
    return Promise.reject({ ...error, message });
  }
);
