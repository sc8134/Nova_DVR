"use client";

import { useState, useRef, useEffect } from "react";
import SupportedSites from "../components/SupportedSites";
import DownloadLocationModal from "../components/DownloadLocationModal";

interface BatchItem {
  id: number;
  url: string;
  format_id: string;
  resolution: string;
  is_audio: boolean;
  is_4k: boolean;
  status: "idle" | "fetching" | "ready" | "downloading" | "done" | "error";
  title: string;
  thumbnail: string | null;
  error: string;
  formats: FormatOption[];
  checked: boolean; // for playlist checkbox
  percent?: number | null;
  speed?: string;
  eta?: string;
}

interface FormatOption {
  format_id: string;
  ext: string;
  resolution: string | null;
  abr?: number;
  note: string | null;
  type: string;
  display_only?: boolean;
}

type GlobalPreset = "none" | "best-mp3" | "1080p" | "720p" | "480p" | "360p";

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

// Extract valid URLs from a blob of text (smart paste)
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s"'<>]+/g;
  const matches = text.match(urlRegex) || [];
  // deduplicate
  return [...new Set(matches.map((u) => u.replace(/[.,;:!?)]$/, "")))];
}

import { BACKEND } from "../lib/config";
import { safeJson } from "../lib/safeJson";
let nextId = 1;

function applyPresetToFormats(formats: FormatOption[], preset: GlobalPreset): { format_id: string; resolution: string; is_audio: boolean; is_4k: boolean } | null {
  if (preset === "none" || formats.length === 0) return null;
  if (preset === "best-mp3") {
    const audio = formats.filter((f) => f.type === "audio-only");
    if (audio.length > 0) {
      const best = audio.reduce((a, b) => ((a.abr || 0) > (b.abr || 0) ? a : b));
      return { format_id: best.format_id, resolution: best.note || "MP3", is_audio: true, is_4k: false };
    }
    return null;
  }
  const resMap: Record<string, string> = { "1080p": "1080p", "720p": "720p", "480p": "480p", "360p": "360p" };
  const target = resMap[preset];
  if (target) {
    const videos = formats.filter((f) => f.type === "video+audio");
    const match = videos.find((f) => f.resolution === target);
    const fallback = videos[0];
    const chosen = match || fallback;
    if (chosen) return { format_id: chosen.format_id, resolution: chosen.resolution || target, is_audio: false, is_4k: chosen.resolution === "4K" };
  }
  return null;
}

