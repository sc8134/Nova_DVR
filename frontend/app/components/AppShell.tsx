"use client";

/**
 * AppShell — client component mounted once in the root layout.
 * Activates background hooks that need to run app-wide:
 *  - Saved searches monitor (every 5 min)
 * No visible UI — purely a hook host.
 */

import { useSavedSearchesMonitor } from "../hooks/useSavedSearchesMonitor";

export default function AppShell() {
  useSavedSearchesMonitor();
  return null;
}
