"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "../ThemeProvider";
import Toggle from "../components/ui/Toggle";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { useToastHelpers } from "../components/ui/Toast";

type NotifPermission = "default" | "granted" | "denied";
type SettingsTab = "general" | "appearance" | "notifications" | "about";

declare global {
  interface Window {
    showDirectoryPicker?: (opts?: { mode?: string }) => Promise<FileSystemDirectoryHandle>;
  }
}

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
      </svg>
    ),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    id: "about",
    label: "About",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");  const [directory, setDirectory] = useState("");
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [defaultFormat, setDefaultFormat] = useState("MP4 (Video)");
  const [notifications, setNotifications] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotifPermission>("default");
  const [browseError, setBrowseError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const toasts = useToastHelpers();

  useEffect(() => {
    const stored = localStorage.getItem("novaDvrSettings");
    if (stored) {
      try {
        const s = JSON.parse(stored);
        if (s.directory) setDirectory(s.directory);
        if (s.defaultFormat) setDefaultFormat(s.defaultFormat);
        if (s.notifications !== undefined) setNotifications(s.notifications);
      } catch { /* ignore */ }
    }
    if ("Notification" in window) {
      setNotifPermission(Notification.permission as NotifPermission);
    }
  }, []);

  const handleBrowse = async () => {
    setBrowseError("");
    if (typeof window.showDirectoryPicker === "function") {
      try {
        const handle = await window.showDirectoryPicker({ mode: "readwrite" });
        setDirHandle(handle);
        setDirectory(handle.name);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setBrowseError("Could not open folder picker. Try typing the path manually.");
        }
      }
    } else {
      inputRef.current?.click();
    }
  };

  const handleFallbackInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const parts = files[0].webkitRelativePath.split("/");
      setDirectory(parts[0]);
    }
  };

  const handleNotificationToggle = async (val: boolean) => {
    if (!val) { setNotifications(false); return; }
    if (!("Notification" in window)) { toasts.error("Not supported", "This browser does not support notifications."); return; }
    const permission = await Notification.requestPermission();
    setNotifPermission(permission as NotifPermission);
    if (permission === "granted") {
      setNotifications(true);
      new Notification("Nova DVR — Notifications enabled!", { body: "You'll be alerted when downloads complete.", icon: "/favicon.ico" });
      toasts.success("Notifications enabled");
    } else {
      setNotifications(false);
      toasts.warning("Permission denied", "Allow notifications in your browser settings.");
    }
  };

  const handleSave = () => {
    const stored = localStorage.getItem("novaDvrSettings");
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem("novaDvrSettings", JSON.stringify({ ...existing, directory, defaultFormat, theme, notifications }));
    toasts.success("Settings saved", "Your preferences have been updated.");
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in-up" suppressHydrationWarning>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <input ref={inputRef} type="file" webkitdirectory="" directory="" className="hidden" onChange={handleFallbackInput} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your Nova DVR preferences.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto" role="tablist" aria-label="Settings sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
            ].join(" ")}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div role="tabpanel">
        {activeTab === "general" && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <Card.Header>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Download</h2>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="space-y-5">
                  {/* Directory */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Download Directory</label>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Click Browse to pick a folder, or type a path. Leave blank to use <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs">~/Downloads/NovaDVR</code>.</p>
                    {directory && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 truncate">{directory}</p>
                          <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">{dirHandle ? "Selected via folder picker" : "Entered manually"}</p>
                        </div>
                        <button type="button" onClick={() => { setDirectory(""); setDirHandle(null); }} className="text-blue-400 hover:text-blue-600 transition" aria-label="Clear directory">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="e.g. C:/Users/you/Downloads" value={directory} onChange={(e) => { setDirectory(e.target.value); setDirHandle(null); }}
                        className="flex-1 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
                      <Button variant="secondary" onClick={handleBrowse} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>}>Browse</Button>
                    </div>
                    {browseError && <p className="text-xs text-red-500">{browseError}</p>}
                  </div>

                  {/* Default Format */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Default Format</label>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Pre-selected container format when fetching formats.</p>
                    <select value={defaultFormat} onChange={(e) => setDefaultFormat(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                      <option>MP4 (Video)</option>
                      <option>MP3 (Audio)</option>
                      <option>MKV (Video)</option>
                      <option>WEBM (Video)</option>
                    </select>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}>Save Settings</Button>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <Card.Header>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Theme</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500">Applied instantly. Your choice is persisted across sessions.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Light", "Dark", "System"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setTheme(t)}
                        aria-pressed={theme === t}
                        className={["flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border text-xs font-medium transition-all",
                          theme === t ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm" : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-600",
                        ].join(" ")}>
                        {t === "Light" ? (
                          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
                        ) : t === "Dark" ? (
                          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" /></svg>
                        )}
                        <span>{t}</span>
                        {theme === t && <Badge variant="primary" size="sm">Active</Badge>}
                      </button>
                    ))}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <Card.Header>
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Browser Notifications</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {notifPermission === "denied" && (
                    <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3" role="alert">
                      <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                      <div>
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400">Notifications blocked</p>
                        <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">Open browser settings → Site settings → Notifications and allow this site.</p>
                      </div>
                    </div>
                  )}
                  {notifPermission === "granted" && (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-2.5">
                      <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      <p className="text-xs font-medium text-green-700 dark:text-green-400">Browser notifications are permitted.</p>
                    </div>
                  )}
                  <Toggle checked={notifications} onChange={handleNotificationToggle} disabled={notifPermission === "denied"} label="Completion alerts" description={notifPermission === "denied" ? "Cannot enable — permission was blocked." : "Get a desktop notification when a download finishes."} />
                  {notifications && notifPermission === "granted" && (
                    <button type="button"
                      onClick={() => new Notification("Nova DVR — Test", { body: "Notifications are working correctly.", icon: "/favicon.ico" })}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                      Send a test notification →
                    </button>
                  )}
                </div>
              </Card.Body>
            </Card>
            <div className="flex justify-end">
              <Button onClick={handleSave} leftIcon={<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}>Save Settings</Button>
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div className="space-y-4 animate-fade-in">
            <Card>
              <Card.Body>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg">
                      <img src="/nova_logo.png" alt="Nova DVR" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Nova <span className="text-orange-400">DVR</span></p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Professional Media Downloader</p>
                      <Badge variant="primary" size="sm" className="mt-1">v3.0 · Phase 3</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {[
                      { label: "Built with", value: "Next.js 16 + React 19" },
                      { label: "Engine", value: "yt-dlp" },
                      { label: "Backend", value: "Railway (FastAPI)" },
                      { label: "Developer", value: "Sagar RC" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button variant="outline" size="sm" onClick={() => { try { localStorage.removeItem("novaDvrOnboardingSeen"); } catch { /* ignore */ } toasts.success("Onboarding reset", "Reload the page to view the tour again."); }}>
                      Reset onboarding tour
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { try { localStorage.clear(); } catch { /* ignore */ } toasts.success("App data cleared", "Reload the page to start fresh."); }}>
                      Clear app data
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
