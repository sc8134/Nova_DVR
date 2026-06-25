"use client";

import Link from "next/link";

const PLATFORMS = [
  { name: "YouTube",   color: "bg-red-500/10 text-red-400 border-red-500/20" },
  { name: "Instagram", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { name: "TikTok",    color: "bg-slate-500/10 text-slate-300 border-slate-500/20" },
  { name: "Twitter/X", color: "bg-sky-500/10 text-sky-400 border-sky-500/20" },
  { name: "SoundCloud",color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  { name: "Twitch",    color: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
];

const FEATURES = ["4K MP4", "MP3 Audio", "Batch Downloads", "Subtitle Support", "AI Format Pick", "Trim & Cut"];

export default function HeroSection({ onUseInApp }: { onUseInApp: (url: string) => void }) {
  void onUseInApp;

  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-heading">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950" aria-hidden="true" />

      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 px-6 py-16 md:py-24 lg:py-28 max-w-5xl mx-auto">
        <div className="text-center space-y-6">

          {/* Status badge */}
          <div className="flex justify-center animate-fade-in-up">
            <span className="inline-flex items-center gap-2 bg-white/8 backdrop-blur border border-white/15 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              Free · No account required · 1000+ sites
            </span>
          </div>

          {/* Headline */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
            <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              <span className="text-white">Download anything, </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-orange-400">
                instantly
              </span>
            </h1>
          </div>

          {/* Sub-headline */}
          <div className="animate-fade-in-up" style={{ animationDelay: "0.10s" }}>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Nova DVR grabs video and audio from YouTube, Instagram, TikTok, and 1000+ other sites — in any resolution, as MP4 or MP3.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
            {FEATURES.map((f) => (
              <span key={f} className="text-xs font-medium bg-white/8 border border-white/12 text-slate-300 px-3 py-1.5 rounded-full transition-colors hover:bg-white/15 hover:text-white">
                {f}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 animate-fade-in-up" style={{ animationDelay: "0.20s" }}>
            <a
              href="#downloader"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 btn-press"
              aria-label="Start downloading now"
            >
              <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Start Downloading
            </a>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/25 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-all btn-press"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
              </svg>
              View Pricing
            </Link>
          </div>

          {/* Platform badges */}
          <div className="pt-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Supports
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PLATFORMS.map((p) => (
                <span
                  key={p.name}
                  className={`text-[11px] font-semibold border px-2.5 py-1 rounded-full ${p.color}`}
                >
                  {p.name}
                </span>
              ))}
              <span className="text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-400 px-2.5 py-1 rounded-full">
                + 1000 more
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" aria-hidden="true" />
    </section>
  );
}
