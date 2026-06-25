"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import GoogleSignInButton from "../components/GoogleSignInButton";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function LoginPage() {
  const { login, refreshUser } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
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
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 ring-2 ring-white/10 shadow-xl">
              <Image src="/nova_logo.png" alt="Nova DVR" fill className="object-contain p-1" priority />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Welcome back to <span className="text-orange-400">Nova DVR</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={(msg) => setError(msg)} label="Sign in with Google" />

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            <span className="text-xs text-slate-400">or continue with email</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" errorText={error || undefined} />

            <Button type="submit" loading={loading} fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Create one free</Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">No credit card required · Free tier includes 5 downloads/day</p>
      </div>
    </div>
  );
}
