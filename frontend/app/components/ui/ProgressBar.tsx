interface ProgressBarProps {
  value: number;       // 0–100
  max?: number;        // default 100
  label?: string;
  showPercent?: boolean;
  size?: "xs" | "sm" | "md";
  color?: "primary" | "success" | "warning" | "danger" | "accent";
  animated?: boolean;
  className?: string;
}

const colorClasses = {
  primary: "bg-blue-600",
  success: "bg-green-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  accent:  "bg-gradient-to-r from-violet-500 to-blue-500",
};

const sizeClasses = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
};

/**
 * ProgressBar — visual progress indicator with % label support.
 */
export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  size = "sm",
  color = "primary",
  animated = true,
  className = "",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={["space-y-1", className].join(" ")}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-auto">
              {pct.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={[
          "w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden",
          sizeClasses[size],
        ].join(" ")}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={[
            "h-full rounded-full",
            animated ? "transition-all duration-300 ease-out" : "",
            colorClasses[color],
          ].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
