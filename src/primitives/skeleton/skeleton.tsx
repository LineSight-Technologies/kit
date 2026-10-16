import * as React from "react";
import { cn } from "../../lib/cn";

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/** A shimmering block. Size it with `h-*`/`w-*` to match the content it stands in for. */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(({ className, ...props }, ref) => (
  <div ref={ref} aria-hidden="true" className={cn("relative overflow-hidden rounded-md bg-surface-3", className)} {...props}>
    <span className="absolute inset-0 animate-ls-shimmer bg-[linear-gradient(90deg,transparent,var(--ls-surface),transparent)]" />
  </div>
));
Skeleton.displayName = "Skeleton";

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of lines. The last one is shorter, like a paragraph. */
  lines?: number;
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, ...props }, ref) => (
    <div ref={ref} aria-hidden="true" className={cn("flex flex-col gap-2", className)} {...props}>
      {Array.from({ length: Math.max(1, lines) }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 && lines > 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  ),
);
SkeletonText.displayName = "SkeletonText";

const ROW_WIDTHS = ["w-2/5", "w-1/4", "w-1/6", "w-1/5", "w-1/3", "w-1/6"] as const;

export interface SkeletonRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of cell placeholders. */
  cells?: number;
}

/** Table-row shaped: matches a DataTable row's height and bottom hairline. */
export const SkeletonRow = React.forwardRef<HTMLDivElement, SkeletonRowProps>(
  ({ className, cells = 4, ...props }, ref) => (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("flex h-12 w-full items-center gap-4 border-b border-line px-3", className)}
      {...props}
    >
      {Array.from({ length: Math.max(1, cells) }, (_, i) => (
        <Skeleton key={i} className={cn("h-3.5", ROW_WIDTHS[i % ROW_WIDTHS.length])} />
      ))}
    </div>
  ),
);
SkeletonRow.displayName = "SkeletonRow";

export type SkeletonTileProps = React.HTMLAttributes<HTMLDivElement>;

/** Stat-tile shaped: a label line and a large number line inside a tile frame. */
export const SkeletonTile = React.forwardRef<HTMLDivElement, SkeletonTileProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    aria-hidden="true"
    className={cn("flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-ls-1", className)}
    {...props}
  >
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-7 w-28" />
  </div>
));
SkeletonTile.displayName = "SkeletonTile";
