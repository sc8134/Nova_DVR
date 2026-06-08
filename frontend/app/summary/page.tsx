"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getMonitorData,
  setMonitorData,
  type MonitoredSearch,
} from "../hooks/useSavedSearchesMonitor";

import { BACKEND } from "../lib/config";

interface DownloadJob {
  url: string;
  title?: string;
  format: string;
  resolution?: string;
  status: string;
  timestamp: string;
}

interface DbJob {
  id: number;
  url: string;
  title: string;
  format_id: string;
  resolution: string;
  is_audio: number;
  status: string;
  error_msg: string | null;
  filepath: string | null;
  created_at: string;
  updated_at: string;
}

interface ErrorEntry {
  id: number;
  url: string;
  error_msg: string;
  context: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getSavedSearches(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("novaDvrSavedSearches") || "[]"); } catch { return []; }
}

// ─── Monitor Dashboard ────────────────────────────────────────────────────────

function MonitorDashboard() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [monitor, setMonitor] = useState<Record<string, MonitoredSearch>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setSavedSearches(getSavedSearches());
    setMonitor(getMonitorData());
  }, []);

  useEffect(() => {
    refresh();
    // Refresh the UI every 30 s so "X min ago" stays fresh
    const iv = setInterval(refresh, 30_000);
    return () => clearInterval(iv);
  }, [refresh]);

  const toggleEnabled = (query: string) => {
    const next = { ...monitor };
    if (!next[query]) {
      next[query] = { query, enabled: true, lastChecked: null, newCount: 0, latestItems: [] };
    }
    next[query] = { ...next[query], enabled: !next[query].enabled };
    setMonitorData(next);
    setMonitor(next);
  };

  const clearNew = (query: string) => {
    const next = { ...monitor };
    if (next[query]) {
      next[query] = { ...next[query], newCount: 0 };
      setMonitorData(next);
      setMonitor(next);
    }
  };

  const deleteSearch = (query: string) => {
    // Remove from saved searches list
    const updated = savedSearches.filter((q) => q !== query);
    localStorage.setItem("novaDvrSavedSearches", JSON.stringify(updated));
    setSavedSearches(updated);
    // Remove from monitor data
    const next = { ...monitor };
    delete next[query];
    setMonitorData(next);
    setMonitor(next);
  };

  const notifEnabled =
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted" &&
    (() => {
      try { return JSON.parse(localStorage.getItem("novaDvrSettings") || "{}").notifications; } catch { return false; }
    })();

  const totalNew = Object.values(monitor).reduce((s, m) => s + (m.newCount || 0), 0);

  if (savedSearches.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-10 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-xl">🔖</div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No saved searches yet</p>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Go to{" "}
          <button onClick={() => router.push("/searchhub")} className="text-blue-500 hover:underline">
            SearchHub
          </button>
          , search for something, and click <span className="font-semibold">🔖 Save Search</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{savedSearches.length} saved</span>
          {totalNew > 0 && (
            <span className="text-xs font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
              {totalNew} new
            </span>
          )}
        </div>
        {!notifEnabled && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-1.5 rounded-xl">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            Enable notifications in{" "}
            <button onClick={() => router.push("/settings")} className="font-semibold underline underline-offset-2">
              Settings
            </button>{" "}
            to get alerts
          </div>
        )}
      </div>

      {/* Rows */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {savedSearches.map((query) => {
            const m = monitor[query];
            const isEnabled = m?.enabled !== false;
            const newCount = m?.newCount || 0;
            const isExpanded = expanded === query;

            return (
              <div key={query} className="transition">
                {/* Row */}
                <div className="flex items-center gap-3 px-5 py-3.5">
                  {/* Toggle monitoring on/off */}
                  <button
                    onClick={() => toggleEnabled(query)}
                    title={isEnabled ? "Pause monitoring" : "Resume monitoring"}
                    className="shrink-0"
                    aria-pressed={isEnabled}
                  >
                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${isEnabled ? "bg-violet-600" : "bg-slate-200 dark:bg-slate-600"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${isEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
                    </div>
                  </button>

                  {/* Query label */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{query}</p>
                      {newCount > 0 && (
                        <span className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-1.5 py-0.5 rounded-full border border-violet-200 dark:border-violet-700">
                          {newCount} new
                        </span>
                      )}
                      {!isEnabled && (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                          Paused
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Last checked: <span className="font-medium">{timeAgo(m?.lastChecked || null)}</span>
                      {m?.latestItems?.length ? ` · ${m.latestItems.length} result${m.latestItems.length !== 1 ? "s" : ""} cached` : ""}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Search now */}
                    <button
                      onClick={() => router.push(`/searchhub?q=${encodeURIComponent(query)}`)}
                      title="Search now"
                      className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 transition"
                    >
                      Search
                    </button>

                    {/* Expand / collapse cached results */}
                    {m?.latestItems?.length ? (
                      <button
                        onClick={() => {
                          setExpanded(isExpanded ? null : query);
                          if (newCount > 0) clearNew(query);
                        }}
                        title="View latest results"
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                          isExpanded
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400"
                        }`}
                      >
                        {isExpanded ? "▲ Hide" : `▼ View${newCount > 0 ? ` (${newCount} new)` : ""}`}
                      </button>
                    ) : null}

                    {/* Delete */}
                    <button
                      onClick={() => deleteSearch(query)}
                      title="Delete saved search"
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded: latest cached results */}
                {isExpanded && m?.latestItems?.length ? (
                  <div className="px-5 pb-4 space-y-2 bg-slate-50/60 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider pt-3">
                      Latest results from last check
                    </p>
                    {m.latestItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-14 h-9 rounded-lg object-cover shrink-0 bg-slate-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                          {item.uploader && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{item.uploader}</p>
                          )}
                        </div>
                        <button
                          onClick={() => router.push(`/?url=${encodeURIComponent(item.url)}`)}
                          className="shrink-0 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg transition"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Error Dashboard ─────────────────────────────────────────────────────────

function ErrorDashboard() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [dbJobs, setDbJobs] = useState<DbJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"errors" | "jobs">("errors");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [errRes, jobRes] = await Promise.all([
        fetch(`${BACKEND}/logs?limit=200`),
        fetch(`${BACKEND}/jobs?limit=200`),
      ]);
      const errData = errRes.ok ? await errRes.json() : { errors: [] };
      const jobData = jobRes.ok ? await jobRes.json() : { jobs: [] };
      setErrors(errData.errors || []);
      setDbJobs(jobData.jobs || []);
    } catch {
      // backend offline
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 30_000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const clearErrors = async () => {
    setClearing(true);
    try {
      await fetch(`${BACKEND}/logs`, { method: "DELETE" });
      setErrors([]);
    } catch { /* ignore */ }
    setClearing(false);
  };

  const filteredJobs = statusFilter === "all"
    ? dbJobs
    : dbJobs.filter((j) => j.status === statusFilter);

  const errorJobs = dbJobs.filter((j) => j.status === "error");
  const doneJobs  = dbJobs.filter((j) => j.status === "done");

  function fmtDate(iso: string) {
    if (!iso) return "—";
    try { return new Date(iso + "Z").toLocaleString(); } catch { return iso; }
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Jobs",  value: dbJobs.length,   color: "slate" },
          { label: "Completed",   value: doneJobs.length,  color: "green" },
          { label: "Errors",      value: errorJobs.length, color: "red"   },
          { label: "Log Entries", value: errors.length,    color: "amber" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold ${
              stat.color === "green" ? "text-green-600 dark:text-green-400"
              : stat.color === "red"   ? "text-red-500 dark:text-red-400"
              : stat.color === "amber" ? "text-amber-500 dark:text-amber-400"
              : "text-slate-900 dark:text-white"
            }`}>{stat.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit border border-slate-200 dark:border-slate-700">
        {(["errors", "jobs"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveSubTab(tab)}
            className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition ${
              activeSubTab === tab
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}>
            {tab === "errors" ? `⚠️ Error Log (${errors.length})` : `📋 Job Queue (${dbJobs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="w-6 h-6 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : activeSubTab === "errors" ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Error Log <span className="text-slate-400 font-normal text-xs">· last 200 entries</span>
            </span>
            <div className="flex gap-2">
              <button onClick={fetchData}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition">
                ↻ Refresh
              </button>
              {errors.length > 0 && (
                <button onClick={clearErrors} disabled={clearing}
                  className="text-xs text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border border-red-200 dark:border-red-800 px-3 py-1.5 rounded-lg transition disabled:opacity-40">
                  {clearing ? "Clearing…" : "Clear Log"}
                </button>
              )}
            </div>
          </div>
          {errors.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto text-xl">✅</div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No errors logged</p>
              <p className="text-xs text-slate-400">All downloads are running cleanly.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
              {errors.map((err) => (
                <div key={err.id} className="px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-red-400 text-base">⚠️</span>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400 line-clamp-2">
                        {err.error_msg}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                        {err.url}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                        {err.context && (
                          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {err.context}
                          </span>
                        )}
                        <span>{fmtDate(err.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Job Queue tab
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Persistent Job Queue <span className="text-slate-400 font-normal text-xs">· SQLite · last 200</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <div className="flex gap-1">
                {["all", "done", "error", "downloading", "queued"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition ${
                      statusFilter === s
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400"
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={fetchData}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 transition">
                ↻ Refresh
              </button>
            </div>
          </div>
          {filteredJobs.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm text-slate-400">No {statusFilter !== "all" ? statusFilter : ""} jobs found.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[480px] overflow-y-auto">
              {filteredJobs.map((job) => (
                <div key={job.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                  <span className={`shrink-0 mt-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${
                    job.status === "done"        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                    : job.status === "error"     ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                    : job.status === "downloading" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600"
                  }`}>
                    {job.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {job.title || job.url}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                      {job.resolution && <span className="font-semibold">{job.resolution} · </span>}
                      <span className="font-mono">{job.format_id}</span>
                      {job.is_audio ? " · 🎵 MP3" : ""}
                    </p>
                    {job.error_msg && (
                      <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5 line-clamp-1">
                        {job.error_msg}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                      {fmtDate(job.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SummaryPage() {
  const [jobs, setJobs] = useState<DownloadJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "monitor" | "errors">("history");

  useEffect(() => {
    const stored = localStorage.getItem("novaDvrJobs");
    if (stored) {
      try { setJobs(JSON.parse(stored)); } catch { setJobs([]); }
    }
    setLoaded(true);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("novaDvrJobs");
    setJobs([]);
  };

  const savedCount = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(localStorage.getItem("novaDvrSavedSearches") || "[]").length; } catch { return 0; } })()
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Summary</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Download history and saved search monitoring.
          </p>
        </div>
        {activeTab === "history" && jobs.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl transition font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Clear History
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-fit">
        {([
          { key: "history", label: "📥 Download History" },
          { key: "monitor", label: `🔖 Saved Searches${savedCount > 0 ? ` (${savedCount})` : ""}` },
          { key: "errors",  label: "⚠️ Error Dashboard" },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${
              activeTab === key
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ══ HISTORY TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <>
          {/* Stats Bar */}
          {loaded && jobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Total Downloads", value: jobs.length },
                { label: "Completed",       value: jobs.filter((j) => j.status === "Done").length },
                { label: "In Progress",     value: jobs.filter((j) => j.status === "Started").length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Jobs List */}
          {!loaded ? null : jobs.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">No downloads yet</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Head to the{" "}
                <a href="/" className="text-blue-600 hover:underline font-medium">Downloader</a>{" "}
                to start your first download.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {jobs.map((job, idx) => (
                  <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                    <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                        {job.title || job.url}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {job.resolution && <span className="font-semibold text-slate-500 dark:text-slate-400">{job.resolution} · </span>}
                        <span className="font-mono">{job.format}</span> · {job.timestamp}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full shrink-0 ${
                      job.status === "Done"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                        : job.status === "Started"
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"
                    }`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══ MONITOR TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === "monitor" && (
        <div className="space-y-4">
          {/* Info banner */}
          <div className="flex items-start gap-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-2xl px-5 py-3.5">
            <span className="text-lg shrink-0">🔖</span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-violet-800 dark:text-violet-300">Saved Search Monitoring</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">
                Nova DVR checks your saved searches every 5 minutes while the app is open and notifies you when new content appears. Toggle the switch on each row to pause or resume per-query monitoring.
              </p>
            </div>
          </div>

          <MonitorDashboard />
        </div>
      )}

      {/* ══ ERRORS TAB ════════════════════════════════════════════════════════ */}
      {activeTab === "errors" && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl px-5 py-3.5">
            <span className="text-lg shrink-0">⚠️</span>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-red-800 dark:text-red-300">Error Dashboard</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Live view of backend error logs and the persistent SQLite job queue. Errors are stored on the backend — data persists across restarts.
              </p>
            </div>
          </div>
          <ErrorDashboard />
        </div>
      )}

    </div>
  );
}
