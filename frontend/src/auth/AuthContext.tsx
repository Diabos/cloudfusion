import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";
import type { Profile } from "../api/auth";
import { setAccessToken, setOnAuthLost } from "../api/client";

interface AuthContextValue {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  updateProfile: (profile: { displayName: string | null; avatarDataUrl: string | null }) => Promise<void>;
  logout: () => Promise<void>;
}

function consumeGoogleLoginRedirect(): { accessToken: string; refreshToken: string } | null {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("loginAccessToken");
  const refreshToken = params.get("loginRefreshToken");
  if (!accessToken || !refreshToken) return null;
  window.history.replaceState({}, "", window.location.pathname);
  return { accessToken, refreshToken };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    setAccessToken(null);
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  useEffect(() => {
    setOnAuthLost(clearSession);

    const fromGoogleRedirect = consumeGoogleLoginRedirect();
    if (fromGoogleRedirect) {
      setAccessToken(fromGoogleRedirect.accessToken);
      localStorage.setItem("refreshToken", fromGoogleRedirect.refreshToken);
      authApi
        .me()
        .then((u) => setUser(u))
        .catch(() => clearSession())
        .finally(() => setLoading(false));
      return;
    }

    // no refresh token stored -> not logged in, skip the /me probe
    if (!localStorage.getItem("refreshToken")) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []);

  const applySession = (result: { accessToken: string; refreshToken: string }, email: string, id: string) => {
    setAccessToken(result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    setUser({ id, email, displayName: null, avatarDataUrl: null, createdAt: new Date().toISOString() });
  };

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    applySession(result, email, result.userId);
  };

  const register = async (email: string, password: string) => {
    const result = await authApi.register(email, password);
    applySession(result, email, result.userId);
  };

  const updateProfile = async (profile: { displayName: string | null; avatarDataUrl: string | null }) => {
    const updated = await authApi.updateProfile(profile);
    setUser(updated);
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    clearSession();
  };

  return <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
