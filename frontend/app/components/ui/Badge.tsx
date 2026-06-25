import { HTMLAttributes } from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";
export type BadgeSize = "sm" | "md";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600",
  primary:  "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700",
  success:  "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700",
  warning:  "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700",
  danger:   "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700",
  info:     "bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700",
  outline:  "bg-transparent text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600",
};

const dotColors: Record<BadgeVariant, string> = {
  default:  "bg-slate-400",
  primary:  "bg-blue-500",
  success:  "bg-green-500",
  warning:  "bg-amber-500",
  danger:   "bg-red-500",
  info:     "bg-violet-500",
  outline:  "bg-slate-400",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[10px] px-1.5 py-0.5 gap-1 rounded-full",
  md: "text-xs px-2.5 py-1 gap-1.5 rounded-full",
};

/**
 * Badge — status labels, tags, and metadata chips.
 */
export default function Badge({
  variant = "default",
  size = "md",
  dot = false,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center font-semibold whitespace-nowrap",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
