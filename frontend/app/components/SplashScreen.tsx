"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const HOLD_MS    = 1400;
const FADEOUT_MS = 400;

// Safe sessionStorage wrapper — old Safari in private mode throws
function ssGet(key: string): string | null {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
function ssSet(key: string, val: string) {
  try { sessionStorage.setItem(key, val); } catch { /* ignore */ }
}

export default function SplashScreen() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(3); // start hidden
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Already seen this session
    if (ssGet("novaDvrSplashSeen")) {
      setPhase(3);
      return;
    }
    ssSet("novaDvrSplashSeen", "1");

    // Start visible immediately
    setPhase(0);

    const t1 = setTimeout(() => setPhase(1), 300);
    const t2 = setTimeout(() => setPhase(2), 300 + HOLD_MS + 600);
    const t3 = setTimeout(() => setPhase(3), 300 + HOLD_MS + 600 + FADEOUT_MS + 50);

    // Safety net — force dismiss after 5s no matter what
    const tSafe = setTimeout(() => setPhase(3), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tSafe);
    };
  }, []);

  // Don't render until mounted (avoids hydration mismatch)
  if (!mounted || phase === 3) return null;

  const visible = phase < 2;
  const animating = phase >= 1;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        opacity: visible ? 1 : 0,
        // Use simple transition — no backdrop-filter for old Safari
        transition: `opacity ${FADEOUT_MS}ms ease-out`,
        pointerEvents: visible ? "all" : "none",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "2rem", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(109,40,217,0.4)",
            transform: animating ? "scale(1) translateY(0)" : "scale(0.7) translateY(-16px)",
            opacity: animating ? 1 : 0,
            transition: "transform 0.4s ease-out, opacity 0.3s ease-out",
          }}
        >
          <Image
            src="/nova_logo.png"
            alt="Nova DVR"
            width={60}
            height={60}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      {/* App name */}
      <div
        style={{
          textAlign: "center",
          opacity: animating ? 1 : 0,
          transform: animating ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.4s ease-out 0.1s, transform 0.4s ease-out 0.1s",
        }}
      >
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>
          <span style={{ color: "#fff" }}>Nova </span>
          <span style={{ color: "#fb923c" }}>DVR</span>
        </h1>
        <p
          style={{
            fontSize: 11,
            color: "#94a3b8",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginTop: 6,
            opacity: animating ? 1 : 0,
            transition: "opacity 0.5s ease-out 0.2s",
          }}
        >
          Professional Media Downloader
        </p>
      </div>

      {/* Progress bar — simple, no clip-path */}
      <div
        style={{
          marginTop: 40,
          width: 180,
          height: 3,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 9999,
          overflow: "hidden",
          opacity: animating ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 9999,
            background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
            width: animating ? "100%" : "0%",
            transition: animating ? `width ${HOLD_MS + 200}ms ease-in-out` : "none",
          }}
        />
      </div>

      {/* Version */}
      <p
        style={{
          position: "absolute",
          bottom: 32,
          fontSize: 10,
          color: "#475569",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          opacity: animating ? 0.6 : 0,
          transition: "opacity 0.5s ease-out 0.3s",
        }}
      >
        v2.0 · Phase 2
      </p>
    </div>
  );
}
