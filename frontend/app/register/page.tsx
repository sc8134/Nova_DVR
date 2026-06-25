"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function RegisterPage() {
  const { register, refreshUser } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(email.trim(), password, referral.trim() || undefined);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    await refreshUser();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 ring-2 ring-white/10 shadow-xl">
              <Image src="/nova_logo.png" alt="Nova DVR" fill className="object-contain p-1" priority />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Join <span className="text-orange-400">Nova DVR</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create a free account — 5 downloads per day included
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={(msg) => setError(msg)} label="Sign up with Google" />

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400">or register with email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label="Password" type="password" autoComplete="new-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
            <Input
              label="Confirm Password" type="password" autoComplete="new-password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              errorText={error?.includes("match") ? error : undefined}
            />
            <Input
              label="Referral Code" type="text"
              value={referral} onChange={(e) => setReferral(e.target.value.toUpperCase())}
              placeholder="e.g. ABC12345 (optional)"
              helperText="Earn +3 bonus tokens when you use a friend's code"
              className="font-mono"
            />

            {error && !error.includes("match") && (
              <div
                className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm"
                role="alert"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg">
              Create Free Account
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          No credit card required · Tokens reset daily at midnight UTC
        </p>
      </div>
    </div>
  );
}
