"use client";

import { useState, useEffect, useCallback } from "react";

export type BackendStatus = "checking" | "online" | "offline";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;
const CHECK_INTERVAL_MS = 30_000; // re-check every 30 s
const TIMEOUT_MS = 5_000;

export function useBackendStatus(): {
  status: BackendStatus;
  recheck: () => void;
} {
  const [status, setStatus] = useState<BackendStatus>("checking");

  const check = useCallback(async () => {
    if (!BACKEND) { setStatus("offline"); return; }
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const res = await fetch(`${BACKEND}/health`, { signal: controller.signal });
      clearTimeout(timer);
      setStatus(res.ok ? "online" : "offline");
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