export default function BatchPage() {
  const [items, setItems]           = useState<BatchItem[]>([]);
  const [newUrl, setNewUrl]         = useState("");
  const [running, setRunning]       = useState(false);
  const [doneCount, setDoneCount]   = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [globalPreset, setGlobalPreset] = useState<GlobalPreset>("none");
  const [exploding, setExploding]   = useState(false);
  const [smartPasteMode, setSmartPasteMode] = useState(false);
  const [smartPasteText, setSmartPasteText] = useState("");
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Load URLs sent from SearchHub "Send to Batch" button
  useEffect(() => {
    const saved = sessionStorage.getItem("novaDvrBatchUrls");
    if (saved) {
      sessionStorage.removeItem("novaDvrBatchUrls");
      try {
        const urls: string[] = JSON.parse(saved);
        setItems(urls.map((url) => makeItem(url)));
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (id: number, patch: Partial<BatchItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const makeItem = (url: string): BatchItem => ({
    id: nextId++, url, format_id: "", resolution: "", is_audio: false, is_4k: false,
    status: "idle", title: url, thumbnail: null, error: "", formats: [], checked: true,
  });

  const addUrl = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, makeItem(trimmed)]);
    setNewUrl("");
  };

  // Smart paste — extract URLs from any blob of text
  const handleSmartPaste = () => {
    const urls = extractUrls(smartPasteText);
    if (urls.length === 0) return;
    setItems((prev) => [...prev, ...urls.map(makeItem)]);
    setSmartPasteText("");
    setSmartPasteMode(false);
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id));

  const fetchFormats = async (id: number, url: string) => {
    update(id, { status: "fetching", error: "" });
    try {
      const [insp, fmts] = await Promise.all([
        fetch(`${BACKEND}/inspect`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) }).then((r) => safeJson(r)) as Promise<{ title?: string; thumbnail?: string | null; error?: string }>,
        fetch(`${BACKEND}/list-formats`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) }).then((r) => safeJson(r)) as Promise<{ formats?: FormatOption[]; error?: string }>,
      ]);
      if (fmts.error) throw new Error(fmts.error);
      const allFormats: FormatOption[] = fmts.formats || [];
      // Apply global preset if set
      const presetPatch = applyPresetToFormats(allFormats, globalPreset);
      const first = allFormats[0];
      update(id, {
        status: "ready",
        title: insp.title || url,
        thumbnail: insp.thumbnail || null,
        formats: allFormats,
        format_id: presetPatch?.format_id || first?.format_id || "",
        resolution: presetPatch?.resolution || first?.resolution || first?.note || first?.ext || "",
        is_audio: presetPatch?.is_audio ?? (first?.type === "audio-only"),
        is_4k: presetPatch?.is_4k ?? (first?.resolution === "4K"),
      });
    } catch (e: unknown) {
      update(id, { status: "error", error: e instanceof Error ? e.message : "Failed" });
    }
  };

  // Playlist exploder
  const explodePlaylist = async () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    setExploding(true);
    try {
      const res = await fetch(`${BACKEND}/playlist-explode`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.is_playlist) {
        // Just a single video
        setItems((prev) => [...prev, makeItem(trimmed)]);
      } else {
        const newItems = (data.items as Array<{ url: string; title: string; thumbnail: string | null }>).map((item) => ({
          ...makeItem(item.url),
          title: item.title,
          thumbnail: item.thumbnail || null,
        }));
        setItems((prev) => [...prev, ...newItems]);
      }
      setNewUrl("");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to explode playlist");
    } finally {
      setExploding(false);
    }
  };

  // Apply global preset to all ready items
  const applyPresetToAll = (preset: GlobalPreset) => {
    setGlobalPreset(preset);
    setItems((prev) => prev.map((item) => {
      if (item.status !== "ready" || item.formats.length === 0) return item;
      const patch = applyPresetToFormats(item.formats, preset);
      if (!patch) return item;
      return { ...item, ...patch };
    }));
  };

  const startAll = async () => {
    const readyItems = items.filter((it) => it.status === "ready" && it.format_id && it.checked);
    if (!readyItems.length) return;
    const settings = getSettings();
    if (!settings.directory?.trim()) { setShowModal(true); return; }
    await runBatchDownload(settings.directory);
  };

  const runBatchDownload = async (downloadDir: string) => {
    const readyItems = items.filter((it) => it.status === "ready" && it.format_id && it.checked);
    if (!readyItems.length) return;
    setRunning(true);
    setDoneCount(0);
    setTotalCount(readyItems.length);

    // Mark all as queued
    readyItems.forEach((item) => update(item.id, { status: "downloading", percent: null, speed: "", eta: "" }));

    try {
      const res = await fetch(`${BACKEND}/parallel-batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobs: readyItems.map((item) => ({
            id: item.id,
            url: item.url,
            format_id: item.format_id,
            is_audio: item.is_audio,
            is_4k: item.is_4k,
            title: item.title,
          })),
          download_dir: downloadDir,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Batch failed to start");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body not readable");

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
          if (!cleanLine.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(cleanLine.substring(6));

            if (data.type === "done") {
              const clientId = data.client_id;
              update(clientId, { status: "done", percent: 100, speed: "", eta: "" });
              setDoneCount((c) => c + 1);
              const item = readyItems.find((it) => it.id === clientId);
              fireNotification("Nova DVR — Done", item?.title || "Download complete");
              if (data.filepath) {
                const a = document.createElement("a");
                a.href = `${BACKEND}/serve-file?path=${encodeURIComponent(data.filepath)}&temp=${data.is_temp ? "1" : "0"}`;
                a.download = data.filename || item?.title || "download";
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
              }
              const existing = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
              existing.unshift({
                url: item?.url || data.url,
                title: item?.title || data.url,
                format: item?.format_id || "",
                resolution: item?.resolution || "",
                status: "Done",
                timestamp: new Date().toLocaleString(),
              });
              localStorage.setItem("novaDvrJobs", JSON.stringify(existing));
            } else if (data.type === "error") {
              const clientId = data.client_id;
              update(clientId, { status: "error", error: data.error || "Failed" });
              setDoneCount((c) => c + 1);
            } else if (data.type === "complete") {
              fireNotification(
                "Nova DVR — Batch complete",
                `${data.done} done · ${data.errors} error${data.errors !== 1 ? "s" : ""}`
              );
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (e: unknown) {
      // Mark any still-downloading items as error
      setItems((prev) =>
        prev.map((it) =>
          it.status === "downloading"
            ? { ...it, status: "error", error: e instanceof Error ? e.message : "Batch failed" }
            : it
        )
      );
    }

    setRunning(false);
  };

  const readyCount  = items.filter((it) => it.status === "ready" && it.format_id && it.checked).length;
  const downloadingItems = items.filter((it) => it.status === "downloading");
  const progressPct = totalCount > 0
    ? Math.min(Math.round((doneCount / totalCount) * 100), 100)
    : 0;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Batch Downloader</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Add URLs, fetch formats, and download everything at once.
        </p>
      </div>

      {/* ── Master Progress Bar ── */}
      {running && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {doneCount} / {totalCount} done
              {downloadingItems.length > 0 && (
                <span className="ml-2 text-xs font-normal text-blue-500">
                  ⚡ {downloadingItems.length} downloading in parallel
                </span>
              )}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          {downloadingItems.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-0.5">
              {downloadingItems.map((it) => (
                <span key={it.id} className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded-full truncate max-w-[180px]">
                  {it.title.length > 22 ? it.title.slice(0, 22) + "…" : it.title}
                  {it.percent != null && ` ${it.percent.toFixed(0)}%`}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add URLs Card ── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Add URLs</label>
          <button
            onClick={() => setSmartPasteMode((v) => !v)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${smartPasteMode ? "bg-violet-600 text-white border-violet-600" : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-violet-400"}`}
          >
            🧠 Smart Paste
          </button>
        </div>

        {/* Smart Paste Mode */}
        {smartPasteMode ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Paste any text — email, chat log, webpage. Nova DVR will extract all valid video URLs automatically.
            </p>
            <textarea
              rows={5}
              placeholder="Paste any text containing video URLs here…"
              value={smartPasteText}
              onChange={(e) => setSmartPasteText(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleSmartPaste} disabled={!smartPasteText.trim()}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                Extract &amp; Add URLs
              </button>
              <button onClick={() => { setSmartPasteMode(false); setSmartPasteText(""); }}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl transition">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Add one URL, paste multiple lines, or use the Explode button for playlists.
            </p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=… or playlist URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                ref={urlInputRef}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  const urls = extractUrls(text);
                  if (urls.length > 1) {
                    e.preventDefault();
                    setItems((prev) => [...prev, ...urls.map(makeItem)]);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && addUrl()}
                className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button onClick={addUrl}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                Add
              </button>
              <button onClick={explodePlaylist} disabled={!newUrl.trim() || exploding}
                title="Expand playlist or channel to individual items"
                className="shrink-0 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
                {exploding
                  ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <span>💥</span>
                }
                Explode
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Queue ── */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Queue header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Queue — {items.length} URL{items.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => items.filter((it) => it.status === "idle").forEach((it) => fetchFormats(it.id, it.url))}
                  disabled={running || items.every((it) => it.status !== "idle")}
                  className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg transition disabled:opacity-40">
                  Fetch All Formats
                </button>
                <button onClick={startAll} disabled={running || readyCount === 0}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                  {running
                    ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg> Downloading…</>
                    : `⚡ Download (${readyCount})`
                  }
                </button>
              </div>
            </div>

            {/* Global Preset */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Apply to all:</span>
              {([
                { value: "none",     label: "— Custom" },
                { value: "best-mp3", label: "🎵 Best MP3" },
                { value: "1080p",    label: "📹 1080p MP4" },
                { value: "720p",     label: "📹 720p MP4" },
                { value: "480p",     label: "📹 480p MP4" },
                { value: "360p",     label: "📹 360p MP4" },
              ] as { value: GlobalPreset; label: string }[]).map(({ value, label }) => (
                <button key={value} onClick={() => applyPresetToAll(value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition ${
                    globalPreset === value
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-400"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-4 flex flex-wrap sm:flex-nowrap items-start gap-3">
                {/* Checkbox */}
                <input type="checkbox" checked={item.checked}
                  onChange={(e) => update(item.id, { checked: e.target.checked })}
                  className="mt-1 shrink-0 h-4 w-4 rounded" />

                {/* Thumbnail */}
                <div className="w-14 h-9 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
                  {item.thumbnail
                    ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653z"/></svg>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.title}</p>
                  {/* Per-item progress bar when downloading */}
                  {item.status === "downloading" && (
                    <div className="space-y-1.5 w-full">
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${item.percent !== null && item.percent !== undefined ? item.percent : 10}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        {item.percent !== null && item.percent !== undefined && (
                          <span>{item.percent.toFixed(1)}%</span>
                        )}
                        {(item.speed || item.eta) && (
                          <span>
                            {item.speed && `⚡ ${item.speed}`} {item.eta && ` ⏱️ ${item.eta}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  {item.status === "ready" && item.formats.length > 0 && (
                    <select value={item.format_id}
                      onChange={(e) => {
                        const f = item.formats.find((x) => x.format_id === e.target.value);
                        update(item.id, { format_id: e.target.value, resolution: f?.resolution || f?.note || f?.ext || "", is_audio: f?.type === "audio-only", is_4k: f?.resolution === "4K" });
                      }}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition">
                      {item.formats.map((f) => (
                        <option key={f.format_id} value={f.format_id}>
                          {f.type === "audio-only"
                            ? `🎵 ${f.abr ? Math.round(f.abr) + "kbps" : ""} MP3`
                            : `📹 ${f.resolution || f.ext.toUpperCase()} MP4${f.display_only ? " (→1080p)" : ""}`}
                        </option>
                      ))}
                    </select>
                  )}
                  {item.status === "error" && <p className="text-xs text-red-500">{item.error}</p>}
                </div>

                {/* Status + remove */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "idle" && <button onClick={() => fetchFormats(item.id, item.url)} className="text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg transition">Fetch</button>}
                  {item.status === "fetching" && <span className="text-xs text-slate-400 flex items-center gap-1"><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Fetching…</span>}
                  {item.status === "ready" && <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">Ready</span>}
                  {item.status === "downloading" && <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2 py-1 rounded-full flex items-center gap-1"><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>DL…</span>}
                  {item.status === "done" && <span className="text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">✓ Done</span>}
                  {item.status === "error" && <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-2 py-1 rounded-full">Error</span>}
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
          </div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No URLs yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Add URLs above, paste a playlist, or use Smart Paste for bulk text</p>
        </div>
      )}

      <SupportedSites onSiteClick={(domain) => { setNewUrl(`https://www.${domain}/`); setTimeout(() => urlInputRef.current?.focus(), 50); }} />

      {showModal && (
        <DownloadLocationModal
          onConfirm={(dir) => { setShowModal(false); runBatchDownload(dir); }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
