import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "@/pages/users/userData";
import { usersApi } from "@/lib/users-api";

interface UsersContextType {
  users: User[];
  loading: boolean;
  addUser: (user: User) => void;
  updateUser: (id: string, values: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserByEmail: (email: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    usersApi
      .getUsers()
      .then((fetched) => {
        if (!cancelled && fetched.length > 0) {
          setUsers(fetched);
        }
      })
      .catch(() => {
        // API error — keep current state; user may not have permission.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const addUser = useCallback((user: User) => {
    setUsers((prev) => [user, ...prev]);
  }, []);

  const updateUser = useCallback((id: string, values: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              ...values,
            }
          : user,
      ),
    );
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  }, []);

  const getUserByEmail = useCallback(
    (email: string) => {
      return users.find(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      );
    },
    [users],
  );

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        addUser,
        updateUser,
        deleteUser,
        getUserByEmail,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsers() {
  const context = useContext(UsersContext);

  if (!context) {
    throw new Error("useUsers must be used inside UsersProvider");
  }

  return context;
}