interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
  lines?: number;
  gap?: string;
}

const roundedClasses = {
  sm:   "rounded",
  md:   "rounded-md",
  lg:   "rounded-lg",
  xl:   "rounded-xl",
  full: "rounded-full",
};

/**
 * Skeleton — shimmer placeholder for loading states.
 */
export default function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
  lines,
  gap = "gap-2",
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={["flex flex-col", gap].join(" ")}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={[
              "skeleton",
              roundedClasses[rounded],
              i === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
              "h-4",
              className,
            ].join(" ")}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={[
        "skeleton",
        roundedClasses[rounded],
        className,
      ].join(" ")}
      style={{
        width:  width  !== undefined ? (typeof width  === "number" ? `${width}px`  : width)  : undefined,
        height: height !== undefined ? (typeof height === "number" ? `${height}px` : height) : undefined,
      }}
    />
  );
}

/** Pre-composed skeleton for a card */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={["bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4", className].join(" ")}>
      <div className="flex items-center gap-3">
        <Skeleton width={48} height={48} rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton height={16} rounded="md" className="w-2/3" />
          <Skeleton height={12} rounded="md" className="w-1/3" />
        </div>
      </div>
      <Skeleton lines={3} gap="gap-2" />
    </div>
  );
}

/** Pre-composed skeleton for a list item */
export function SkeletonListItem({ className = "" }: { className?: string }) {
  return (
    <div className={["flex items-center gap-3 px-4 py-3", className].join(" ")}>
      <Skeleton width={36} height={36} rounded="xl" />
      <div className="flex-1 space-y-1.5">
        <Skeleton height={14} className="w-3/4" />
        <Skeleton height={11} className="w-1/2" />
      </div>
      <Skeleton width={60} height={24} rounded="full" />
    </div>
  );
}
