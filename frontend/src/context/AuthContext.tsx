import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "@/pages/users/userData";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = localStorage.getItem("current_user") || sessionStorage.getItem("current_user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !!(localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token"));
  });

  const login = (token: string, user: User, remember: boolean = true) => {
    const storage = remember ? localStorage : sessionStorage;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("current_user");

    storage.setItem("auth_token", token);
    storage.setItem("current_user", JSON.stringify(user));

    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_user");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("current_user");

    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user: currentUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
