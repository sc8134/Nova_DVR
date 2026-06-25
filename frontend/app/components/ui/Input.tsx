"use client";

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputStatus = "default" | "success" | "error" | "warning";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  status?: InputStatus;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

const statusBorder: Record<InputStatus, string> = {
  default: "border-slate-200 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500",
  success: "border-green-400 dark:border-green-600 focus:ring-green-400",
  error:   "border-red-400 dark:border-red-600 focus:ring-red-400",
  warning: "border-amber-400 dark:border-amber-600 focus:ring-amber-400",
};

const StatusIcon = ({ status }: { status: InputStatus }) => {
  if (status === "success")
    return (
      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
      </svg>
    );
  if (status === "error")
    return (
      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    );
  if (status === "warning")
    return (
      <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    );
  return null;
};

/**
 * Input — accessible form input with label, validation states, and icons.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      status = "default",
      leftIcon,
      rightIcon,
      required = false,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const resolvedStatus: InputStatus = errorText ? "error" : status;
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-0.5" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={resolvedStatus === "error"}
            aria-describedby={
              errorText
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={[
              "w-full border rounded-xl text-sm bg-slate-50 dark:bg-slate-700 dark:text-white",
              "placeholder-slate-400 dark:placeholder-slate-500",
              "focus:outline-none focus:ring-2 focus:border-transparent transition",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon  ? "pl-9"  : "pl-4",
              rightIcon || resolvedStatus !== "default" ? "pr-10" : "pr-4",
              "py-2.5",
              statusBorder[resolvedStatus],
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {/* Right icon or status icon */}
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon || <StatusIcon status={resolvedStatus} />}
          </div>
        </div>

        {/* Error message */}
        {errorText && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
            <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {errorText}
          </p>
        )}

        {/* Helper text */}
        {helperText && !errorText && (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;


/* ── Textarea variant ─────────────────────────────────────── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, errorText, required, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = !!errorText;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          className={[
            "w-full border rounded-xl text-sm bg-slate-50 dark:bg-slate-700 dark:text-white",
            "placeholder-slate-400 dark:placeholder-slate-500 px-4 py-2.5",
            "focus:outline-none focus:ring-2 focus:border-transparent transition resize-y min-h-[80px]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-red-400 dark:border-red-600 focus:ring-red-400"
              : "border-slate-200 dark:border-slate-600 focus:ring-blue-500",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {errorText && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">{errorText}</p>
        )}
        {helperText && !errorText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
