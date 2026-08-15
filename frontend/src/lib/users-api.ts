import type { BackendUser } from "@/types/auth";
import type { User } from "@/pages/users/userData";
import { mapBackendUser } from "@/lib/mappers/user-mapper";

const API_URL = import.meta.env.VITE_API_URL as string;
const TOKEN_KEY = "auth_token";

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const token = localStorage.getItem(TOKEN_KEY);

    const res = await fetch(`${API_URL}/users/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail ?? body.message ?? "Failed to fetch users.");
    }

    const rawUsers = (await res.json()) as BackendUser[];

    return rawUsers.map(mapBackendUser);
  },
};