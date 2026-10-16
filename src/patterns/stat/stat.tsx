"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "../../lib/cn";
import { toneText, type Tone } from "../../lib/tone";
import { SkeletonTile } from "../../primitives/skeleton/skeleton";

export interface StatDelta {
  /** Formatted change, e.g. "+4.2%" or "−12 t". */
  value: string;
  direction: "up" | "down" | "flat";
  /** Colour. Up is not always good (scrap went up) — the caller picks the tone. */
  tone: Tone;
}

const deltaIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus } as const;

export const statTileClassName = "flex flex-col gap-1 rounded-lg border border-line bg-surface p-4 text-left shadow-ls-1";

export interface StatTileProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Unit after the value: "t", "lb", "%". */
  unit?: string;
  delta?: StatDelta;
  /** Renders a SkeletonTile of the same frame. */
  loading?: boolean;
  /** Makes the tile a link. */
  href?: string;
  /** Makes the tile a button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const StatTile = React.forwardRef<HTMLElement, StatTileProps>(
  ({ label, value, unit, delta, loading = false, href, onClick, className, ...props }, ref) => {
    if (loading) return <SkeletonTile ref={ref as React.Ref<HTMLDivElement>} className={className} />;

    const interactive = Boolean(href || onClick);
    const classes = cn(
      statTileClassName,
      interactive &&
        "cursor-pointer transition-colors duration-150 hover:bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
      className,
    );
    const DeltaIcon = delta ? deltaIcon[delta.direction] : null;

    const inner = (
      <>
        <span className="text-xs text-fg-2">{label}</span>
        <span className="flex flex-wrap items-baseline gap-x-1.5">
          <span data-numeric="" className="text-2xl font-semibold tabular-nums tracking-ls-tight text-fg">
            {value}
          </span>
          {unit ? <span className="text-sm text-fg-2">{unit}</span> : null}
        </span>
        {delta && DeltaIcon ? (
          <span data-delta={delta.direction} className={cn("inline-flex items-center gap-0.5 text-xs font-medium tabular-nums", toneText[delta.tone])}>
            <DeltaIcon aria-hidden="true" className="size-3.5" />
            {delta.value}
          </span>
        ) : null}
      </>
    );

    if (href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} className={classes} {...props}>
          {inner}
        </a>
      );
    }
    if (onClick) {
      return (
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} className={classes} {...props}>
          {inner}
        </button>
      );
    }
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={classes} {...props}>
        {inner}
      </div>
    );
  },
);
StatTile.displayName = "StatTile";

const columnClassName = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Defaults to the number of children, 2–4. */
  columns?: 2 | 3 | 4;
}

/** Two to four StatTiles. More than four is a table. */
export const StatRow = React.forwardRef<HTMLDivElement, StatRowProps>(({ columns, className, children, ...props }, ref) => {
  const count = React.Children.count(children);
  const resolved = (columns ?? Math.min(4, Math.max(2, count))) as 2 | 3 | 4;

  React.useEffect(() => {
    if (count > 4 && typeof process !== "undefined" && process.env?.NODE_ENV !== "production") {
      console.warn(`StatRow: ${count} tiles; the limit is four. Use a table for more numbers.`);
    }
  }, [count]);

  return (
    <div ref={ref} data-columns={resolved} className={cn("grid grid-cols-2 gap-3", columnClassName[resolved], className)} {...props}>
      {children}
    </div>
  );
});
StatRow.displayName = "StatRow";
