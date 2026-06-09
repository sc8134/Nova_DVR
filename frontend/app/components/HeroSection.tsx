"use client";

import Link from "next/link";

export default function HeroSection({ onUseInApp }: { onUseInApp: (url: string) => void }) {
  // onUseInApp kept for API compatibility but unused after demo removal
  void onUseInApp;

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950" />
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Free · No account required · 1000+ sites
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
          Download anything,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            instantly
          </span>
        </h1>

        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-8">
          Nova DVR grabs video and audio from YouTube, Instagram, TikTok, and 1000+ other sites — in any resolution, as MP4 or MP3.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["4K MP4", "MP3 Audio", "Batch Downloads", "Subtitle Support", "AI Format Pick"].map((f) => (
            <span key={f} className="text-xs font-medium bg-white/10 border border-white/15 text-slate-300 px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#downloader"
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm px-8 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Start Downloading
          </a>
          <Link
            href="/pricing"
            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm px-8 py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a3 3 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
            View Pricing
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
}
