"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { BACKEND } from "../lib/config";
import { safeJson } from "../lib/safeJson";

interface DemoMeta {
  title: string;
  uploader: string;
  duration: number | null;
  thumbnail: string | null;
  platform: string;
  view_count: number | null;
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

function formatViews(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

const EXAMPLE_URLS = [
  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "https://www.youtube.com/watch?v=jNQXAC9IVRw",
];

export default function HeroSection({ onUseInApp }: { onUseInApp: (url: string) => void }) {
  const [demoUrl, setDemoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<DemoMeta | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const runDemo = async (urlToTry: string) => {
    const trimmed = urlToTry.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    setLoading(true);
    setMeta(null);
    setError("");
    try {
      const res = await fetch(`${BACKEND}/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await safeJson(res) as DemoMeta & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error || "Could not inspect URL");
      setMeta(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not inspect URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950" />
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 px-6 py-14 md:py-20 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Free · No account required · 1000+ sites
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
            Download anything,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
              instantly
            </span>
          </h1>
          <p className="mt-4 text-slate-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Nova DVR grabs video and audio from YouTube, Instagram, TikTok, and 1000+ other sites — in any resolution, as MP4 or MP3.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["4K MP4", "MP3 Audio", "Batch Downloads", "Subtitle Support", "AI Format Pick"].map((f) => (
            <span key={f} className="text-xs font-medium bg-white/10 border border-white/15 text-slate-300 px-3 py-1 rounded-full">
              {f}
            </span>
          ))}
        </div>

        {/* ── Interactive Demo Card ── */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl shadow-black/40 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Try it live — paste any video URL
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={inputRef}
              type="url"
              value={demoUrl}
              onChange={(e) => { setDemoUrl(e.target.value); setError(""); setMeta(null); }}
              onKeyDown={(e) => e.key === "Enter" && runDemo(demoUrl)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <button
              onClick={() => runDemo(demoUrl)}
              disabled={loading}
              className="sm:shrink-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
              )}
              {loading ? "Inspecting…" : "Inspect"}
            </button>
          </div>

          {/* Example buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-slate-400">Try an example:</span>
            {EXAMPLE_URLS.map((u, i) => (
              <button
                key={u}
                onClick={() => { setDemoUrl(u); runDemo(u); }}
                className="text-xs text-blue-300 hover:text-blue-100 underline underline-offset-2 transition"
              >
                Example {i + 1}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Result card */}
          {meta && (
            <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-3 animate-[fadeIn_0.3s_ease]">
              <div className="flex gap-3">
                {meta.thumbnail && (
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden shrink-0 bg-black/30">
                    <Image src={meta.thumbnail} alt={meta.title} fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">{meta.title}</p>
                  <p className="text-xs text-slate-400">{meta.uploader}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-400/20 px-2 py-0.5 rounded-full font-medium">{meta.platform}</span>
                    {formatDuration(meta.duration) && <span>⏱ {formatDuration(meta.duration)}</span>}
                    {formatViews(meta.view_count) && <span>👁 {formatViews(meta.view_count)}</span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-green-400 text-xs font-semibold">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  Ready to download
                </div>
                <button
                  onClick={() => onUseInApp(demoUrl)}
                  className="sm:ml-auto bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download this →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade to page bg */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
}
