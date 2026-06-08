"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { BACKEND } from "../lib/config";
import { setToken } from "../lib/auth";
import { safeJson } from "../lib/safeJson";

interface Props {
  onSuccess: (userData: Record<string, unknown>) => void;
  onError?: (msg: string) => void;
  label?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: object) => void;
          renderButton: (el: HTMLElement, cfg: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({ onSuccess, onError, label = "Continue with Google" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const [rendered, setRendered] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleCredential = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(`${BACKEND}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      });
      const data = await safeJson(res) as Record<string, unknown> & { error?: string };
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");
      setToken(data.token as string);
      onSuccess(data);
    } catch (e: unknown) {
      onError?.(e instanceof Error ? e.message : "Google sign-in failed");
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google || !containerRef.current) return;
      try {
        // Use a slight delay so the container has a rendered width
        setTimeout(() => {
          if (!containerRef.current) return;
          window.google!.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window.google!.accounts.id.renderButton(containerRef.current, {
            theme: "outline",
            size: "large",
            width: Math.min(containerRef.current.offsetWidth || 400, 400),
            text: label.toLowerCase().includes("up") ? "signup_with" : "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
          });
          setRendered(true);
        }, 50);
      } catch {
        setLoadError(true);
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existing) {
        // Script already loading — wait for it
        existing.addEventListener("load", initGoogle);
      } else {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => setLoadError(true);
        document.head.appendChild(script);
      }
    }
  }, [clientId, handleCredential, label]);

  // No client ID configured — show a disabled placeholder so devs know it's missing
  if (!clientId) {
    return (
      <div className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-50 dark:bg-slate-700/50 cursor-not-allowed select-none">
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google Sign-In not configured
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full text-center text-xs text-slate-400 py-2">
        Google Sign-In unavailable — use email instead
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Real Google button rendered here by GSI */}
      <div ref={containerRef} className="w-full min-h-[44px]" />
      {/* Fallback while GSI loads */}
      {!rendered && (
        <div className="w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800">
          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 animate-pulse" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Loading Google Sign-In…
        </div>
      )}
    </div>
  );
}
