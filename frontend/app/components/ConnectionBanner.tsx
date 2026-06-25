"use client";

import { useBackendStatus } from "../hooks/useBackendStatus";

/**
 * ConnectionBanner — sticky top banner shown when backend is offline/warming.
 * Covers section 7.2 of task.md: "Connection error banner — sticky top banner with reconnect button."
 */
export default function ConnectionBanner() {
  const { status, recheck } = useBackendStatus();

  if (status === "online" || status === "checking") return null;

  const isWarming = status === "warming";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        "fixed top-14 md:top-0 left-0 right-0 z-[25] flex items-center justify-center gap-3 px-4 py-2.5 text-xs font-semibold",
        "animate-slide-down",
        isWarming
          ? "bg-amber-500 text-white"
          : "bg-red-600 text-white",
      ].join(" ")}
    >
      <div className="flex items-center gap-2">
        {isWarming ? (
          <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        )}
        <span>
          {isWarming
            ? "Backend is warming up — downloads will start in a moment."
            : "Backend is offline — some features may not work."}
        </span>
      </div>
      <button
        onClick={recheck}
        className="underline underline-offset-2 hover:opacity-80 transition whitespace-nowrap"
        aria-label="Retry backend connection"
      >
        Retry
      </button>
    </div>
  );
}
