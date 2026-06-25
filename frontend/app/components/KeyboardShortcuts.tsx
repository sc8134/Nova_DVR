"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "./ui/Modal";

const SHORTCUTS = [
  { keys: ["?"],          description: "Show keyboard shortcuts" },
  { keys: ["Esc"],        description: "Close modal / drawer" },
  { keys: ["G", "H"],     description: "Go to Home (Downloader)" },
  { keys: ["G", "B"],     description: "Go to Batch" },
  { keys: ["G", "S"],     description: "Go to SearchHub" },
  { keys: ["G", "P"],     description: "Go to Pricing" },
  { keys: ["G", "X"],     description: "Go to Settings" },
  { keys: ["G", "L"],     description: "Go to Blog" },
  { keys: ["Ctrl", "K"],  description: "Focus URL input" },
  { keys: ["Enter"],      description: "Inspect URL (when input is focused)" },
  { keys: ["D"],          description: "Download selected format" },
];

/**
 * KeyboardShortcuts — global shortcut handler + reference modal.
 * Press ? to see all shortcuts. Covers Phase 3 task.md item.
 */
export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = tag === "input" || tag === "textarea" || tag === "select";

      // ? — show shortcuts (not when typing)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }

      // Escape — close shortcuts
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }

      if (isInput) return;

      // Ctrl+K — focus URL input
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const urlInput = document.querySelector<HTMLInputElement>('input[type="url"]');
        if (urlInput) {
          urlInput.focus();
          urlInput.select();
        }
        return;
      }

      // G + letter — navigation shortcuts
      if (e.key.toLowerCase() === "g" && !gPressed) {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1500);
        return;
      }

      if (gPressed) {
        setGPressed(false);
        const routes: Record<string, string> = {
          h: "/", b: "/batch", s: "/searchhub",
          p: "/pricing", x: "/settings", l: "/blog",
        };
        const route = routes[e.key.toLowerCase()];
        if (route) {
          window.location.href = route;
        }
      }
    },
    [gPressed]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="Keyboard Shortcuts"
      size="md"
    >
      <div className="space-y-1 pb-2">
        {SHORTCUTS.map(({ keys, description }) => (
          <div
            key={description}
            className="flex items-center justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
          >
            <span className="text-sm text-slate-600 dark:text-slate-300">{description}</span>
            <div className="flex items-center gap-1 shrink-0">
              {keys.map((k, i) => (
                <span key={i} className="flex items-center gap-1">
                  <kbd className="px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm">
                    {k}
                  </kbd>
                  {i < keys.length - 1 && (
                    <span className="text-xs text-slate-400">then</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 pb-1">
        Press <kbd className="px-1.5 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded font-semibold">?</kbd> anytime to toggle this panel.
      </p>
    </Modal>
  );
}
