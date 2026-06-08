"use client";

import { useEffect, useRef, useCallback } from "react";
import { BACKEND } from "../lib/config";
import { setToken } from "../lib/auth";

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

  const handleCredential = useCallback(async (response: { credential: string }) => {
    try {
      const res = await fetch(`${BACKEND}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: response.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Google sign-in failed");
      setToken(data.token);
      onSuccess(data);
    } catch (e: unknown) {
      onError?.(e instanceof Error ? e.message : "Google sign-in failed");
    }
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        width: containerRef.current.offsetWidth || 320,
        text: label === "Continue with Google" ? "continue_with" : "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
      });
    };

    // Load the Google GSI script if not already loaded
    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [clientId, handleCredential, label]);

  if (!clientId) return null;

  return (
    <div className="w-full flex justify-center">
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
