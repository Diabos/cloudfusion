import { api } from "./client";

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface Profile {
  id: string;
  email: string;
  displayName: string | null;
  avatarDataUrl: string | null;
  createdAt: string;
}

export const authApi = {
  register: (email: string, password: string) =>
    api<AuthResult>("/auth/register", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    api<AuthResult>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => api<void>("/auth/logout", { method: "POST" }),
  me: () => api<Profile>("/auth/me"),
  updateProfile: (profile: { displayName: string | null; avatarDataUrl: string | null }) =>
    api<Profile>("/auth/profile", { method: "PATCH", body: JSON.stringify(profile) }),
};
