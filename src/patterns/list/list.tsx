"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { SkeletonRow } from "../../primitives/skeleton/skeleton";
import { EmptyState } from "../empty-state/empty-state";

/* ------------------------------------------------------------------------------------------------ */
/* List                                                                                              */
/* ------------------------------------------------------------------------------------------------ */

export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Hairlines between rows. Default true. */
  divided?: boolean;
  /** Shows five placeholder rows. */
  loading?: boolean;
  /** Shown when there are no rows. Defaults to a small EmptyState. */
  empty?: React.ReactNode;
}

/** Compact rows: recents, results, related records. Never a card. */
export const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, divided = true, loading = false, empty, children, ...props }, ref) => {
    const count = React.Children.toArray(children).filter(Boolean).length;
    const isEmpty = !loading && count === 0;

    return (
      <ul
        ref={ref}
        aria-busy={loading || undefined}
        data-divided={divided || undefined}
        className={cn(
          "flex flex-col",
          divided && "[&>li]:border-b [&>li]:border-line [&>li:last-child]:border-b-0",
          className,
        )}
        {...props}
      >
        {loading ? (
          Array.from({ length: 5 }, (_, i) => (
            <li key={i} aria-hidden="true">
              <SkeletonRow cells={3} className="border-b-0" />
            </li>
          ))
        ) : isEmpty ? (
          <li className="py-6">{empty ?? <EmptyState title="Nothing here yet" size="sm" />}</li>
        ) : (
          children
        )}
      </ul>
    );
  },
);
List.displayName = "List";

/* ------------------------------------------------------------------------------------------------ */
/* ListRow                                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export interface ListRowProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onClick"> {
  /** Avatar, icon or checkbox. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  /** Secondary text: beside the title on wide screens, under it on narrow. */
  meta?: React.ReactNode;
  /** Badge, time or ActionMenu. */
  trailing?: React.ReactNode;
  /** Renders the row as a link. */
  href?: string;
  /** Renders the row as a button. */
  onClick?: React.MouseEventHandler<HTMLElement>;
  selected?: boolean;
  /** Render the child element (a router `Link`) as the row surface, keeping the slots. */
  asChild?: boolean;
  /** Classes for the `<li>` wrapper. */
  itemClassName?: string;
}

const rowBase = "flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm text-fg transition-colors duration-150";
const rowInteractive =
  "cursor-pointer outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus";

export const ListRow = React.forwardRef<HTMLElement, ListRowProps>(
  ({ className, itemClassName, leading, title, meta, trailing, href, onClick, selected = false, asChild = false, children, ...props }, ref) => {
    const interactive = asChild || !!href || !!onClick;
    const showChevron = !!href && trailing == null && !asChild;

    const content = (
      <>
        {leading != null ? <span className="flex shrink-0 items-center [&_svg]:size-4 [&_svg]:text-fg-2">{leading}</span> : null}
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
          <span className="min-w-0 truncate font-medium">{title}</span>
          {meta != null ? <span className="min-w-0 truncate text-xs text-fg-2">{meta}</span> : null}
        </span>
        {trailing != null ? <span className="flex shrink-0 items-center gap-2 text-xs text-fg-2">{trailing}</span> : null}
        {showChevron ? <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-fg-3" /> : null}
      </>
    );

    const classes = cn(rowBase, interactive && rowInteractive, selected && "bg-accent-soft", className);
    const shared = { "data-selected": selected || undefined, "aria-current": selected ? ("true" as const) : undefined };

    let surface: React.ReactNode;
    if (asChild) {
      // The child (e.g. a router Link) is the surface; the slots render inside it.
      const only = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>;
      surface = (
        <Slot ref={ref} className={classes} {...shared} {...props}>
          {React.cloneElement(only, undefined, content)}
        </Slot>
      );
    } else if (href) {
      surface = (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...shared} {...props}>
          {content}
        </a>
      );
    } else if (onClick) {
      surface = (
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" onClick={onClick} className={classes} {...shared} {...props}>
          {content}
        </button>
      );
    } else {
      surface = (
        <div ref={ref as React.Ref<HTMLDivElement>} className={classes} {...shared} {...props}>
          {content}
        </div>
      );
    }

    return <li className={cn("list-none", itemClassName)}>{surface}</li>;
  },
);
ListRow.displayName = "ListRow";
