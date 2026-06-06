"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeProvider";

type NotifPermission = "default" | "granted" | "denied";

// Extend Window type for the File System Access API
declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle>;
  }
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [directory, setDirectory] = useState("");
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [defaultFormat, setDefaultFormat] = useState("MP4 (Video)");
  const [notifications, setNotifications] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotifPermission>("default");
  const [saved, setSaved] = useState(false);
  const [browseError, setBrowseError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved settings on mount
  useEffect(() => {
    const stored = localStorage.getItem("novaDvrSettings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.directory) setDirectory(s.directory);
        if (s.defaultFormat) setDefaultFormat(s.defaultFormat);
        if (s.notifications !== undefined) setNotifications(s.notifications);
      } catch {}
    }
    if ("Notification" in window) {
      setNotifPermission(Notification.permission as NotifPermission);
    }
  }, []);

  // Open the native OS folder picker using File System Access API
  const handleBrowse = async () => {
    setBrowseError("");
    if (typeof window.showDirectoryPicker === "function") {
      try {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        setDirHandle(handle);
        // The handle.name is just the folder name; we reconstruct a display path.
        // We store the name for display — the actual write path is managed via the handle.
        setDirectory(handle.name);
        setBrowseError("");
      } catch (err: unknown) {
        // User cancelled — that's fine, don't show an error
        if (err instanceof Error && err.name !== "AbortError") {
          setBrowseError("Could not open folder picker. Try typing the path manually.");
        }
      }
    } else {
      // Fallback: trigger a hidden <input type="file" webkitdirectory>
      inputRef.current?.click();
    }
  };

  // Fallback handler for browsers without showDirectoryPicker
  const handleFallbackInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Extract directory path from the first file's webkitRelativePath
      const parts = files[0].webkitRelativePath.split("/");
      const folderName = parts[0];
      setDirectory(folderName);
    }
  };

  // Notification toggle
  const handleNotificationToggle = async () => {
    if (notifications) { setNotifications(false); return; }
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission as NotifPermission);
    if (permission === "granted") {
      setNotifications(true);
      new Notification("Nova DVR — Notifications enabled!", {
        body: "You will be alerted when your downloads complete.",
        icon: "/favicon.ico",
      });
    } else {
      setNotifications(false);
    }
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const stored = localStorage.getItem("novaDvrSettings");
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem(
      "novaDvrSettings",
      JSON.stringify({ ...existing, directory, defaultFormat, theme, notifications })
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasDir = directory.trim().length > 0;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Hidden fallback file input */}
      <input
        ref={inputRef}
        type="file"
        /* @ts-expect-error – webkitdirectory is non-standard */
        webkitdirectory=""
        directory=""
        className="hidden"
        onChange={handleFallbackInput}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your Nova DVR preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Download Section ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Download</h2>
          </div>
          <div className="p-6 space-y-6">

            {/* ── Directory Picker ── */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Download Directory
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Click <span className="font-semibold text-slate-500 dark:text-slate-400">Browse</span> to
                open a folder picker, or type a path manually. Leave blank to use{" "}
                <span className="font-mono">~/Downloads/NovaDVR</span>.
              </p>

              {/* Selected folder display */}
              {hasDir && (
                <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                  <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 truncate">
                      {directory}
                    </p>
                    <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                      {dirHandle ? "Selected via folder picker" : "Entered manually"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDirectory(""); setDirHandle(null); }}
                    className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition shrink-0"
                    title="Clear"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Input row */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={hasDir ? directory : "e.g. C:/Users/you/Downloads"}
                    value={directory}
                    onChange={(e) => { setDirectory(e.target.value); setDirHandle(null); }}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Browse button */}
                <button
                  type="button"
                  onClick={handleBrowse}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-sm font-semibold rounded-xl transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                  Browse
                </button>
              </div>

              {browseError && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-1">{browseError}</p>
              )}
            </div>

            {/* Default Format */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Default Format
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Pre-selected container format.
              </p>
              <select
                value={defaultFormat}
                onChange={(e) => setDefaultFormat(e.target.value)}
                className="mt-1 w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option>MP4 (Video)</option>
                <option>MP3 (Audio)</option>
                <option>MKV (Video)</option>
                <option>WEBM (Video)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Appearance Section ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Appearance</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Theme</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Switch between light and dark mode. Applied instantly across the app.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(["Light", "Dark"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all ${
                      theme === t
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-600"
                    }`}
                  >
                    {t === "Light" ? (
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                      </svg>
                    )}
                    <span>{t} Mode</span>
                    {theme === t && (
                      <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
                Current: <span className="font-semibold text-slate-600 dark:text-slate-300">{theme} Mode</span> — changes apply immediately without saving.
              </p>
            </div>
          </div>
        </div>

        {/* ── Notifications Section ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Permission status banner */}
            {notifPermission === "denied" && (
              <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">Notifications blocked</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
                    Open your browser settings → Site settings → Notifications and allow this site.
                  </p>
                </div>
              </div>
            )}
            {notifPermission === "granted" && (
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-green-700 dark:text-green-400">Browser notifications are permitted.</p>
              </div>
            )}

            {/* Toggle row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Completion alerts</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {notifPermission === "denied"
                    ? "Cannot enable — permission was blocked in browser."
                    : "Get a desktop notification when a download finishes."}
                </p>
              </div>
              <button
                type="button"
                onClick={handleNotificationToggle}
                disabled={notifPermission === "denied"}
                aria-pressed={notifications}
                className="relative shrink-0 ml-6 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${notifications ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600"}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${notifications ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {notifications && notifPermission === "granted" && (
              <button
                type="button"
                onClick={() =>
                  new Notification("Nova DVR — Test notification", {
                    body: "Notifications are working correctly.",
                    icon: "/favicon.ico",
                  })
                }
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Send a test notification →
              </button>
            )}
          </div>
        </div>

        {/* ── Save Button ── */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Save Settings
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-2.5 rounded-xl text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Settings saved
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
