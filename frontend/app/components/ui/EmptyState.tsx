interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * EmptyState — helpful placeholder when lists or views have no content.
 * Per task specs: "empty state messages — helpful, not sad."
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={["flex flex-col items-center justify-center text-center py-12 px-6", className].join(" ")}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
          {icon}
        </div>
      )}
      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
