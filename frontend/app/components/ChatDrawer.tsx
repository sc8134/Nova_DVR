"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Message {
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  status?: "searching" | "inspecting" | "downloading" | "done" | "error";
  progress?: {
    percent: number | null;
    speed: string;
    eta: string;
  };
  results?: Array<{
    id: string;
    title: string;
    url: string;
    thumbnail: string | null;
    uploader: string;
    platform: string;
  }>;
}

import { BACKEND } from "../lib/config";

export default function ChatDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am your Nova AI Assistant. You can type or say commands like:\n\n• \"Search for lofi beats on SoundCloud\"\n• \"Download the latest Diljit Dosanjh track from YouTube\"\n• \"Download https://www.youtube.com/watch?v=dQw4w9WgXcQ\"",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputValue(text);
        handleSend(text);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleSpeech = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInputValue("");
      recognitionRef.current?.start();
    }
  };

  const parseIntent = (text: string) => {
    const clean = text.toLowerCase().trim();
    
    // Detect platform
    let platform = "youtube";
    if (clean.includes("soundcloud")) {
      platform = "soundcloud";
    } else if (clean.includes("bilibili")) {
      platform = "bilibili";
    }

    let querySubject = text;
    const platformRegex = /\b(on|from|in)\s+(youtube|soundcloud|bilibili)\b/gi;
    querySubject = querySubject.replace(platformRegex, "").trim();

    // Detect action
    let action: "download" | "search" = "search";
    
    const downloadKeywords = ["download", "get", "extract", "save", "fetch", "grab"];
    const searchKeywords = ["search", "find", "look up", "show", "query", "search for"];

    const downloadMatch = downloadKeywords.find(k => clean.startsWith(k));
    const searchMatch = searchKeywords.find(k => clean.startsWith(k));

    if (downloadMatch) {
      action = "download";
      const regex = new RegExp(`^${downloadMatch}\\s+`, "i");
      querySubject = querySubject.replace(regex, "").trim();
    } else if (searchMatch) {
      action = "search";
      const regex = new RegExp(`^${searchMatch}\\s+`, "i");
      querySubject = querySubject.replace(regex, "").trim();
    } else {
      // If it contains a URL
      if (text.includes("http://") || text.includes("https://")) {
        action = "download";
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlMatch = text.match(urlRegex);
        if (urlMatch) querySubject = urlMatch[0];
      }
    }

    let query = querySubject;
    const fillers = [
      /^(the\s+)?latest\s+track\s+by\s+/i,
      /^(the\s+)?latest\s+song\s+by\s+/i,
      /^(the\s+)?video\s+of\s+/i,
      /^(a\s+)?song\s+called\s+/i,
      /^(a\s+)?video\s+called\s+/i,
      /^for\s+/i,
    ];
    for (const filler of fillers) {
      query = query.replace(filler, "").trim();
    }

    return { action, query, platform };
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || inputValue).trim();
    if (!text) return;

    setInputValue("");
    setMessages(prev => [...prev, { sender: "user", text, timestamp: new Date() }]);

    // ── Use backend /chat for NLP intent parsing ──
    try {
      const res = await fetch(`${BACKEND}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("Chat endpoint unreachable");
      const parsed = await res.json();

      if (parsed.intent === "search" || parsed.intent === "trending") {
        await runSearchWorkflow(parsed.query || text, parsed.platform || "youtube");
      } else if (parsed.intent === "download") {
        await runDownloadWorkflow(parsed.url || parsed.query || text, parsed.platform || "youtube", parsed.format);
      } else if (parsed.intent === "history") {
        const jobs = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]").slice(0, 5);
        const histText = jobs.length
          ? jobs.map((j: any) => `• ${j.title || j.url} — ${j.resolution || j.format} (${j.timestamp})`).join("\n")
          : "No downloads yet.";
        setMessages(prev => [...prev, {
          sender: "bot",
          text: `📋 Your last ${jobs.length} download${jobs.length !== 1 ? "s" : ""}:\n\n${histText}`,
          timestamp: new Date(),
          status: "done",
        }]);
      } else {
        // Fallback: try to search with the raw text
        await runSearchWorkflow(parsed.query || text, parsed.platform || "youtube");
      }
    } catch {
      // If /chat endpoint fails (e.g. backend down), fall back to client-side parsing
      const { action, query, platform } = parseIntent(text);
      if (action === "search") {
        await runSearchWorkflow(query, platform);
      } else {
        await runDownloadWorkflow(query, platform, null);
      }
    }
  };

  const runSearchWorkflow = async (query: string, platform: string) => {
    setActiveWorkflow(true);

    // Capture the real index by appending the bot message and reading back the new length
    let botMsgIdx = -1;
    setMessages(prev => {
      botMsgIdx = prev.length; // index of the message we're about to push
      return [...prev, {
        sender: "bot" as const,
        text: `🔍 Searching for "${query}" on ${platform}...`,
        status: "searching" as const,
        timestamp: new Date(),
      }];
    });

    // Small tick to let state settle so botMsgIdx is captured
    await new Promise(r => setTimeout(r, 0));

    try {
      const res = await fetch(`${BACKEND}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, platform, limit: 50 }),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const results = data.results || [];

      if (results.length === 0) {
        updateBotMessage(botMsgIdx, {
          text: `❌ No results found on ${platform} for "${query}".`,
          status: "error",
        });
      } else {
        updateBotMessage(botMsgIdx, {
          text: `✨ Found these results on ${platform}. Click "Download" to fetch the file:`,
          status: "done",
          results,
        });
      }
    } catch (err: any) {
      updateBotMessage(botMsgIdx, {
        text: `❌ Search error: ${err.message || "Failed to query server."}`,
        status: "error",
      });
    } finally {
      setActiveWorkflow(false);
    }
  };

  const runDownloadWorkflow = async (query: string, platform: string, formatHint?: { is_audio?: boolean; resolution?: string; label?: string } | null) => {
    setActiveWorkflow(true);

    // Capture real index the same way
    let botMsgIdx = -1;
    setMessages(prev => {
      botMsgIdx = prev.length;
      return [...prev, {
        sender: "bot" as const,
        text: `🚀 Initializing download sequence...`,
        status: "searching" as const,
        timestamp: new Date(),
      }];
    });

    await new Promise(r => setTimeout(r, 0));

    try {
      let url = query;

      // 1. If not direct URL, perform a search first
      if (!url.startsWith("http")) {
        updateBotMessage(botMsgIdx, { text: `🔍 Searching for "${query}" on ${platform} to download...` });
        const sRes = await fetch(`${BACKEND}/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, platform, limit: 1 }),
        });
        if (!sRes.ok) throw new Error("Search query failed");
        const sData = await sRes.json();
        const topResult = sData.results?.[0];
        if (!topResult) {
          updateBotMessage(botMsgIdx, { text: `❌ Could not find search matches for "${query}".`, status: "error" });
          setActiveWorkflow(false);
          return;
        }
        url = topResult.url;
        updateBotMessage(botMsgIdx, { text: `👀 Found: "${topResult.title}". Inspecting media...` });
      } else {
        updateBotMessage(botMsgIdx, { text: `👀 Inspecting target URL...` });
      }

      // 2. Call Inspect
      const inspectRes = await fetch(`${BACKEND}/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!inspectRes.ok) throw new Error("URL inspection failed");
      const meta = await inspectRes.json();

      updateBotMessage(botMsgIdx, { text: `📋 Found: "${meta.title}". Loading format rules...`, status: "inspecting" });

      // 3. Fetch Formats
      const formatsRes = await fetch(`${BACKEND}/list-formats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!formatsRes.ok) throw new Error("Formats retrieval failed");
      const formatsData = await formatsRes.json();
      const formatsList = formatsData.formats || [];

      // 4. Recommendation heuristic
      updateBotMessage(botMsgIdx, { text: `🤖 Recommending best quality format...` });
      const history = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
      const recRes = await fetch(`${BACKEND}/ai/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, formats: formatsList }),
      });
      if (!recRes.ok) throw new Error("Format recommendation failed");
      const recData = await recRes.json();
      let recFormat = recData.recommendation;
      if (!recFormat) throw new Error("No available formats to download");

      // If the user specified a format preference (e.g. "as MP3" or "in 720p"), override the AI pick
      if (formatHint) {
        if (formatHint.is_audio) {
          const audioMatch = formatsList.find((f: any) => f.type === "audio-only");
          if (audioMatch) recFormat = audioMatch;
        } else if (formatHint.resolution) {
          const resMatch = formatsList.find((f: any) => f.resolution === formatHint.resolution && f.type === "video+audio");
          if (resMatch) recFormat = resMatch;
        }
      }

      const resLabel = recFormat.resolution || recFormat.note || recFormat.ext;
      updateBotMessage(botMsgIdx, {
        text: `🤖 Selected format: ${resLabel.toUpperCase()}. Starting download stream...`,
        status: "downloading",
        progress: { percent: 0, speed: "", eta: "" },
      });

      // 5. Download SSE Stream
      const settings = JSON.parse(localStorage.getItem("novaDvrSettings") || "{}");
      const downloadDir = settings.directory || "";

      const body = {
        url,
        format_id: recFormat.format_id,
        is_audio: recFormat.type === "audio-only",
        is_4k: recFormat.resolution === "4K",
        download_dir: downloadDir,
      };

      const dlRes = await fetch(`${BACKEND}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!dlRes.ok) {
        const errData = await dlRes.json().catch(() => ({}));
        throw new Error(errData.error || "Download failed to start");
      }

      const reader = dlRes.body?.getReader();
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
            const data = JSON.parse(cleanLine.substring(6));
            if (data.status === "downloading") {
              const pct = parseFloat(data.percent);
              updateBotMessage(botMsgIdx, {
                text: `💾 Downloading "${meta.title}"...`,
                progress: {
                  percent: isNaN(pct) ? 0 : pct,
                  speed: data.speed || "",
                  eta: data.eta || "",
                },
              });
            } else if (data.status === "processing") {
              updateBotMessage(botMsgIdx, {
                text: `⚙️ Post-processing downloaded media files...`,
                progress: { percent: 100, speed: "", eta: "post-processing..." },
              });
            } else if (data.status === "done") {
              updateBotMessage(botMsgIdx, {
                text: `✅ Download successful!\n\n"${meta.title}" has been saved to your downloads folder.`,
                status: "done",
                progress: undefined,
              });

              if (data.filepath) {
                const isTemp = data.is_temp ? "1" : "0";
                const a = document.createElement("a");
                a.href = `${BACKEND}/serve-file?path=${encodeURIComponent(data.filepath)}&temp=${isTemp}`;
                a.download = data.filename || "download";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }

              // Save to history
              const job = {
                url,
                title: meta.title,
                format: recFormat.format_id,
                resolution: resLabel,
                status: "Done",
                timestamp: new Date().toLocaleString(),
              };
              const existing = JSON.parse(localStorage.getItem("novaDvrJobs") || "[]");
              existing.unshift(job);
              localStorage.setItem("novaDvrJobs", JSON.stringify(existing));
              if (settings.notifications && "Notification" in window && Notification.permission === "granted") {
                new Notification("Nova DVR — Done", { body: meta.title, icon: "/favicon.ico" });
              }
            } else if (data.status === "error") {
              throw new Error(data.error || "Download error occurred");
            }
          }
        }
      }
    } catch (err: any) {
      updateBotMessage(botMsgIdx, {
        text: `❌ Download sequence failed: ${err.message || "Failed to execute."}`,
        status: "error",
        progress: undefined,
      });
    } finally {
      setActiveWorkflow(false);
    }
  };

  const updateBotMessage = (index: number, patch: Partial<Message>) => {
    setMessages(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...patch };
      }
      return copy;
    });
  };

  return (
    <>
      {/* Floating Widget Bubble */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-full shadow-lg shadow-violet-500/20 transition-all hover:scale-110 active:scale-95"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Slide-out Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white">Nova AI Assistant</h2>
              <span className="text-[10px] text-green-500 flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" /> Online
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-2 shadow-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/50 dark:border-slate-700"
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Progress bar inside chat bubble */}
                {msg.progress && (
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700 w-full min-w-[200px]">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${msg.progress.percent !== null ? msg.progress.percent : 10}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
                      {msg.progress.percent !== null && <span>{msg.progress.percent.toFixed(1)}%</span>}
                      {(msg.progress.speed || msg.progress.eta) && (
                        <span>
                          {msg.progress.speed && `⚡ ${msg.progress.speed}`} {msg.progress.eta && `⏱️ ${msg.progress.eta}`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Inline Search Results inside chat bubble */}
                {msg.results && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-750">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{msg.results.length} result{msg.results.length !== 1 ? "s" : ""}</p>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {msg.results.map((r, idx) => (
                      <div key={`${r.id}-${idx}`} className="flex gap-2.5 items-start p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        {r.thumbnail && (
                          <div className="w-14 h-9 relative rounded overflow-hidden shrink-0 bg-slate-50">
                            <img src={r.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">{r.title}</p>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{r.uploader}</p>
                        </div>
                        <button
                          onClick={() => {
                            setIsOpen(true);
                            runDownloadWorkflow(r.url, r.platform, null);
                          }}
                          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold px-2 py-1 rounded transition"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                    </div>
                  </div>
                )}

                <span className={`block text-[9px] pt-1 text-slate-400 dark:text-slate-500 text-right`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer Panel */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex gap-2">
          <input
            type="text"
            placeholder={isListening ? "Listening..." : "Type instruction..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !activeWorkflow && handleSend()}
            disabled={activeWorkflow || isListening}
            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          {recognitionRef.current && (
            <button
              onClick={toggleSpeech}
              disabled={activeWorkflow}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition border ${
                isListening
                  ? "bg-red-500 border-red-500 text-white animate-pulse"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              title="Speak instruction"
            >
              🎤
            </button>
          )}
          <button
            onClick={() => handleSend()}
            disabled={activeWorkflow || !inputValue.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition shadow-sm"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
