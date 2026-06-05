"use client";

import { useState, useEffect, useCallback } from "react";
import { BACKEND } from "../lib/config";

export type BackendStatus = "checking" | "online" | "offline" | "warming";

const CHECK_INTERVAL_MS = 30_000;
const TIMEOUT_MS = 8_000;   // longer timeout to survive cold starts

export function useBackendStatus(): {
  status: BackendStatus;
  recheck: () => void;
} {
  const [status, setStatus] = useState<BackendStatus>("checking");

  const check = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(`${BACKEND}/health`, { signal: controller.signal });
      clearTimeout(timer);
      if (res.ok) {
        const ct = res.headers.get("content-type") || "";
        // If Render returns HTML, it's still warming up
        if (ct.includes("text/html")) {
          setStatus("warming");
        } else {
          setStatus("online");
        }
      } else {
        setStatus("offline");
      }
    } catch {
      setStatus("offline");
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  return { status, recheck: check };
}
