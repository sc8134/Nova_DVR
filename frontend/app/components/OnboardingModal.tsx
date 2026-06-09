"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const STEPS = [
  {
    icon: "🎬",
    title: "Welcome to Nova DVR",
    desc: "The fastest way to download video and audio from 1000+ sites. Let's take a 30-second tour so you know exactly what everything does.",
    highlight: null,
    tip: null,
  },
  {
    icon: "🔗",
    title: "Paste any video URL",
    desc: "Copy a link from YouTube, Instagram, TikTok, SoundCloud — or any of 1000+ supported platforms — and paste it into the URL box on the Downloader page.",
    highlight: "url-input",
    tip: "Tip: Press Enter after pasting to instantly inspect the video.",
  },
  {
    icon: "🔍",
    title: "Inspect the video",
    desc: "Hit Inspect URL to fetch the video's title, thumbnail, duration and view count. This confirms the link is valid before you download.",
    highlight: "inspect-btn",
    tip: "Tip: Inspection is instant and free — no tokens used.",
  },
  {
    icon: "📋",
    title: "Pick a format",
    desc: "After inspecting, click Check Available Formats. Choose from MP4 video (144p up to 4K) or MP3 audio. Our AI will suggest the best format based on your history.",
    highlight: "format-selector",
    tip: "Tip: 1080p MP4 is the best balance of quality and file size for most videos.",
  },
  {
    icon: "⬇️",
    title: "Download",
    desc: "Hit the Download button. You'll see a live progress bar with speed and ETA. The file goes straight to your Downloads folder.",
    highlight: "download-btn",
    tip: "Tip: Set a custom save folder in Settings to organise downloads automatically.",
  },
  {
    icon: "📦",
    title: "Batch & SearchHub",
    desc: "Need to download many videos at once? Use Batch Downloader. Want to search and discover content first? Try SearchHub — search YouTube, SoundCloud and Bilibili in one place.",
    highlight: null,
    tip: "Tip: In Batch, paste a playlist URL and hit Explode to auto-add all videos.",
  },
  {
    icon: "🤖",
    title: "AI Assistant",
    desc: "The chat bubble in the bottom-right corner is your AI assistant. Type or say commands like \"Download the latest Diljit Dosanjh song\" and it handles everything automatically.",
    highlight: "chat-btn",
    tip: "Tip: The AI supports voice commands — tap the mic icon and speak naturally.",
  },
  {
    icon: "🎟",
    title: "Your token wallet",
    desc: "Free accounts get 5 downloads per day. Your token balance is always visible in the sidebar. Upgrade on the Pricing page to get 20, 50, 100 or unlimited daily downloads.",
    highlight: "wallet",
    tip: "Tip: Tokens reset every day at midnight UTC — no rollover.",
  },
];

export default function OnboardingModal() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only once — check localStorage flag with safe wrapper
    if (typeof window === "undefined") return;
    let seen = false;
    try { seen = !!localStorage.getItem("novaDvrOnboardingSeen"); } catch { seen = true; }
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 2200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    try { localStorage.setItem("novaDvrOnboardingSeen", "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 bg-black/60"
      style={{ WebkitOverflowScrolling: "touch" }}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-700">
          <div
            className="h-1 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/40 dark:to-violet-900/40 flex items-center justify-center text-2xl shrink-0">
              {current.icon}
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Step {step + 1} of {STEPS.length}
              </p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {current.title}
              </h2>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition mt-1"
            aria-label="Skip tour"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo on first step */}
        {step === 0 && (
          <div className="flex justify-center pb-2">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 ring-2 ring-blue-500/30 shadow-xl">
              <Image src="/nova_logo.png" alt="Nova DVR" fill className="object-contain p-1" />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-2 space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.desc}
          </p>
          {current.tip && (
            <div className="flex items-start gap-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl px-4 py-3">
              <span className="text-blue-500 shrink-0 text-sm">💡</span>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">{current.tip}</p>
            </div>
          )}
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 py-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${
                i === step
                  ? "w-4 h-2 bg-blue-500"
                  : "w-2 h-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3">
          {step > 0 ? (
            <button
              onClick={prev}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              ← Back
            </button>
          ) : (
            <button
              onClick={dismiss}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Skip tour
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            {isLast ? (
              <>Let&apos;s go! 🚀</>
            ) : (
              <>Next →</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
