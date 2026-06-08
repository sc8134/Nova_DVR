"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    downloads: 5,
    color: "border-slate-200 dark:border-slate-700",
    badge: "",
    features: [
      "5 downloads per day",
      "MP4 up to 1080p",
      "MP3 audio extraction",
      "Basic queue",
    ],
    cta: "Get Started",
    ctaHref: "/register",
    ctaStyle: "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white",
    highlight: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "Coming soon",
    period: "",
    downloads: 20,
    color: "border-blue-400 dark:border-blue-500",
    badge: "",
    features: [
      "20 downloads per day",
      "Batch downloads",
      "Faster processing queue",
      "All free features",
    ],
    cta: "Notify Me",
    ctaHref: "/register",
    ctaStyle: "bg-blue-600 hover:bg-blue-700 text-white",
    highlight: false,
  },
  {
    id: "creator",
    name: "Creator",
    price: "Coming soon",
    period: "",
    downloads: 50,
    color: "border-violet-500 dark:border-violet-400 ring-2 ring-violet-400/30",
    badge: "Most Popular",
    features: [
      "50 downloads per day",
      "Cloud sync",
      "Priority download queue",
      "Subtitle downloads",
      "All Starter features",
    ],
    cta: "Notify Me",
    ctaHref: "/register",
    ctaStyle: "bg-violet-600 hover:bg-violet-700 text-white",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "Coming soon",
    period: "",
    downloads: 100,
    color: "border-orange-400 dark:border-orange-500",
    badge: "",
    features: [
      "100 downloads per day",
      "Voice commands",
      "Premium support",
      "API access",
      "All Creator features",
    ],
    cta: "Notify Me",
    ctaHref: "/register",
    ctaStyle: "bg-orange-500 hover:bg-orange-600 text-white",
    highlight: false,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    downloads: Infinity,
    color: "border-amber-400 dark:border-amber-500",
    badge: "",
    features: [
      "Unlimited downloads",
      "Team access",
      "API integration",
      "Dedicated support",
      "Custom SLA",
    ],
    cta: "Contact Us",
    ctaHref: "mailto:contact@sagarrc.com.np",
    ctaStyle: "bg-amber-500 hover:bg-amber-600 text-white",
    highlight: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
          🎟 Token-based pricing
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Download tokens reset every day at midnight UTC. Only pay for what you actually download.
          Paid plans coming soon — register now to lock in early access.
        </p>
      </div>

      {/* Current tier banner */}
      {user && (
        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl px-5 py-4">
          <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              You&apos;re on the {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} plan
            </p>
            <p className="text-xs text-blue-500 dark:text-blue-400">
              {user.tokens_today} / {user.tokens_limit === 999999 ? "∞" : user.tokens_limit} downloads remaining today
            </p>
          </div>
        </div>
      )}

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col bg-white dark:bg-slate-800 border-2 ${tier.color} rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
              tier.highlight ? "shadow-violet-200 dark:shadow-violet-900/30" : ""
            } ${user?.tier === tier.id ? "ring-2 ring-blue-500/50" : ""}`}
          >
            {/* Popular badge */}
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Current tier badge */}
            {user?.tier === tier.id && (
              <div className="absolute -top-3 right-3">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                  Your Plan
                </span>
              </div>
            )}

            <div className="space-y-3 flex-1">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tier.name}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{tier.price}</p>
                {tier.period && <p className="text-xs text-slate-400">{tier.period}</p>}
              </div>

              <div className="text-center py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {tier.downloads === Infinity ? "∞" : tier.downloads}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">downloads / day</p>
              </div>

              <ul className="space-y-1.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <svg className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
              {tier.ctaHref.startsWith("mailto") ? (
                <a
                  href={tier.ctaHref}
                  className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-xl transition ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </a>
              ) : user?.tier === tier.id ? (
                <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
                  Current plan
                </div>
              ) : (
                <Link
                  href={tier.ctaHref}
                  className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-xl transition ${tier.ctaStyle}`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Referral section */}
      {user?.referral_code && (
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-700 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">🎁 Refer friends, earn tokens</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Share your referral code. When a friend registers with it, you both get bonus tokens.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-700 rounded-xl px-4 py-2.5 text-sm font-bold text-violet-700 dark:text-violet-300 tracking-widest">
              {user.referral_code}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(user.referral_code!)}
              className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Frequently asked questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { q: "When do my tokens reset?", a: "Every day at midnight UTC. Subscription tokens reset daily; pack tokens decrease per download." },
            { q: "Can I use Nova DVR without an account?", a: "Yes — anonymous users can still download, but there's no token tracking or history saved to your account." },
            { q: "When will paid plans launch?", a: "Stripe integration is coming soon. Register now to be notified and lock in early-access pricing." },
            { q: "What counts as one download?", a: "Each file download (video or audio) costs one token, regardless of resolution or file size." },
          ].map((item) => (
            <div key={item.q} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-1.5">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.q}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
