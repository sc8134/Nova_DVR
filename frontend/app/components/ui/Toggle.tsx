"use client";

import { InputHTMLAttributes } from "react";

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "size"> {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "sm" | "md";
}

/**
 * Toggle — accessible animated switch input.
 */
export default function Toggle({
  label,
  description,
  checked,
  onChange,
  size = "md",
  disabled,
  id,
  className = "",
  ...props
}: ToggleProps) {
  const toggleId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const trackSize  = size === "sm" ? "w-9 h-5"   : "w-12 h-6";
  const thumbSize  = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  const thumbShift = size === "sm" ? "translate-x-4" : "translate-x-6";

  return (
    <div className={["flex items-start gap-3", className].join(" ")}>
      {/* The actual checkbox (visually hidden, accessible) */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={label ? `${toggleId}-label` : undefined}
        aria-describedby={description ? `${toggleId}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          "relative shrink-0 rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          trackSize,
          checked ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-600",
        ].join(" ")}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        <span
          aria-hidden="true"
          className={[
            "absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform duration-200",
            thumbSize,
            checked ? thumbShift : "translate-x-0",
          ].join(" ")}
        />
      </button>

      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span
              id={`${toggleId}-label`}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 leading-snug"
            >
              {label}
            </span>
          )}
          {description && (
            <span
              id={`${toggleId}-desc`}
              className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed"
            >
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
