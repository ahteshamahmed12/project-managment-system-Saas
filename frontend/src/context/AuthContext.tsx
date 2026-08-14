import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type BackendUser } from "@/lib/auth-api";

interface AuthContextType {
  isAuthenticated: boolean;
  user: BackendUser | null;
  loading: boolean;
  login: (token: string, user: BackendUser) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("auth_token")) {
      setLoading(false);
      return;
    }
    authApi.getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        localStorage.setItem("current_user", JSON.stringify(currentUser));
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token: string, currentUser: BackendUser) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("current_user", JSON.stringify(currentUser));
    setUser(currentUser);
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      loading,
      login,
      logout,
      hasPermission: (permission) => !!user?.permissions.includes(permission),
      hasRole: (role) => !!user?.roles.includes(role),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
