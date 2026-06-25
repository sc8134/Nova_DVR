"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ProgressBar from "./ui/ProgressBar";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "searching" | "inspecting" | "downloading" | "done" | "error";
  progress?: { percent: number | null; speed: string; eta: string };
  results?: Array<{
    id: string; title: string; url: string;
    thumbnail: string | null; uploader: string; platform: string;
  }>;
}

import { BACKEND } from "../lib/config";

const SUGGESTIONS = [
  "Download latest Diljit Dosanjh song",
  "Search lofi beats on SoundCloud",
  "Download https://youtu.be/dQw4w9WgXcQ",
  "Show my download history",
];

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hey! I'm Nova AI 👋\n\nI can search, inspect and download media for you — just tell me what you want.\n\nTry one of the suggestions below, or type your own.",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark unread when closed and bot sends a message
  useEffect(() => {
    if (!isOpen && messages[messages.length - 1]?.sender === "bot" && messages.length > 1) {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onstart  = () => setIsListening(true);
    rec.onerror  = () => setIsListening(false);
    rec.onend    = () => setIsListening(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInputValue(text);
      handleSend(text);
    };
    recognitionRef.current = rec;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSpeech = () => {
    if (isListening) recognitionRef.current?.stop();
    else { setInputValue(""); recognitionRef.current?.start(); }
  };

  const updateBotMessage = (index: number, patch: Partial<Message>) => {
    setMessages(prev => {
      const copy = [...prev];
      if (copy[index]) copy[index] = { ...copy[index], ...patch };
      return copy;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseIntent = (text: string): { action: "download" | "search"; query: string; platform: string } => {
    const clean = text.toLowerCase().trim();
    let platform = "youtube";
    if (clean.includes("soundcloud")) platform = "soundcloud";
    else if (clean.includes("bilibili")) platform = "bilibili";
    let querySubject = text.replace(/\b(on|from|in)\s+(youtube|soundcloud|bilibili)\b/gi, "").trim();
    let action: "download" | "search" = "search";
    const dlKw = ["download", "get", "extract", "save", "fetch", "grab"];
    const srKw = ["search", "find", "look up", "show", "query", "search for"];
    const dlMatch = dlKw.find(k => clean.startsWith(k));
    const srMatch = srKw.find(k => clean.startsWith(k));
    if (dlMatch) { action = "download"; querySubject = querySubject.replace(new RegExp(`^${dlMatch}\\s+`, "i"), "").trim(); }
    else if (srMatch) { action = "search"; querySubject = querySubject.replace(new RegExp(`^${srMatch}\\s+`, "i"), "").trim(); }
    else if (text.includes("http://") || text.includes("https://")) {
      action = "download";
      const m = text.match(/(https?:\/\/[^\s]+)/g);
      if (m) querySubject = m[0];
    }
    const fillers = [/^(the\s+)?latest\s+(track|song)\s+by\s+/i, /^(the\s+)?video\s+of\s+/i, /^(a\s+)?(song|video)\s+called\s+/i, /^for\s+/i];
    let query = querySubject;
    for (const f of fillers) query = query.replace(f, "").trim();
    return { action, query, platform };
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text || activeWorkflow) return;
    setInputValue("");
    setShowSuggestions(false);
    setMessages(prev => [...prev, { sender: "user", text, timestamp: new Date() }]);
    try {
      const res = await fetch(`${BACKEND}/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      if (!res.ok) throw new Error();
      const parsed = await res.json();
      if (parsed.intent === "search" || parsed.intent === "trending") await runSearchWorkflow(parsed.query || text, parsed.platform || "youtube");
      else if (parsed.intent === "download") await runDownloadWorkflow(parsed.url || parsed.query || text, parsed.platform || "youtube", parsed.format);
      else if (parsed.intent === "history") {
        const jobs = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]").slice(0, 5);
        const histText = jobs.length ? jobs.map((j: { title?: string; url: string; resolution?: string; format: string; timestamp: string }) => `• ${j.title || j.url} — ${j.resolution || j.format} (${j.timestamp})`).join("\n") : "No downloads yet.";
        setMessages(prev => [...prev, { sender: "bot", text: `📋 Your last ${jobs.length} download${jobs.length !== 1 ? "s" : ""}:\n\n${histText}`, timestamp: new Date(), status: "done" }]);
      } else await runSearchWorkflow(parsed.query || text, parsed.platform || "youtube");
    } catch {
      const { action, query, platform } = parseIntent(text);
      if (action === "search") await runSearchWorkflow(query, platform);
      else await runDownloadWorkflow(query, platform, null);
    }
  };

  const runSearchWorkflow = async (query: string, platform: string) => {
    setActiveWorkflow(true);
    let botMsgIdx = -1;
    setMessages(prev => { botMsgIdx = prev.length; return [...prev, { sender: "bot" as const, text: `🔍 Searching for "${query}" on ${platform}…`, status: "searching" as const, timestamp: new Date() }]; });
    await new Promise(r => setTimeout(r, 0));
    try {
      const res = await fetch(`${BACKEND}/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, platform, limit: 50 }) });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const results = data.results || [];
      if (results.length === 0) updateBotMessage(botMsgIdx, { text: `No results found for "${query}" on ${platform}.`, status: "error" });
      else updateBotMessage(botMsgIdx, { text: `Found ${results.length} results. Click Download on any track:`, status: "done", results });
    } catch (err: unknown) {
      updateBotMessage(botMsgIdx, { text: `Search failed: ${err instanceof Error ? err.message : "Server error"}`, status: "error" });
    } finally { setActiveWorkflow(false); }
  };

  const runDownloadWorkflow = async (query: string, platform: string, formatHint?: { is_audio?: boolean; resolution?: string } | null) => {
    setActiveWorkflow(true);
    let botMsgIdx = -1;
    setMessages(prev => { botMsgIdx = prev.length; return [...prev, { sender: "bot" as const, text: "🚀 Starting download sequence…", status: "searching" as const, timestamp: new Date() }]; });
    await new Promise(r => setTimeout(r, 0));
    try {
      let url = query;
      if (!url.startsWith("http")) {
        updateBotMessage(botMsgIdx, { text: `🔍 Finding "${query}" on ${platform}…` });
        const sRes = await fetch(`${BACKEND}/search`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, platform, limit: 1 }) });
        if (!sRes.ok) throw new Error("Search failed");
        const topResult = (await sRes.json()).results?.[0];
        if (!topResult) { updateBotMessage(botMsgIdx, { text: `Could not find "${query}".`, status: "error" }); setActiveWorkflow(false); return; }
        url = topResult.url;
        updateBotMessage(botMsgIdx, { text: `✅ Found: "${topResult.title}". Inspecting…` });
      } else {
        updateBotMessage(botMsgIdx, { text: "👀 Inspecting URL…" });
      }
      const meta = await (await fetch(`${BACKEND}/inspect`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })).json();
      updateBotMessage(botMsgIdx, { text: `📋 "${meta.title}" — fetching formats…`, status: "inspecting" });
      const formatsList = ((await (await fetch(`${BACKEND}/list-formats`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })).json()).formats) || [];
      const history = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
      const recData = await (await fetch(`${BACKEND}/ai/recommend`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ history, formats: formatsList }) })).json();
      let recFormat = recData.recommendation;
      if (!recFormat) throw new Error("No formats available");
      if (formatHint?.is_audio) { const a = formatsList.find((f: { type: string }) => f.type === "audio-only"); if (a) recFormat = a; }
      else if (formatHint?.resolution) { const r = formatsList.find((f: { resolution: string; type: string }) => f.resolution === formatHint.resolution && f.type === "video+audio"); if (r) recFormat = r; }
      const resLabel = recFormat.resolution || recFormat.note || recFormat.ext;
      updateBotMessage(botMsgIdx, { text: `⬇️ Downloading "${meta.title}" in ${resLabel}…`, status: "downloading", progress: { percent: 0, speed: "", eta: "" } });
      const settings = JSON.parse(localStorage.getItem("novaDvrSettings") || "{}");
      const dlRes = await fetch(`${BACKEND}/download`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, format_id: recFormat.format_id, is_audio: recFormat.type === "audio-only", is_4k: recFormat.resolution === "4K", download_dir: settings.directory || "" }) });
      if (!dlRes.ok) throw new Error((await dlRes.json().catch(() => ({}))).error || "Download failed");
      const reader = dlRes.body?.getReader();
      if (!reader) throw new Error("Stream unavailable");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          const cl = line.trim();
          if (!cl.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(cl.substring(6));
            if (d.status === "downloading") { const pct = parseFloat(d.percent); updateBotMessage(botMsgIdx, { text: `⬇️ Downloading "${meta.title}"…`, progress: { percent: isNaN(pct) ? 0 : pct, speed: d.speed || "", eta: d.eta || "" } }); }
            else if (d.status === "processing") updateBotMessage(botMsgIdx, { text: "⚙️ Post-processing…", progress: { percent: 100, speed: "", eta: "" } });
            else if (d.status === "done") {
              updateBotMessage(botMsgIdx, { text: `✅ Done! "${meta.title}" saved to your downloads folder.`, status: "done", progress: undefined });
              if (d.filepath) { const a = document.createElement("a"); a.href = `${BACKEND}/serve-file?path=${encodeURIComponent(d.filepath)}&temp=${d.is_temp ? "1" : "0"}`; a.download = d.filename || "download"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
              const existing = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
              existing.unshift({ url, title: meta.title, format: recFormat.format_id, resolution: resLabel, status: "Done", timestamp: new Date().toLocaleString() });
              localStorage.setItem("novaDvrJobs", JSON.stringify(existing));
              if (settings.notifications && "Notification" in window && Notification.permission === "granted") new Notification("Nova DVR — Done", { body: meta.title, icon: "/favicon.ico" });
            } else if (d.status === "error") throw new Error(d.error || "Stream error");
          } catch (parseErr) { if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") throw parseErr; }
        }
      }
    } catch (err: unknown) {
      updateBotMessage(botMsgIdx, { text: `❌ ${err instanceof Error ? err.message : "Download failed"}`, status: "error", progress: undefined });
    } finally { setActiveWorkflow(false); }
  };

  // ── Status icon ──────────────────────────────────────────────────────────
  const StatusIcon = ({ status }: { status?: Message["status"] }) => {
    if (status === "searching" || status === "inspecting" || status === "downloading")
      return <svg className="w-3 h-3 animate-spin text-blue-400 inline mr-1" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>;
    if (status === "done") return <span className="text-green-400 mr-1">✓</span>;
    if (status === "error") return <span className="text-red-400 mr-1">✕</span>;
    return null;
  };

  return (
    <>
      {/* ── FAB Button ── */}
      {/* bottom-24 on mobile keeps it above browser nav chrome; md:bottom-8 on desktop */}
      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 flex flex-col items-end gap-2">

        {/* Persistent label pill — visible when closed */}
        {!isOpen && (
          <div className="animate-fade-in flex items-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-xl border border-white/15 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span>Nova AI</span>
            <span className="opacity-50">·</span>
            <span className="text-blue-300">NLP Powered</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(v => !v)}
          aria-label="Open Nova AI Assistant"
          aria-expanded={isOpen}
          className={[
            "relative flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl",
            "bg-gradient-to-br from-blue-500 via-violet-600 to-purple-700",
            "hover:scale-105 active:scale-95 transition-all duration-200",
            "ring-2 ring-white/20 hover:ring-white/40",
            "shadow-violet-500/40",
          ].join(" ")}
        >
          {/* Glow pulse ring — only when closed */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-2xl bg-violet-500/30 animate-ping opacity-40 pointer-events-none" />
          )}

          <div className="relative w-10 h-10 rounded-xl overflow-hidden">
            <Image src="/chatbot logo.png" alt="Nova AI" fill className="object-cover" priority />
          </div>

          {/* Unread badge */}
          {hasUnread && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-md border-2 border-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm modal-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Drawer ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nova AI Assistant"
        className={[
          /* full screen on mobile, side panel on sm+ */
          "fixed z-50 flex flex-col",
          "inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-screen sm:w-[420px]",
          "bg-white dark:bg-slate-900",
          "border-l border-slate-200 dark:border-slate-800",
          "shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {/* ── Drawer Header ── */}
        <div className="relative shrink-0 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/20">
                <Image src="/chatbot logo.png" alt="Nova AI" fill className="object-cover" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Nova AI Assistant</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
                  <span className="text-[10px] text-green-400 font-semibold">Online · Ready to help</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Clear chat */}
              <button
                onClick={() => { setMessages([{ sender: "bot", text: "Chat cleared. What can I help you with?", timestamp: new Date(), status: "done" }]); setShowSuggestions(true); }}
                className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10" aria-label="Close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Capabilities strip */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5 scrollbar-none">
            {[
              { icon: "🤖", label: "NLP Driven", highlight: true },
              { icon: "🔍", label: "Search" },
              { icon: "⬇️", label: "Download" },
              { icon: "🎵", label: "MP3" },
              { icon: "🎤", label: "Voice" },
              { icon: "📋", label: "History" },
            ].map(c => (
              <span key={c.label} className={[
                "shrink-0 flex items-center gap-1 border text-[10px] font-semibold px-2.5 py-1 rounded-full",
                c.highlight
                  ? "bg-violet-500/30 border-violet-400/50 text-violet-200"
                  : "bg-white/10 border-white/15 text-white/80",
              ].join(" ")}>
                <span>{c.icon}</span>{c.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg, i) => (
            <div key={i} className={["flex gap-2.5", msg.sender === "user" ? "justify-end" : "justify-start"].join(" ")}>
              {/* Bot avatar */}
              {msg.sender === "bot" && (
                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 ring-1 ring-slate-200 dark:ring-slate-700">
                  <Image src="/chatbot logo.png" alt="Bot" width={28} height={28} className="object-cover" />
                </div>
              )}

              <div className={[
                "max-w-[82%] rounded-2xl text-xs shadow-sm",
                msg.sender === "user"
                  ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-br-sm px-4 py-3"
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-slate-700 px-4 py-3",
              ].join(" ")}>
                {/* Status indicator in bot messages */}
                {msg.sender === "bot" && msg.status && msg.status !== "done" && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-blue-500 dark:text-blue-400 mb-2">
                    <StatusIcon status={msg.status} />
                    <span className="capitalize">{msg.status}…</span>
                  </div>
                )}

                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                {/* Progress bar */}
                {msg.progress && (
                  <div className="mt-3 space-y-1.5 min-w-[200px]">
                    <ProgressBar value={msg.progress.percent ?? 10} size="xs" color="primary" />
                    <div className="flex justify-between text-[9px] text-slate-400 dark:text-slate-500">
                      {msg.progress.percent !== null && <span>{msg.progress.percent.toFixed(1)}%</span>}
                      {(msg.progress.speed || msg.progress.eta) && (
                        <span>{msg.progress.speed && `⚡ ${msg.progress.speed}`} {msg.progress.eta && `⏱️ ${msg.progress.eta}`}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Search results */}
                {msg.results && msg.results.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {msg.results.length} result{msg.results.length !== 1 ? "s" : ""} found
                      </p>
                      <span className="text-[9px] text-violet-500 dark:text-violet-400 font-semibold bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-800">
                        🤖 NLP
                      </span>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                      {msg.results.map((r, idx) => (
                        <div key={`${r.id}-${idx}`}
                          className="flex gap-3 items-center p-3 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition group shadow-sm hover:shadow-md">
                          {/* Thumbnail */}
                          <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                            {r.thumbnail
                              ? <img src={r.thumbnail} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                            }
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 line-clamp-1 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                              {r.title}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-0.5 truncate">{r.uploader}</p>
                            <span className="text-[8px] font-semibold uppercase bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              {r.platform}
                            </span>
                          </div>
                          {/* Download CTA */}
                          <button
                            onClick={() => runDownloadWorkflow(r.url, r.platform, null)}
                            disabled={activeWorkflow}
                            className="shrink-0 flex flex-col items-center gap-0.5 bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 text-white px-3 py-2 rounded-xl transition shadow-sm hover:shadow-md active:scale-95"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                            </svg>
                            <span className="text-[8px] font-bold">DL</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className="block text-[9px] mt-2 opacity-50 text-right">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {activeWorkflow && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                <Image src="/chatbot logo.png" alt="Bot" width={28} height={28} className="object-cover" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggestions ── */}
        {showSuggestions && !activeWorkflow && (
          <div className="shrink-0 px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Try asking</p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSend(s)}
                  className="text-[10px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 px-2.5 py-1.5 rounded-full transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div className="shrink-0 px-3 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <div className={["flex-1 flex items-center gap-2 border rounded-xl px-3 py-2 transition-all", isListening ? "border-red-400 bg-red-50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400"].join(" ")}>
            {isListening && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden="true" />}
            <input
              ref={inputRef}
              type="text"
              placeholder={isListening ? "Listening…" : "Ask Nova AI anything…"}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !activeWorkflow && handleSend()}
              disabled={activeWorkflow || isListening}
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
              aria-label="Message Nova AI"
            />
          </div>

          {recognitionRef.current && (
            <button onClick={toggleSpeech} disabled={activeWorkflow}
              className={["w-9 h-9 rounded-xl flex items-center justify-center transition border text-sm disabled:opacity-40", isListening ? "bg-red-500 border-red-500 text-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300"].join(" ")}
              aria-label={isListening ? "Stop listening" : "Voice input"} title={isListening ? "Stop" : "Voice"}>
              🎤
            </button>
          )}

          <button onClick={() => handleSend()} disabled={activeWorkflow || !inputValue.trim()}
            className="w-9 h-9 bg-gradient-to-br from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition shadow-sm"
            aria-label="Send message">
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
