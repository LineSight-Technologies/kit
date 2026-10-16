"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton } from "../../primitives/icon-button/icon-button";
import { StatusBadge } from "../../primitives/badge/badge";

// ---------------------------------------------------------------------------------------------
// Page — the content frame. `default` centres at max-w-page; `full` runs edge to edge (tables).
// ---------------------------------------------------------------------------------------------

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: "default" | "full";
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(({ width = "default", className, ...props }, ref) => (
  <div
    ref={ref}
    data-width={width}
    className={cn(
      "flex w-full flex-col px-6 py-6",
      // Adjacent plain sections are separated by one hairline.
      "[&>[data-section=plain]+[data-section=plain]]:border-t [&>[data-section=plain]+[data-section=plain]]:border-line",
      width === "default" && "mx-auto max-w-page",
      className,
    )}
    {...props}
  />
));
Page.displayName = "Page";

// ---------------------------------------------------------------------------------------------
// PageHeader
// ---------------------------------------------------------------------------------------------

export interface PageHeaderBack {
  href?: string;
  onClick?: () => void;
  /** Accessible name, e.g. "Back to orders". */
  label: string;
}

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Record status, rendered as a StatusBadge next to the title. */
  status?: string;
  /** Extra badges after the status. */
  badges?: React.ReactNode;
  /** Right-aligned; wraps under the title on narrow screens. */
  actions?: React.ReactNode;
  /** Ghost ArrowLeft before the title. */
  back?: PageHeaderBack;
  /** A `TabsList` (underline variant) rendered under the title row. */
  tabs?: React.ReactNode;
  /** Sticks to the top of the scroll container; grows a bottom hairline once content scrolls under it. */
  sticky?: boolean;
}

export const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  ({ title, status, badges, actions, back, tabs, sticky = false, className, children, ...props }, ref) => {
    const [stuck, setStuck] = React.useState(false);
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      if (!sticky || typeof IntersectionObserver === "undefined") return;
      const el = sentinelRef.current;
      if (!el) return;
      const io = new IntersectionObserver((entries) => setStuck(!(entries[0]?.isIntersecting ?? true)), { threshold: 0 });
      io.observe(el);
      return () => io.disconnect();
    }, [sticky]);

    const backControl = back ? (
      back.href ? (
        <IconButton variant="ghost" size="sm" label={back.label} asChild className="-ml-2 text-fg-2">
          <a href={back.href} onClick={back.onClick}>
            <ArrowLeft />
          </a>
        </IconButton>
      ) : (
        <IconButton variant="ghost" size="sm" label={back.label} onClick={back.onClick} className="-ml-2 text-fg-2">
          <ArrowLeft />
        </IconButton>
      )
    ) : null;

    return (
      <>
        {sticky ? <div ref={sentinelRef} aria-hidden="true" className="h-px w-full -mt-px" /> : null}
        <header
          ref={ref}
          data-stuck={stuck || undefined}
          className={cn(
            "flex flex-col gap-4",
            tabs ? "pb-0" : "pb-4",
            sticky && "sticky top-0 z-sticky -mx-6 -mt-6 bg-surface px-6 pt-6 transition-shadow duration-150",
            sticky && stuck && !tabs && "border-b border-line",
            className,
          )}
          {...props}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {backControl}
            <h1 className="min-w-0 truncate font-display text-2xl font-semibold tracking-ls-display text-fg">{title}</h1>
            {status ? <StatusBadge status={status} /> : null}
            {badges}
            {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
          {children}
          {tabs}
        </header>
      </>
    );
  },
);
PageHeader.displayName = "PageHeader";

// ---------------------------------------------------------------------------------------------
// PageSection — a titled region. Plain by default (no border, no background); `card` is the rare
// raised case and never nests.
// ---------------------------------------------------------------------------------------------

export interface PageSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "plain" | "card";
  children: React.ReactNode;
}

export const PageSection = React.forwardRef<HTMLElement, PageSectionProps>(
  ({ title, actions, variant = "plain", className, children, ...props }, ref) => {
    const id = React.useId();
    const labelled = title ? `${id}-title` : undefined;
    return (
      <section
        ref={ref}
        data-section={variant}
        aria-labelledby={labelled}
        className={cn(
          "flex flex-col gap-3",
          variant === "plain" ? "py-6" : "rounded-lg border border-line bg-surface p-5 shadow-ls-1",
          className,
        )}
        {...props}
      >
        {title || actions ? (
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
            {title ? (
              <h2 id={labelled} className="min-w-0 truncate text-base font-semibold text-fg">
                {title}
              </h2>
            ) : (
              <span />
            )}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        ) : null}
        {children}
      </section>
    );
  },
);
PageSection.displayName = "PageSection";

// ---------------------------------------------------------------------------------------------
// PageGrid — sections side by side.
// ---------------------------------------------------------------------------------------------

export interface PageGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3;
}

export const PageGrid = React.forwardRef<HTMLDivElement, PageGridProps>(({ columns = 2, className, ...props }, ref) => (
  <div
    ref={ref}
    data-columns={columns}
    className={cn("grid grid-cols-1 gap-x-6", columns === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3", className)}
    {...props}
  />
));
PageGrid.displayName = "PageGrid";
