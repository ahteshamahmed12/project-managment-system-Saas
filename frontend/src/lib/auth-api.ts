import type {
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
  User,
} from "@/types/auth";

type MockUser = User & {
  password: string;
};

const USERS_KEY = "mock_users";
const CURRENT_USER_KEY = "current_user";
const TOKEN_KEY = "auth_token";

const defaultUsers: MockUser[] = [
  {
    id: crypto.randomUUID(),
    name: "Admin",
    email: "admin@gmail.com",
    password: "12345678",
    createdAt: new Date().toISOString(),
  },
];

const getUsers = (): MockUser[] => {
  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  return JSON.parse(stored) as MockUser[];
};

const saveUsers = (users: MockUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    await delay();

    const users = getUsers();

    const exists = users.find(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (exists) {
      throw new Error("Email already exists.");
    }

    const newUser: MockUser = {
      id: crypto.randomUUID(),
      name: payload.name,
      email: payload.email,
      password: payload.password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    saveUsers(users);

    const { password: _password, ...user } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, "mock-token");

    return {
      user,
      token: "mock-token",
    };
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    await delay();

    const users = getUsers();

    const foundUser = users.find(
      (u) =>
        u.email.toLowerCase() === payload.email.toLowerCase() &&
        u.password === payload.password,
    );

    if (!foundUser) {
      throw new Error("Invalid email or password.");
    }

    const { password, ...user } = foundUser;

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_KEY, "mock-token");

    return {
      user,
      token: "mock-token",
    };
  },

  getCurrentUser: async (): Promise<User> => {
    await delay(200);

    const user = localStorage.getItem(CURRENT_USER_KEY);

    if (!user) {
      throw new Error("User not found.");
    }

    return JSON.parse(user) as User;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<User> => {
    await delay();

    const current = localStorage.getItem(CURRENT_USER_KEY);

    if (!current) {
      throw new Error("User not found.");
    }

    const currentUser = JSON.parse(current) as User;

    const users = getUsers();

    const index = users.findIndex((u) => u.id === currentUser.id);

    if (index === -1) {
      throw new Error("User not found.");
    }

    users[index] = {
      ...users[index],
      ...payload,
    };

    saveUsers(users);

    const { password, ...updatedUser } = users[index];

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

    return updatedUser;
  },

  deleteAccount: async (): Promise<void> => {
    await delay();

    const current = localStorage.getItem(CURRENT_USER_KEY);

    if (!current) return;

    const currentUser = JSON.parse(current) as User;

    const users = getUsers().filter((u) => u.id !== currentUser.id);

    saveUsers(users);

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },

  forgotPassword: async (
    payload: ForgotPasswordPayload,
  ): Promise<{ message: string }> => {
    await delay();

    const users = getUsers();

    const exists = users.some(
      (u) => u.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (!exists) {
      throw new Error("Email not found.");
    }

    return {
      message: "Password reset link sent successfully.",
    };
  },

  resetPassword: async (
    payload: ResetPasswordPayload,
  ): Promise<{ message: string }> => {
    await delay();

    void payload;

    return {
      message: "Password reset successful.",
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  },
};
