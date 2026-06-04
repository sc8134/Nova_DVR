"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SplashScreen
 *
 * Shows once per session (sessionStorage flag so it won't re-appear on page
 * navigation, but will show again on a fresh browser tab).
 *
 * Phases:
 *  0 → visible  (logo drops in + pulse ring)
 *  1 → hold     (tagline fades in, progress bar fills)
 *  2 → fade-out (everything fades out together)
 *  3 → unmounted (null)
 */

const HOLD_MS     = 1600;   // time to hold after bar fills
const FADEOUT_MS  = 500;    // CSS transition duration

export default function SplashScreen() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("novaDvrSplashSeen")) {
      setPhase(3);
      return;
    }
    sessionStorage.setItem("novaDvrSplashSeen", "1");

    // Phase 0 → 1: logo has dropped in, start bar + tagline
    const t1 = setTimeout(() => setPhase(1), 400);
    // Phase 1 → 2: bar finished, hold, then fade out
    const t2 = setTimeout(() => setPhase(2), 400 + HOLD_MS + 900);
    // Phase 2 → 3: unmount after fade-out transition finishes
    const t3 = setTimeout(() => setPhase(3), 400 + HOLD_MS + 900 + FADEOUT_MS + 50);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  if (phase === 3) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        opacity: phase === 2 ? 0 : 1,
        transition: phase === 2 ? `opacity ${FADEOUT_MS}ms ease-out` : "none",
        pointerEvents: phase === 2 ? "none" : "all",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo + ring */}
      <div className="relative flex items-center justify-center" style={{ marginBottom: "2rem" }}>
        {/* Pulse ring — only shows in phase 1+ */}
        {phase >= 1 && (
          <>
            <span className="absolute w-36 h-36 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: "1.8s" }} />
            <span className="absolute w-28 h-28 rounded-full border border-blue-500/20 animate-ping" style={{ animationDuration: "2.4s", animationDelay: "0.3s" }} />
          </>
        )}

        {/* Logo circle */}
        <div
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
            boxShadow: "0 0 60px rgba(109,40,217,0.5), 0 0 120px rgba(79,70,229,0.25)",
            transform: phase === 0 ? "scale(0.6) translateY(-20px)" : "scale(1) translateY(0)",
            opacity: phase === 0 ? 0 : 1,
            transition: "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease-out",
          }}
        >
          <Image
            src="/nova_logo.png"
            alt="Nova DVR"
            width={60}
            height={60}
            priority
            className="object-contain drop-shadow-lg"
          />
        </div>
      </div>

      {/* App name */}
      <div
        style={{
          transform: phase === 0 ? "translateY(12px)" : "translateY(0)",
          opacity: phase === 0 ? 0 : 1,
          transition: "transform 0.4s ease-out 0.15s, opacity 0.4s ease-out 0.15s",
        }}
        className="text-center space-y-1"
      >
        <h1 className="text-4xl font-black tracking-tight">
          <span className="text-white">Nova </span>
          <span className="text-orange-400">DVR</span>
        </h1>

        {/* Tagline — fades in during phase 1 */}
        <p
          className="text-sm font-medium text-slate-400 tracking-widest uppercase"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? "translateY(0)" : "translateY(6px)",
            transition: "opacity 0.5s ease-out 0.1s, transform 0.5s ease-out 0.1s",
          }}
        >
          Professional Media Downloader
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="mt-10 w-48 overflow-hidden rounded-full"
        style={{
          height: "3px",
          background: "rgba(255,255,255,0.08)",
          opacity: phase >= 1 ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: "9999px",
            background: "linear-gradient(90deg, #8b5cf6, #6366f1, #3b82f6)",
            width: phase >= 1 ? "100%" : "0%",
            transition: phase >= 1 ? `width ${HOLD_MS + 200}ms cubic-bezier(0.4,0,0.2,1)` : "none",
          }}
        />
      </div>

      {/* Version tag */}
      <p
        className="absolute bottom-8 text-[10px] text-slate-600 tracking-widest uppercase font-medium"
        style={{
          opacity: phase >= 1 ? 0.6 : 0,
          transition: "opacity 0.5s ease-out 0.2s",
        }}
      >
        v2.0 · Phase 2
      </p>
    </div>
  );
}
