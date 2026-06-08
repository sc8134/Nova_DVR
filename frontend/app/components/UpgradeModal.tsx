"use client";

import Link from "next/link";

interface Props {
  onClose: () => void;
  tier?: string;
}

export default function UpgradeModal({ onClose, tier = "free" }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-5 text-white text-center">
          <div className="text-3xl mb-1">🎟</div>
          <h2 className="text-lg font-bold">Daily Limit Reached</h2>
          <p className="text-sm text-blue-100 mt-1">
            {tier === "free"
              ? "Free accounts get 5 downloads per day."
              : `${tier.charAt(0).toUpperCase() + tier.slice(1)} accounts have reached today's limit.`}
          </p>
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 text-center">
            Upgrade to keep downloading — or wait until midnight UTC for your tokens to reset.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { tier: "Starter", downloads: 20, price: "Small fee", color: "border-blue-300 dark:border-blue-600" },
              { tier: "Creator", downloads: 50, price: "Medium fee", color: "border-violet-300 dark:border-violet-600" },
              { tier: "Pro",     downloads: 100, price: "Higher fee", color: "border-orange-300 dark:border-orange-600" },
              { tier: "Enterprise", downloads: "∞", price: "Custom", color: "border-amber-300 dark:border-amber-600" },
            ].map((p) => (
              <div
                key={p.tier}
                className={`border-2 ${p.color} rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-700/50`}
              >
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{p.tier}</p>
                <p className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{p.downloads}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">downloads/day</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.price}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Wait until tomorrow
            </button>
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex-1 text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
            >
              See Plans →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
