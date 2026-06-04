"use client";

import { useRef, useState } from "react";

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle>;
  }
}

interface Props {
  onConfirm: (dir: string) => void;
  onCancel: () => void;
}

export default function DownloadLocationModal({ onConfirm, onCancel }: Props) {
  const [path, setPath]         = useState("");
  const [picking, setPicking]   = useState(false);
  const [error, setError]       = useState("");
  const fallbackRef             = useRef<HTMLInputElement>(null);

  const handleBrowse = async () => {
    setError("");
    setPicking(true);
    try {
      if (typeof window.showDirectoryPicker === "function") {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        setPath(handle.name);
      } else {
        fallbackRef.current?.click();
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") {
        setError("Could not open folder picker. Type a path manually.");
      }
    } finally {
      setPicking(false);
    }
  };

  const handleFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPath(files[0].webkitRelativePath.split("/")[0]);
    }
  };

  const handleUseDefault = () => onConfirm("");

  const handleConfirm = () => {
    if (!path.trim()) {
      setError("Please pick a folder or use the default.");
      return;
    }
    // Save to settings so future downloads remember it
    try {
      const stored = localStorage.getItem("novaDvrSettings");
      const existing = stored ? JSON.parse(stored) : {};
      localStorage.setItem("novaDvrSettings", JSON.stringify({ ...existing, directory: path.trim() }));
    } catch {}
    onConfirm(path.trim());
  };

  return (
    <>
      {/* Hidden fallback input */}
      <input
        ref={fallbackRef}
        type="file"
        // @ts-expect-error non-standard
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFallback}
      />

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md mx-4 overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Set Download Location</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Where should Nova DVR save your files?
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {/* Browse option */}
            <div
              onClick={handleBrowse}
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 flex items-center justify-center shrink-0 transition">
                {picking
                  ? <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  : <svg className="w-4 h-4 text-slate-500 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition">
                  {picking ? "Opening folder picker…" : "Browse & Select Folder"}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {path ? `Selected: ${path}` : "Opens your system folder picker"}
                </p>
              </div>
              {path && (
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Manual path input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Or type a full path manually
              </label>
              <input
                type="text"
                placeholder="e.g. C:/Users/you/Downloads or /home/you/Videos"
                value={path}
                onChange={(e) => { setPath(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}

            {/* Default option */}
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Default location: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">~/Downloads/NovaDVR</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button
              onClick={handleUseDefault}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Use Default
            </button>
            <button
              onClick={handleConfirm}
              disabled={!path.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save & Download
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
