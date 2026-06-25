"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// Convenience helpers
export function useToastHelpers() {
  const { toast } = useToast();
  return {
    success: (title: string, message?: string) =>
      toast({ type: "success", title, message, duration: 4000 }),
    error: (title: string, message?: string) =>
      toast({ type: "error", title, message, duration: 6000 }),
    warning: (title: string, message?: string) =>
      toast({ type: "warning", title, message, duration: 5000 }),
    info: (title: string, message?: string) =>
      toast({ type: "info", title, message, duration: 4000 }),
  };
}

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-green-500",
  error:   "border-l-red-500",
  warning: "border-l-amber-500",
  info:    "border-l-blue-500",
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 200);
  }, [onDismiss, t.id]);

  useEffect(() => {
    if (t.duration && t.duration > 0) {
      timerRef.current = setTimeout(dismiss, t.duration);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [t.duration, dismiss]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        "toast flex items-start gap-3 w-full max-w-sm",
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "border-l-4",
        borderColors[t.type],
        "rounded-xl px-4 py-3.5 shadow-lg",
        exiting ? "opacity-0 translate-x-4 transition-all duration-200" : "opacity-100 translate-x-0",
      ].join(" ")}
    >
      <div className="pt-0.5">{icons[t.type]}</div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.title}</p>
        {t.message && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{t.message}</p>
        )}
        {t.action && (
          <button
            onClick={() => { t.action!.onClick(); dismiss(); }}
            className="mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.action.label}
          </button>
        )}
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition p-0.5 rounded"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/** ToastContainer — renders toasts in a fixed portal position */
export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto animate-slide-right">
          <ToastItem toast={t} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  );
}

let idCounter = 0;

/** ToastProvider — wraps the app and provides toast context */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, "id">): string => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { ...opts, id }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
