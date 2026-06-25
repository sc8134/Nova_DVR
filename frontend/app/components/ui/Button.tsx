"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
export type ButtonSize    = "xs" | "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-900/20 disabled:bg-blue-400",
  secondary: "bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 dark:active:bg-slate-500",
  ghost:     "bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300",
  danger:    "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm shadow-red-900/20 disabled:bg-red-400",
  success:   "bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-sm shadow-green-900/20 disabled:bg-green-400",
  outline:   "bg-transparent border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5",
  sm: "text-xs px-3.5 py-2 rounded-lg gap-2",
  md: "text-sm px-5 py-2.5 rounded-xl gap-2",
  lg: "text-sm px-6 py-3 rounded-xl gap-2.5",
};

const Spinner = () => (
  <svg className="w-3.5 h-3.5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

/**
 * Button — unified button primitive for Nova DVR.
 * Supports 6 variants, 4 sizes, loading state, left/right icons.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-150 btn-press",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
          "disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
