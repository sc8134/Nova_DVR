"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const TIER_COLORS: Record<string, string> = {
  free:       "text-slate-400",
  starter:    "text-blue-400",
  creator:    "text-violet-400",
  pro:        "text-orange-400",
  enterprise: "text-amber-400",
};

const TIER_LABELS: Record<string, string> = {
  free:       "Free",
  starter:    "Starter",
  creator:    "Creator",
  pro:        "Pro",
  enterprise: "Enterprise",
};

export default function WalletBar() {
  const { user, loading } = useAuth();

  if (loading) return null;

  // Not logged in
  if (!user) {
    return (
      <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <p className="text-xs text-slate-400 leading-snug">
          Sign in to track downloads & unlock more daily downloads.
        </p>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="flex-1 text-center text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex-1 text-center text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const pct = user.tokens_limit > 0
    ? Math.round((user.tokens_today / user.tokens_limit) * 100)
    : 0;
  const tierColor = TIER_COLORS[user.tier] || "text-slate-400";
  const isLow = user.tokens_today <= 1;

  return (
    <div className="mx-3 mb-3 p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
      {/* Tier badge + tokens */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${tierColor}`}>
          {TIER_LABELS[user.tier] || user.tier}
        </span>
        <span className={`text-[10px] font-semibold ${isLow ? "text-red-400" : "text-slate-300"}`}>
          {user.tokens_today} / {user.tokens_limit === 999999 ? "∞" : user.tokens_limit} downloads
        </span>
      </div>

      {/* Progress bar */}
      {user.tokens_limit < 999999 && (
        <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${
              isLow ? "bg-red-500" : pct > 50 ? "bg-green-500" : "bg-amber-400"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      {/* CTA */}
      {user.tier === "free" && (
        <Link
          href="/pricing"
          className="block text-center text-[10px] font-semibold text-orange-300 hover:text-orange-100 transition"
        >
          Upgrade for more downloads →
        </Link>
      )}

      {isLow && user.tier !== "enterprise" && (
        <p className="text-[10px] text-red-400 text-center">
          Running low — resets tomorrow at midnight UTC
        </p>
      )}
    </div>
  );
}
