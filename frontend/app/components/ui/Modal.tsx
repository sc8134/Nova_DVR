"use client";

import {
  useEffect,
  useRef,
  ReactNode,
  HTMLAttributes,
  KeyboardEvent,
} from "react";
import Button, { ButtonVariant } from "./Button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
  /** Footer buttons config (optional — you can render your own inside children too) */
  primaryAction?: { label: string; variant?: ButtonVariant; onClick: () => void; loading?: boolean; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void };
  /** Prevent closing on backdrop click */
  persistent?: boolean;
  className?: string;
}

const sizeClasses = {
  sm:   "max-w-sm",
  md:   "max-w-md",
  lg:   "max-w-lg",
  xl:   "max-w-2xl",
  full: "max-w-none w-full h-full rounded-none",
};

/**
 * Modal — accessible dialog with focus trap, keyboard, and backdrop support.
 * Follows WCAG 2.1 AA modal best practices.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  children,
  primaryAction,
  secondaryAction,
  persistent = false,
  className = "",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // ── Focus trap ──────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    // Focus first focusable element
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable && focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 10);
    }

    return () => {
      // Restore focus on close
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  // ── Body scroll lock ────────────────────────────────────────
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // ── Keyboard handling ───────────────────────────────────────
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && !persistent) {
      onClose();
      return;
    }

    // Focus trap: Tab cycling
    if (e.key === "Tab") {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  const showFooter = !!(primaryAction || secondaryAction);

  return (
    <div
      className="fixed inset-0 z-[40] flex items-center justify-center px-4 modal-backdrop bg-black/60"
      onClick={!persistent ? onClose : undefined}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-desc" : undefined}
    >
      <div
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={[
          "modal-content relative w-full bg-white dark:bg-slate-800",
          "border border-slate-200 dark:border-slate-700",
          "rounded-2xl shadow-2xl overflow-hidden",
          sizeClasses[size],
          className,
        ].join(" ")}
      >
        {/* Header */}
        {(title || !persistent) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-base font-bold text-slate-900 dark:text-white"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-desc"
                  className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed"
                >
                  {description}
                </p>
              )}
            </div>
            {!persistent && (
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={["px-6", showFooter ? "pb-2" : "pb-6"].join(" ")}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
            {secondaryAction && (
              <Button variant="outline" size="md" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button
                variant={primaryAction.variant ?? "primary"}
                size="md"
                loading={primaryAction.loading}
                disabled={primaryAction.disabled}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** ConfirmModal — specialized destructive confirmation dialog */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      description={message}
      primaryAction={{
        label: confirmLabel,
        variant: danger ? "danger" : "primary",
        onClick: onConfirm,
        loading,
      }}
      secondaryAction={{ label: "Cancel", onClick: onClose }}
    >
      {/* Content comes from description prop */}
      <div className="h-0" />
    </Modal>
  );
}
