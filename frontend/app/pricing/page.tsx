"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { createCheckoutSession, openCustomerPortal } from "../lib/stripe";

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
    highlight: false,
    paid: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "$2.99",
    period: "/ month",
    downloads: 20,
    color: "border-blue-400 dark:border-blue-500",
    badge: "",
    features: [
      "20 downloads per day",
      "Batch downloads",
      "Faster processing queue",
      "All free features",
    ],
    highlight: false,
    paid: true,
  },
  {
    id: "creator",
    name: "Creator",
    price: "$5.99",
    period: "/ month",
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
    highlight: true,
    paid: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    period: "/ month",
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
    highlight: false,
    paid: true,
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
    highlight: false,
    paid: false,
  },
];

function PricingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Handle Stripe redirect back
  useEffect(() => {
    const success   = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    if (success === "1") {
      setToast({ msg: "Payment successful! Your plan has been upgraded.", type: "success" });
      refreshUser();
      // Clean URL
      router.replace("/pricing");
    } else if (cancelled === "1") {
      setToast({ msg: "Payment cancelled — no charge was made.", type: "error" });
      router.replace("/pricing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async (tierId: string) => {
    if (!user) { router.push("/login"); return; }
    setLoadingTier(tierId);
    try {
      const url = await createCheckoutSession({
        tier: tierId as "starter" | "creator" | "pro",
      });
      window.location.href = url;
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : "Checkout failed", type: "error" });
      setLoadingTier(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const url = await openCustomerPortal();
      window.location.href = url;
    } catch (e: unknown) {
      setToast({ msg: e instanceof Error ? e.message : "Could not open portal", type: "error" });
      setPortalLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg text-sm font-semibold transition-all ${
          toast.type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-200 dark:border-blue-700">
          🎟 Token-based pricing
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
          Simple, transparent pricing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Tokens reset every day at midnight UTC. Only pay for what you actually use.
        </p>
      </div>

      {/* Current plan banner */}
      {user && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3 flex-1">
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
          {user.tier !== "free" && user.tier !== "enterprise" && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="shrink-0 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-xl transition flex items-center gap-2"
            >
              {portalLoading ? (
                <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Opening…</>
              ) : "Manage Subscription →"}
            </button>
          )}
        </div>
      )}

      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {TIERS.map((tier) => {
          const isCurrent = user?.tier === tier.id;
          const isLoading = loadingTier === tier.id;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col bg-white dark:bg-slate-800 border-2 ${tier.color} rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
                tier.highlight ? "shadow-violet-200 dark:shadow-violet-900/30" : ""
              } ${isCurrent ? "ring-2 ring-blue-500/50" : ""}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {tier.badge}
                  </span>
                </div>
              )}
              {isCurrent && (
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
                {isCurrent ? (
                  <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">Current plan</div>
                ) : tier.id === "free" ? (
                  user ? (
                    <div className="text-center text-xs text-slate-400 py-2">Your base plan</div>
                  ) : (
                    <Link href="/register" className="block text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white transition">
                      Get Started
                    </Link>
                  )
                ) : tier.id === "enterprise" ? (
                  <a href="mailto:contact@sagarrc.com.np" className="block text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition">
                    Contact Us
                  </a>
                ) : tier.paid ? (
                  <button
                    onClick={() => handleUpgrade(tier.id)}
                    disabled={isLoading}
                    className={`w-full text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60 ${
                      tier.highlight
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : tier.id === "pro"
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isLoading ? (
                      <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Redirecting…</>
                    ) : (
                      <>Upgrade to {tier.name} →</>
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral section */}
      {user?.referral_code && (
        <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-700 rounded-2xl p-6 space-y-3">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">🎁 Refer friends, earn tokens</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Share your code — when a friend registers with it, you both get bonus tokens.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-700 rounded-xl px-4 py-2.5 text-sm font-bold text-violet-700 dark:text-violet-300 tracking-widest">
              {user.referral_code}
            </code>
            <button
              onClick={() => { navigator.clipboard.writeText(user.referral_code!); setToast({ msg: "Referral code copied!", type: "success" }); }}
              className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Stripe security badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Payments secured by Stripe · Cancel anytime · No hidden fees
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Frequently asked questions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { q: "When do my tokens reset?", a: "Every day at midnight UTC. Paid plan tokens reset daily; free users get 5 per day." },
            { q: "Can I cancel anytime?", a: "Yes — click 'Manage Subscription' to cancel. You keep your tier until the billing period ends." },
            { q: "What counts as one download?", a: "Each file (video or audio) costs one token, regardless of resolution or file size." },
            { q: "What payment methods are accepted?", a: "All major credit and debit cards via Stripe. More methods coming soon." },
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

import { Suspense } from "react";
export default function PricingPageWrapper() {
  return <Suspense fallback={null}><PricingPage /></Suspense>;
}
