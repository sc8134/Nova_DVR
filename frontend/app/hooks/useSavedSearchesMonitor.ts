"use client";

import { useEffect, useRef } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

// ── Types shared with the Summary dashboard ───────────────────────────────────
export interface MonitoredSearch {
  query: string;
  enabled: boolean;               // user can pause per-query monitoring
  lastChecked: string | null;     // ISO timestamp
  newCount: number;               // unseen items since last user visit
  latestItems: LatestItem[];      // up to 3 newest results
}

export interface LatestItem {
  id: string;
  title: string;
  url: string;
  uploader: string;
  thumbnail: string | null;
}

// ── localStorage helpers ──────────────────────────────────────────────────────

export function getMonitorData(): Record<string, MonitoredSearch> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("novaDvrMonitor") || "{}");
  } catch {
    return {};
  }
}

export function setMonitorData(data: Record<string, MonitoredSearch>) {
  localStorage.setItem("novaDvrMonitor", JSON.stringify(data));
}

export function getSeenIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const v = JSON.parse(localStorage.getItem("novaDvrSeenMediaIds") || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function setSeenIds(ids: string[]) {
  localStorage.setItem("novaDvrSeenMediaIds", JSON.stringify(ids.slice(-500)));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSavedSearchesMonitor() {
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const monitorSavedSearches = async () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      try {
        const settings = JSON.parse(localStorage.getItem("novaDvrSettings") || "{}");
        const saved: string[] = JSON.parse(localStorage.getItem("novaDvrSavedSearches") || "[]");

        if (!Array.isArray(saved) || saved.length === 0) {
          isRunningRef.current = false;
          return;
        }

        const monitor = getMonitorData();
        let seenIds = getSeenIds();

        // Ensure every saved query has an entry in the monitor map
        for (const q of saved) {
          if (!monitor[q]) {
            monitor[q] = { query: q, enabled: true, lastChecked: null, newCount: 0, latestItems: [] };
          }
        }

        // Only check enabled queries (up to 10)
        const toCheck = saved.filter((q) => monitor[q]?.enabled !== false).slice(0, 10);

        for (const query of toCheck) {
          try {
            const res = await fetch(`${BACKEND}/search`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query, platform: "youtube", limit: 5 }),
            });
            if (!res.ok) continue;

            const data = await res.json();
            const results: LatestItem[] = (data.results || []).slice(0, 3).map((r: any) => ({
              id: r.id || "",
              title: r.title || "Unknown",
              url: r.url || "",
              uploader: r.uploader || "",
              thumbnail: r.thumbnail || null,
            }));

            // Count genuinely new items
            let newThisRun = 0;
            for (const item of results) {
              if (item.id && !seenIds.includes(item.id)) {
                newThisRun++;
                seenIds.push(item.id);

                // Fire notification for the first new item per query
                if (newThisRun === 1 && settings.notifications &&
                    "Notification" in window && Notification.permission === "granted") {
                  const n = new Notification(`New for "${query}"`, {
                    body: `"${item.title}" by ${item.uploader || "Unknown"}`,
                    icon: "/favicon.ico",
                  });
                  n.onclick = () => {
                    window.focus();
                    window.location.href = `/?url=${encodeURIComponent(item.url)}`;
                  };
                }
              }
            }

            monitor[query] = {
              ...monitor[query],
              lastChecked: new Date().toISOString(),
              newCount: (monitor[query].newCount || 0) + newThisRun,
              latestItems: results,
            };
          } catch (err) {
            console.error(`Monitor error for "${query}":`, err);
          }
        }

        setSeenIds(seenIds);
        setMonitorData(monitor);
      } catch (err) {
        console.error("Saved searches monitor error:", err);
      } finally {
        isRunningRef.current = false;
      }
    };

    // First run after 30 s, then every 5 min
    const t = setTimeout(monitorSavedSearches, 30_000);
    const iv = setInterval(monitorSavedSearches, 5 * 60 * 1_000);

    return () => {
      clearTimeout(t);
      clearInterval(iv);
    };
  }, []);
}
