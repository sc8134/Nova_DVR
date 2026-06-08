/**
 * Auth utilities — JWT storage + API helpers
 */
import { BACKEND } from "./config";
import { safeJson } from "./safeJson";

export interface User {
  user_id: number;
  email: string;
  tier: "free" | "starter" | "creator" | "pro" | "enterprise";
  tokens_today: number;
  tokens_limit: number;
  referral_code: string | null;
}

const TOKEN_KEY = "novaDvrJwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  if (!token) return { "Content-Type": "application/json" };
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function apiRegister(
  email: string,
  password: string,
  referral_code?: string
): Promise<User & { token: string }> {
  const res = await fetch(`${BACKEND}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, referral_code }),
  });
  const data = await safeJson(res) as User & { token: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<User & { token: string }> {
  const res = await fetch(`${BACKEND}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await safeJson(res) as User & { token: string; error?: string };
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function apiMe(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { clearToken(); return null; }
    return await safeJson(res) as User;
  } catch {
    return null;
  }
}
