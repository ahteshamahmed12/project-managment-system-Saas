import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "@/types/auth";

import { userData, type User } from "@/pages/users/userData";

type StoredUser = User & {
  password: string;
};

const USERS_KEY = "mock_users";
const CURRENT_USER_KEY = "current_user";
const TOKEN_KEY = "auth_token";

/*
|--------------------------------------------------------------------------
| Default Passwords
|--------------------------------------------------------------------------
| User profile data comes from userData.ts.
| Passwords are kept separately because we don't want to add passwords
| directly inside userData.ts.
|--------------------------------------------------------------------------
*/

const defaultPasswords: Record<string, string> = {
  "huzaifa@example.com": "12345678",
  "zain@example.com": "12345678",
  "ali@example.com": "12345678",
  "ahmed@example.com": "12345678",
  "fatima@example.com": "12345678",
  "ayesha@example.com": "12345678",
  "bilal@example.com": "12345678",
  "hina@example.com": "12345678",
  "usman@example.com": "12345678",
  "sara@example.com": "12345678",
};

/*
|--------------------------------------------------------------------------
| Create mock users from userData
|--------------------------------------------------------------------------
*/

const createDefaultUsers = (): StoredUser[] => {
  return userData.map((user) => ({
    ...user,
    password: defaultPasswords[user.email] ?? "12345678",
  }));
};

/*
|--------------------------------------------------------------------------
| Get users
|--------------------------------------------------------------------------
*/

const getUsers = (): StoredUser[] => {
  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    const users = createDefaultUsers();

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return users;
  }

  try {
    return JSON.parse(stored) as StoredUser[];
  } catch {
    const users = createDefaultUsers();

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    return users;
  }
};

/*
|--------------------------------------------------------------------------
| Save users
|--------------------------------------------------------------------------
*/

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/*
|--------------------------------------------------------------------------
| Remove password before exposing user
|--------------------------------------------------------------------------
*/

const sanitizeUser = (user: StoredUser): User => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...safeUser } = user;

  return safeUser;
};

/*
|--------------------------------------------------------------------------
| Mock API delay
|--------------------------------------------------------------------------
*/

const delay = (ms = 500) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/*
|--------------------------------------------------------------------------
| Auth API
|--------------------------------------------------------------------------
*/

export const authApi = {
  /*
  |--------------------------------------------------------------------------
  | Signup
  |--------------------------------------------------------------------------
  */

  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    await delay();

    const users = getUsers();

    const email = payload.email.trim().toLowerCase();

    const exists = users.some((user) => user.email.toLowerCase() === email);

    if (exists) {
      throw new Error("Email already exists.");
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      password: payload.password,

      phone: "",
      avatar: "",
      role: "Member",
      department: "Development",
      status: "Active",
      permissions: [],

      joining_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    users.push(newUser);

    saveUsers(users);

    const safeUser = sanitizeUser(newUser);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    localStorage.setItem(TOKEN_KEY, "mock-token");

    return {
      user: safeUser,
      token: "mock-token",
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Login
  |--------------------------------------------------------------------------
  */

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    await delay();

    const users = getUsers();

    const email = payload.email.trim().toLowerCase();

    const foundUser = users.find(
      (user) =>
        user.email.toLowerCase() === email &&
        user.password === payload.password,
    );

    if (!foundUser) {
      throw new Error("Invalid email or password.");
    }

    const safeUser = sanitizeUser(foundUser);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    localStorage.setItem(TOKEN_KEY, "mock-token");

    return {
      user: safeUser,
      token: "mock-token",
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Get Current User
  |--------------------------------------------------------------------------
  */

  getCurrentUser: async (): Promise<User> => {
    await delay(200);

    const storedUser = localStorage.getItem(CURRENT_USER_KEY);

    if (!storedUser) {
      throw new Error("User not found.");
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      throw new Error("Invalid user session.");
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Update Profile
  |--------------------------------------------------------------------------
  */

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    await delay();

    const current = localStorage.getItem(CURRENT_USER_KEY);

    if (!current) {
      throw new Error("User not found.");
    }

    const currentUser = JSON.parse(current) as User;

    const users = getUsers();

    const index = users.findIndex((user) => user.id === currentUser.id);

    if (index === -1) {
      throw new Error("User not found.");
    }

    users[index] = {
      ...users[index],
      ...payload,
    };

    saveUsers(users);

    const updatedUser = sanitizeUser(users[index]);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Account
  |--------------------------------------------------------------------------
  */

  deleteAccount: async (): Promise<void> => {
    await delay();

    const current = localStorage.getItem(CURRENT_USER_KEY);

    if (!current) {
      return;
    }

    const currentUser = JSON.parse(current) as User;

    const users = getUsers().filter((user) => user.id !== currentUser.id);

    saveUsers(users);

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  /*
  |--------------------------------------------------------------------------
  | Forgot Password
  |--------------------------------------------------------------------------
  */

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> => {
    await delay();

    const users = getUsers();

    const email = payload.email.trim().toLowerCase();

    const exists = users.some((user) => user.email.toLowerCase() === email);

    if (!exists) {
      throw new Error("Email not found.");
    }

    return {
      message: "Password reset link sent successfully.",
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Reset Password
  |--------------------------------------------------------------------------
  */

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    await delay();

    void payload;

    return {
      message: "Password reset successful.",
    };
  },

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  logout: async (): Promise<void> => {
    await delay(200);

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
