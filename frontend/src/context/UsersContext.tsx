import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { userData, type User } from "@/pages/users/userData";

interface UsersContextType {
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, values: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserByEmail: (email: string) => User | undefined;
}

const UsersContext = createContext<UsersContextType | null>(null);

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(userData);

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
