import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  variant?: "default" | "elevated" | "flat" | "highlighted";
}

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
};

const variantClasses = {
  default:     "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm",
  elevated:    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md",
  flat:        "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700",
  highlighted: "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800",
};

/**
 * Card — surface container with consistent padding, radius, and shadow.
 */
export default function Card({
  padding = "md",
  hoverable = false,
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable ? "card-hover cursor-pointer" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

/** Card.Header — section header inside a card */
Card.Header = function CardHeader({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "px-6 py-4 border-b border-slate-100 dark:border-slate-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
};

/** Card.Body — padded body section inside a card */
Card.Body = function CardBody({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={["p-6", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
};
