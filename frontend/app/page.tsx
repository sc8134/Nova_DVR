"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import SupportedSites from "./components/SupportedSites";
import DownloadLocationModal from "./components/DownloadLocationModal";
import TrimSlider from "./components/TrimSlider";

interface VideoMeta {
  title: string;
  uploader: string;
  duration: number | null;
  thumbnail: string | null;
  platform: string;
  view_count: number | null;
  upload_date: string | null;
}

interface Format {
  format_id: string;
  ext: string;
  resolution: string | null;
  abr?: number;
  note: string | null;
  type: string;
  display_only?: boolean;
}

interface SessionJob {
  url: string;
  title: string;
  format: string;
  resolution: string;
  status: string;
  timestamp: string;
}

function getSettings() {
  if (typeof window === "undefined") return {} as Record<string, string>;
  try { return JSON.parse(localStorage.getItem("novaDvrSettings") || "{}"); }
  catch { return {}; }
}

function fireNotification(title: string, body: string) {
  const s = getSettings();
  if (s.notifications && "Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/favicon.ico" });
  }
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function formatViews(n: number | null) {
  if (!n) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K views`;
  return `${n} views`;
}

function formatDate(d: string | null) {
  if (!d || d.length !== 8) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

function DownloaderInner() {
  const searchParams = useSearchParams();
  const urlInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl]                   = useState("");
  const [inspecting, setInspecting]     = useState(false);
  const [meta, setMeta]                 = useState<VideoMeta | null>(null);
  const [formats, setFormats]           = useState<Format[]>([]);
  const [loadingFormats, setLoadingFormats] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);
  const [downloading, setDownloading]   = useState(false);
  const [sessionJobs, setSessionJobs]   = useState<SessionJob[]>([]);
  const [error, setError]               = useState("");
  const [inspectStatus, setInspectStatus] = useState<"idle"|"ok"|"error">("idle");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [aiSummary, setAiSummary]       = useState("");
  const [aiRec, setAiRec]               = useState<{ format: Format; reason: string } | null>(null);
  const [aiError, setAiError]           = useState<{ explanation: string; suggestion: string } | null>(null);
  const [retryCount, setRetryCount]     = useState(0);
  // Trim
  const [trimStart, setTrimStart]       = useState("");
  const [trimEnd, setTrimEnd]           = useState("");
  const [showTrim, setShowTrim]         = useState(false);
  // Subtitles
  const [subtitles, setSubtitles]       = useState<{ lang: string; name: string; auto: boolean; formats: string[] }[]>([]);
  const [subLang, setSubLang]           = useState("");
  const [subFormat, setSubFormat]       = useState("srt");
  const [embedSubs, setEmbedSubs]       = useState(false);
  const [loadingSubs, setLoadingSubs]   = useState(false);
  // Progress states
  const [downloadPercent, setDownloadPercent] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed]     = useState("");
  const [downloadEta, setDownloadEta]         = useState("");
  const [downloadStatusText, setDownloadStatusText] = useState("");

  // ── Auto-inspect when navigated from SearchHub ──────────────
  useEffect(() => {
    const fromSearch = searchParams.get("url");
    if (fromSearch) {
      setUrl(fromSearch);
      // slight delay so state is set before the async call reads it
      setTimeout(() => runInspect(fromSearch), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Step 1: Inspect URL ──────────────────────────────────────
  const runInspect = async (targetUrl: string) => {
    setError("");
    setRetryCount(0);
    setMeta(null);
    setFormats([]);
    setSelectedFormat(null);
    setInspectStatus("idle");
    setInspecting(true);
    setAiSummary("");
    setAiRec(null);
    setAiError(null);
    setTrimStart(""); setTrimEnd(""); setShowTrim(false);
    setSubtitles([]); setSubLang(""); setLoadingSubs(false);
    setDownloadPercent(null);
    setDownloadSpeed("");
    setDownloadEta("");
    setDownloadStatusText("");
    try {
      const res = await fetch(`${BACKEND}/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Inspection failed");
      setMeta(data);
      setInspectStatus("ok");

      // ── AI: generate summary from metadata ──
      try {
        const sumRes = await fetch(`${BACKEND}/ai/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title:      data.title,
            uploader:   data.uploader,
            duration:   data.duration,
            platform:   data.platform,
            view_count: data.view_count,
            upload_date: data.upload_date,
          }),
        });
        const sumData = await sumRes.json();
        if (sumData.summary) setAiSummary(sumData.summary);
      } catch { /* non-critical */ }
    } catch (e: unknown) {
      setInspectStatus("error");
      setError(e instanceof Error ? e.message : "Could not inspect URL. Check backend.");
    } finally {
      setInspecting(false);
    }
  };

  const handleInspect = () => {
    if (!url.trim()) return setError("Please enter a URL.");
    runInspect(url);
  };

  // ── Step 2: Fetch Formats ────────────────────────────────────
  const handleFetchFormats = async () => {
    setError("");
    setFormats([]);
    setSelectedFormat(null);
    setLoadingFormats(true);
    try {
      const res = await fetch(`${BACKEND}/list-formats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to fetch formats");
      const fetchedFormats = data.formats || [];
      setFormats(fetchedFormats);

      // ── AI: recommend best format based on history ──
      try {
        const history = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
        const recRes = await fetch(`${BACKEND}/ai/recommend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ history, formats: fetchedFormats }),
        });
        const recData = await recRes.json();
        if (recData.recommendation) {
          setAiRec({ format: recData.recommendation as Format, reason: recData.reason });
        }
      } catch { /* non-critical */ }

      // ── Fetch available subtitle tracks ──
      setLoadingSubs(true);
      try {
        const subRes = await fetch(`${BACKEND}/subtitles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Send browser language so backend can auto-detect best match
          body: JSON.stringify({ url, preferred_lang: navigator.language || "en" }),
        });
        const subData = await subRes.json();
        if (subData.subtitles?.length) {
          setSubtitles(subData.subtitles);
          // Auto-select the backend-recommended language
          if (subData.recommended_lang) {
            setSubLang(subData.recommended_lang);
          }
        }
      } catch { /* non-critical */ } finally {
        setLoadingSubs(false);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch formats.");
    } finally {
      setLoadingFormats(false);
    }
  };

  // ── Step 3: Download ─────────────────────────────────────────
  const handleDownload = async () => {
    if (!selectedFormat) return setError("Please select a format.");
    setError("");

    const settings = getSettings();
    // If no directory saved yet, show the location modal first
    if (!settings.directory?.trim()) {
      setShowLocationModal(true);
      return;
    }
    await runDownload(settings.directory);
  };

  const runDownload = async (downloadDir: string) => {
    if (!selectedFormat) return;
    setDownloading(true);
    setDownloadPercent(null);
    setDownloadSpeed("");
    setDownloadEta("");
    setDownloadStatusText("Initializing download...");

    const is_audio = selectedFormat.type === "audio-only";
    const is_4k    = selectedFormat.resolution === "4K";
    const useAdvanced = !!(trimStart || trimEnd || subLang);
    const endpoint = useAdvanced ? "/download-with-options" : "/download";

    try {
      const body: Record<string, unknown> = {
        url, format_id: selectedFormat.format_id,
        is_audio, is_4k, download_dir: downloadDir,
      };
      if (useAdvanced) {
        if (trimStart) body.start_time = trimStart;
        if (trimEnd)   body.end_time   = trimEnd;
        if (subLang) {
          body.sub_lang    = subLang;
          body.sub_format  = subFormat;
          body.embed_subs  = embedSubs;
        }
      }
      const res = await fetch(`${BACKEND}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Download failed to start");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is not readable");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const cleanLine = line.trim();
          if (cleanLine.startsWith("data: ")) {
            try {
              const data = JSON.parse(cleanLine.substring(6));
              if (data.status === "downloading") {
                const pct = parseFloat(data.percent);
                if (!isNaN(pct)) setDownloadPercent(pct);
                setDownloadSpeed(data.speed || "");
                setDownloadEta(data.eta || "");
                setDownloadStatusText(`Downloading: ${pct.toFixed(1)}%`);
              } else if (data.status === "processing") {
                setDownloadStatusText(data.message || "Post-processing...");
              } else if (data.status === "done") {
                setDownloadStatusText("Finished post-processing.");
                if (data.filepath) {
                  const isTemp = data.is_temp ? "1" : "0";
                  const a = document.createElement("a");
                  a.href = `${BACKEND}/serve-file?path=${encodeURIComponent(data.filepath)}&temp=${isTemp}`;
                  a.download = data.filename || "download";
                  document.body.appendChild(a); a.click(); document.body.removeChild(a);
                }

                const job: SessionJob = {
                  url, title: meta?.title || url,
                  format: selectedFormat.format_id,
                  resolution: selectedFormat.resolution || selectedFormat.note || selectedFormat.ext,
                  status: "Done", timestamp: new Date().toLocaleString(),
                };
                setSessionJobs((p) => [job, ...p]);
                fireNotification("Nova DVR — Download complete", `${meta?.title || url} saved to ${data.save_dir || downloadDir}`);
                setRetryCount(0);
                const existing = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
                existing.unshift(job);
                localStorage.setItem("novaDvrJobs", JSON.stringify(existing));
              } else if (data.status === "error") {
                throw new Error(data.error || "Download failed");
              }
            } catch (jsonErr: unknown) {
              if (jsonErr instanceof Error && jsonErr.message !== "Unexpected end of JSON input") {
                throw jsonErr;
              }
            }
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Download failed.";
      setError(msg);
      setRetryCount((c) => c + 1);
      // Rich failure notification with retry hint
      const notifBody = retryCount > 0
        ? `${meta?.title || "Download"} failed again (attempt ${retryCount + 1}). Check the error for details.`
        : `${meta?.title || "Download"} failed. Tap to retry.`;
      fireNotification("Nova DVR — Download failed ⚠️", notifBody);
      try {
        const errRes = await fetch(`${BACKEND}/ai/explain-error`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: msg }),
        });
        const errData = await errRes.json();
        if (errData.explanation) setAiError(errData);
      } catch { /* non-critical */ }
    } finally {
      setDownloading(false);
    }
  };

  const videoFormats = formats.filter((f) => f.type === "video+audio");
  const audioFormats = formats.filter((f) => f.type === "audio-only");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6" suppressHydrationWarning>

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Downloader</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste a URL, inspect it, choose a format, and download.
        </p>
      </div>

      {/* ── Step 1 — URL + Inspect ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Paste Video URL</span>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=… or any supported site"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); setInspectStatus("idle"); setMeta(null); setFormats([]); }}
              onKeyDown={(e) => e.key === "Enter" && handleInspect()}
              ref={urlInputRef}
              className={`w-full border rounded-xl pl-4 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition ${
                inspectStatus === "ok"
                  ? "border-green-400 focus:ring-green-400"
                  : inspectStatus === "error"
                  ? "border-red-400 focus:ring-red-400"
                  : "border-slate-200 dark:border-slate-600 focus:ring-blue-500"
              }`}
            />
            {inspectStatus !== "idle" && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                {inspectStatus === "ok"
                  ? <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  : <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                }
              </div>
            )}
          </div>
          <button
            onClick={handleInspect}
            disabled={inspecting}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2"
          >
            {inspecting
              ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Inspecting…</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Inspect URL</>
            }
          </button>
        </div>

        {error && (
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
              <span className="flex-1">{error}</span>
              {/* Retry button — only shown when a format is selected */}
              {selectedFormat && !downloading && (
                <button
                  onClick={() => { setError(""); setAiError(null); handleDownload(); }}
                  className="shrink-0 ml-2 text-xs font-semibold bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-800/60 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-700 transition flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Retry
                  {retryCount > 0 && <span className="font-bold">({retryCount})</span>}
                </button>
              )}
            </div>
            {/* ── AI Error Explanation ── */}
            {aiError && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <span className="text-base shrink-0">🤖</span>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">{aiError.explanation}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">💡 {aiError.suggestion}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Video Meta Card ── */}
      {meta && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
          <div className="flex gap-4">
            {meta.thumbnail && (
              <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700">
                <Image src={meta.thumbnail} alt={meta.title} fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">{meta.title}</p>
                <span className="shrink-0 text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2 py-0.5 rounded-full">
                  {meta.platform}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{meta.uploader}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                {formatDuration(meta.duration) && <span>⏱ {formatDuration(meta.duration)}</span>}
                {formatViews(meta.view_count)   && <span>👁 {formatViews(meta.view_count)}</span>}
                {formatDate(meta.upload_date)   && <span>📅 {formatDate(meta.upload_date)}</span>}
              </div>
              <button
                onClick={handleFetchFormats}
                disabled={loadingFormats}
                className="mt-2 flex items-center gap-2 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                {loadingFormats
                  ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Loading formats…</>
                  : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg> Check Available Formats</>
                }
              </button>
            </div>
          </div>

          {/* ── AI Summary ── */}
          {aiSummary && (
            <div className="flex items-start gap-2.5 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl">
              <span className="text-base shrink-0">🤖</span>
              <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">{aiSummary}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 — Format Selector ── */}
      {formats.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select Format</span>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">{formats.length} available</span>
          </div>

          {/* ── AI Recommendation ── */}
          {aiRec && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-xl">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base shrink-0">🤖</span>
                <p className="text-xs text-violet-700 dark:text-violet-300">{aiRec.reason}</p>
              </div>
              <button
                onClick={() => setSelectedFormat(aiRec.format)}
                className="shrink-0 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg transition"
              >
                Use suggestion
              </button>
            </div>
          )}

          {/* Video formats */}
          {videoFormats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                📹 Video + Audio (MP4)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {videoFormats.map((f) => (
                  <button
                    key={f.format_id}
                    onClick={() => setSelectedFormat(f)}
                    className={`relative text-center px-2 py-3 rounded-xl border text-sm transition ${
                      selectedFormat?.format_id === f.format_id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-600"
                    }`}
                  >
                    {f.display_only && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-amber-400 text-white font-bold px-1 rounded-full leading-4">
                        REF
                      </span>
                    )}
                    <span className="block font-bold text-base">{f.resolution}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">{f.ext}</span>
                    {f.display_only && (
                      <span className="block text-[10px] text-amber-500 mt-0.5">→ 1080p</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audio formats */}
          {audioFormats.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                🎵 Audio Only — MP3
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {audioFormats.map((f) => (
                  <button
                    key={f.format_id}
                    onClick={() => setSelectedFormat(f)}
                    className={`text-center px-2 py-3 rounded-xl border text-sm transition ${
                      selectedFormat?.format_id === f.format_id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-600"
                    }`}
                  >
                    <span className="block font-bold">{f.abr ? `${Math.round(f.abr)}kbps` : "Audio"}</span>
                    <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5">MP3</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected + Download */}
          {selectedFormat && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 text-sm">
                <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span className="text-slate-600 dark:text-slate-300">
                  Selected: <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedFormat.resolution || `${Math.round(selectedFormat.abr || 0)}kbps`} {selectedFormat.ext.toUpperCase()}
                  </span>
                  {selectedFormat.display_only && <span className="ml-2 text-amber-500 text-xs">(will download as 1080p)</span>}
                </span>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                {downloading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Downloading…</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg> Download</>
                }
              </button>

              {downloading && (
                <div className="mt-4 p-4 rounded-xl border border-blue-100 dark:border-slate-700 bg-blue-50/30 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <span className="truncate flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {downloadStatusText}
                    </span>
                    {downloadPercent !== null && <span>{downloadPercent.toFixed(1)}%</span>}
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${downloadPercent !== null ? downloadPercent : 10}%` }}
                    />
                  </div>

                  {/* Speed + ETA */}
                  {(downloadSpeed || downloadEta) && (
                    <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      <span>⚡ Speed: {downloadSpeed || "calculating..."}</span>
                      <span>⏱️ Remaining: {downloadEta || "estimating..."}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Inline Media Preview ── */}
      {meta && url && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">▶️</span>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Inline Preview</p>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">Verify before downloading</span>
          </div>
          {/* For YouTube, embed the iframe. For others, show a direct link */}
          {url.includes("youtube.com") || url.includes("youtu.be") ? (() => {
            const vidId = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
            return vidId ? (
              <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "40%" }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${vidId}?start=0&end=30&autoplay=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Preview"
                />
              </div>
            ) : null;
          })() : (
            <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
              {meta.thumbnail && (
                <Image src={meta.thumbnail} alt="" width={64} height={40} className="rounded-lg object-cover shrink-0" unoptimized />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{meta.title}</p>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline">Open on {meta.platform} →</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Trim & Subtitles ── */}
      {formats.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-5">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Advanced Options</p>

          {/* Trim */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300">✂️ Trim / Cut Before Download</p>
              <button onClick={() => setShowTrim((v) => !v)}
                className={`text-xs font-semibold px-3 py-1 rounded-lg border transition ${showTrim ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400"}`}>
                {showTrim ? "Hide" : "Enable"}
              </button>
            </div>
            {showTrim && (
              <TrimSlider
                duration={meta?.duration ?? null}
                onChange={(s, e) => { setTrimStart(s); setTrimEnd(e); }}
                onClear={() => { setTrimStart(""); setTrimEnd(""); setShowTrim(false); }}
              />
            )}
            {(trimStart || trimEnd) && !showTrim && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ✂️ Trim active: {trimStart || "start"} → {trimEnd || "end"}
                <button onClick={() => { setTrimStart(""); setTrimEnd(""); }} className="ml-2 text-red-400 hover:text-red-600">✕</button>
              </p>
            )}
          </div>

          {/* Subtitles */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              💬 Subtitles & Captions
              {loadingSubs && <span className="ml-2 text-slate-400 text-[10px]">Loading tracks…</span>}
            </p>
            {subtitles.length > 0 ? (
              <div className="space-y-3">
                <div className="flex gap-3 flex-wrap">
                  <div className="flex-1 min-w-[140px] space-y-1">
                    <label className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                      Language
                      {subLang && (
                        <span className="text-[9px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-700">
                          Auto-detected
                        </span>
                      )}
                    </label>
                    <select value={subLang} onChange={(e) => setSubLang(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="">— No subtitles —</option>
                      {subtitles.map((s) => (
                        <option key={s.lang} value={s.lang}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  {subLang && (
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 dark:text-slate-500">Format</label>
                        <select value={subFormat} onChange={(e) => setSubFormat(e.target.value)}
                          className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                          <option value="srt">.srt</option>
                          <option value="vtt">.vtt</option>
                          <option value="ass">.ass</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input type="checkbox" checked={embedSubs} onChange={(e) => setEmbedSubs(e.target.checked)} className="h-3.5 w-3.5 rounded" />
                          Embed in video
                        </label>
                      </div>
                    </>
                  )}
                </div>
                {subLang && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ {embedSubs ? "Subtitles will be embedded in the video file" : `Subtitles will be saved as a separate .${subFormat} file`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {loadingSubs ? "Checking for subtitle tracks…" : formats.length > 0 ? "No subtitle tracks found for this video." : "Fetch formats first to check for subtitles."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Session Activity ── */}
      {sessionJobs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Session Activity</h2>
          <ul className="space-y-2">
            {sessionJobs.map((job, idx) => (
              <li key={idx} className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{job.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{job.resolution} · {job.timestamp}</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-2.5 py-1 rounded-full shrink-0">
                  {job.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Supported Sites ── */}
      <SupportedSites
        onSiteClick={(domain) => {
          setUrl(`https://www.${domain}/`);
          setError("");
          setInspectStatus("idle");
          setMeta(null);
          setFormats([]);
          setTimeout(() => urlInputRef.current?.focus(), 50);
        }}
      />

      {/* ── Download Location Modal ── */}
      {showLocationModal && (
        <DownloadLocationModal
          onConfirm={(dir) => {
            setShowLocationModal(false);
            runDownload(dir);
          }}
          onCancel={() => setShowLocationModal(false)}
        />
      )}
    </div>
  );
}

// useSearchParams requires a Suspense boundary in Next.js App Router
export default function DownloaderPage() {
  return (
    <Suspense fallback={null}>
      <DownloaderInner />
    </Suspense>
  );
}
