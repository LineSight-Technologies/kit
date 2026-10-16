"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------------------------------------ */
/* EntityCard                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export interface EntityCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> {
  /** An Avatar (lg, square for companies) beside the title, or with `mediaVariant="cover"` an image slot on top. */
  media?: React.ReactNode;
  mediaVariant?: "inline" | "cover";
  title: React.ReactNode;
  /** One line under the title. */
  meta?: React.ReactNode;
  /** Badges row. */
  badges?: React.ReactNode;
  /** Top-right, shown on hover and focus-within (an ActionMenu). */
  actions?: React.ReactNode;
  /** Makes the whole card a link. */
  href?: string;
  /** Makes the whole card a button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
  /** Below the header: a compact PropertyList. */
  children?: React.ReactNode;
}

/** Card for a record where the image or avatar matters. Grids of these go in `EntityGrid`. */
export const EntityCard = React.forwardRef<HTMLElement, EntityCardProps>(
  ({ className, media, mediaVariant = "inline", title, meta, badges, actions, href, onClick, selected = false, children, ...props }, ref) => {
    const interactive = !!href || !!onClick;
    const cover = media != null && mediaVariant === "cover";

    // The title is the interactive element; a pseudo-element stretches it over the card so the whole
    // surface is clickable while actions stay their own controls above it.
    const stretched = "outline-none after:absolute after:inset-0 after:rounded-lg after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-focus";
    const titleNode = href ? (
      <a href={href} className={cn("text-fg", stretched)}>
        {title}
      </a>
    ) : onClick ? (
      <button type="button" onClick={onClick} className={cn("text-left text-fg", stretched)}>
        {title}
      </button>
    ) : (
      title
    );

    return (
      <article
        ref={ref}
        data-selected={selected || undefined}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "group/card relative flex flex-col rounded-lg border bg-surface shadow-ls-1 transition-shadow duration-150",
          selected ? "border-accent" : "border-line",
          interactive && "hover:shadow-ls-2",
          className,
        )}
        {...props}
      >
        {cover ? (
          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-surface-3 [&>img]:size-full [&>img]:object-cover">{media}</div>
        ) : null}
        <div className="flex items-start gap-3 p-4">
          {media != null && !cover ? <div className="shrink-0">{media}</div> : null}
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="truncate text-sm font-medium leading-5 text-fg">{titleNode}</h3>
            {meta != null ? <p className="truncate text-xs leading-4 text-fg-2">{meta}</p> : null}
            {badges != null ? <div className="flex flex-wrap items-center gap-1 pt-1.5">{badges}</div> : null}
          </div>
          {actions != null ? (
            <div
              className={cn(
                "relative z-[1] -mr-2 -mt-2 shrink-0 transition-opacity duration-150",
                "opacity-0 group-hover/card:opacity-100 group-focus-within/card:opacity-100",
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>
        {children != null ? <div className="relative z-[1] px-4 pb-4">{children}</div> : null}
      </article>
    );
  },
);
EntityCard.displayName = "EntityCard";

/* ------------------------------------------------------------------------------------------------ */
/* EntityGrid                                                                                        */
/* ------------------------------------------------------------------------------------------------ */

export type EntityGridProps = React.HTMLAttributes<HTMLDivElement>;

/** 1 / 2 / 3 / 4 columns by breakpoint, gap-4. */
export const EntityGrid = React.forwardRef<HTMLDivElement, EntityGridProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)} {...props} />
));
EntityGrid.displayName = "EntityGrid";
