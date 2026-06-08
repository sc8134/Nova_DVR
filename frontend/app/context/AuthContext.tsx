"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { apiMe, apiLogin, apiRegister, setToken, clearToken, type User } from "../lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, referral?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  /** Deduct a token from the local count (called after a successful download) */
  deductToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await apiMe();
    setUser(me);
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setToken(data.token);
    setUser(data);
  };

  const register = async (email: string, password: string, referral?: string) => {
    const data = await apiRegister(email, password, referral);
    setToken(data.token);
    setUser(data);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const deductToken = () => {
    setUser((prev) =>
      prev ? { ...prev, tokens_today: Math.max(0, prev.tokens_today - 1) } : prev
    );
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, deductToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
