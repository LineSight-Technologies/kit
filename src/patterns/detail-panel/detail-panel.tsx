"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatDateTime, formatRelative, toDate, type DateInput } from "../../lib/date";
import { toneDot, type Tone } from "../../lib/tone";
import { Avatar } from "../../primitives/avatar/avatar";
import { IconButton } from "../../primitives/icon-button/icon-button";
import { Skeleton } from "../../primitives/skeleton/skeleton";
import { Tooltip } from "../../primitives/tooltip/tooltip";
import { EmptyState } from "../empty-state/empty-state";

/* ------------------------------------------------------------------------------------------------ */
/* DetailPanel                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

export type DetailPanelProps = React.HTMLAttributes<HTMLDivElement>;

/** The record body: a vertical stack of PropertyList, Timeline, sections. One name for it everywhere. */
export const DetailPanel = React.forwardRef<HTMLDivElement, DetailPanelProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-6", className)} {...props} />
));
DetailPanel.displayName = "DetailPanel";

/* ------------------------------------------------------------------------------------------------ */
/* PropertyList / Property                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export interface PropertyItem {
  label: string;
  value: React.ReactNode;
  /** Take two columns (long text, addresses). */
  span?: 1 | 2;
  /** Hover shows a copy control. Copies `copyValue` or the value when it is text. */
  copyable?: boolean;
  copyValue?: string;
}

export interface PropertyListProps extends React.HTMLAttributes<HTMLDListElement> {
  /** Facts in order. Alternatively pass `Property` children. */
  items?: PropertyItem[];
  /** Columns at the widest breakpoint; collapses to one on narrow screens. */
  columns?: 1 | 2 | 3;
  /** Tighter rows for cards and sheets. */
  size?: "default" | "compact";
}

const columnClasses: Record<NonNullable<PropertyListProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
};

export const PropertyList = React.forwardRef<HTMLDListElement, PropertyListProps>(
  ({ className, items, columns = 2, size = "default", children, ...props }, ref) => (
    <dl
      ref={ref}
      data-columns={columns}
      className={cn("grid gap-x-6", size === "compact" ? "gap-y-2" : "gap-y-4", columnClasses[columns], className)}
      {...props}
    >
      {items?.map((item, i) => (
        <Property key={`${item.label}-${i}`} {...item} />
      ))}
      {children}
    </dl>
  ),
);
PropertyList.displayName = "PropertyList";

export interface PropertyProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">, PropertyItem {}

function isEmptyValue(value: React.ReactNode): boolean {
  return value === null || value === undefined || value === "" || value === false;
}

/** One fact: label over value. Empty values render an en dash. */
export const Property = React.forwardRef<HTMLDivElement, PropertyProps>(
  ({ className, label, value, span = 1, copyable = false, copyValue, ...props }, ref) => {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    React.useEffect(() => () => clearTimeout(timer.current), []);

    const text = copyValue ?? (typeof value === "string" || typeof value === "number" ? String(value) : undefined);
    const canCopy = copyable && !!text;

    const copy = async () => {
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), 1500);
      } catch {
        // Clipboard unavailable (insecure context): nothing to show, the value is still visible.
      }
    };

    return (
      <div ref={ref} className={cn("group/property min-w-0", span === 2 && "sm:col-span-2", className)} {...props}>
        <dt className="text-xs leading-4 text-fg-2">{label}</dt>
        <dd className="mt-0.5 flex min-h-5 items-center gap-1 text-sm leading-5 text-fg">
          {isEmptyValue(value) ? (
            <span className="text-fg-3">–</span>
          ) : (
            <span className="min-w-0 break-words">{value}</span>
          )}
          {canCopy ? (
            <IconButton
              label={copied ? "Copied" : `Copy ${label}`}
              size="sm"
              className={cn(
                "size-6 shrink-0 text-fg-3 opacity-0 transition-opacity duration-150 group-hover/property:opacity-100 focus-visible:opacity-100",
                copied && "opacity-100 text-success",
              )}
              onClick={copy}
            >
              {copied ? <Check /> : <Copy />}
            </IconButton>
          ) : null}
        </dd>
      </div>
    );
  },
);
Property.displayName = "Property";

/* ------------------------------------------------------------------------------------------------ */
/* Timeline / TimelineItem                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export interface TimelineActor {
  name: string;
  src?: string;
}

export interface TimelineEntry {
  id: string;
  at: DateInput;
  title: React.ReactNode;
  body?: React.ReactNode;
  tone?: Tone;
  /** A lucide icon in place of the tone dot. */
  icon?: React.ReactNode;
  /** Shows an Avatar in place of the dot. */
  actor?: TimelineActor;
}

export interface TimelineProps extends React.HTMLAttributes<HTMLOListElement> {
  items?: TimelineEntry[];
  /** Newest first by default. */
  order?: "desc" | "asc";
  /** Shows three placeholder entries. */
  loading?: boolean;
  /** Shown when there are no items. Defaults to a small EmptyState. */
  empty?: React.ReactNode;
  /** Reference time for the relative labels; defaults to now. */
  now?: DateInput;
}

const TimelineContext = React.createContext<{ now?: DateInput }>({});

/** What happened to a record, newest first. A hairline joins tone dots or actor avatars. */
export const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  ({ className, items, order = "desc", loading = false, empty, now, children, ...props }, ref) => {
    const sorted = React.useMemo(() => {
      if (!items) return [];
      const dir = order === "desc" ? -1 : 1;
      return [...items].sort((a, b) => dir * (toDate(a.at).getTime() - toDate(b.at).getTime()));
    }, [items, order]);
    const ctx = React.useMemo(() => ({ now }), [now]);

    const hasChildren = React.Children.count(children) > 0;
    const isEmpty = !loading && !hasChildren && sorted.length === 0;

    if (isEmpty) {
      return <div className={className}>{empty ?? <EmptyState title="No activity yet" size="sm" />}</div>;
    }

    return (
      <TimelineContext.Provider value={ctx}>
        <ol
          ref={ref}
          aria-busy={loading || undefined}
          data-order={order}
          className={cn("relative flex flex-col gap-5", className)}
          {...props}
        >
          <span aria-hidden="true" className="absolute bottom-3 left-[11.5px] top-3 w-px bg-line" />
          {loading
            ? Array.from({ length: 3 }, (_, i) => (
                <li key={i} aria-hidden="true" className="relative flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center bg-surface">
                    <Skeleton className="size-2.5 rounded-full" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-1">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </li>
              ))
            : sorted.map((item) => <TimelineItem key={item.id} {...item} />)}
          {children}
        </ol>
      </TimelineContext.Provider>
    );
  },
);
Timeline.displayName = "Timeline";

export interface TimelineItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title" | "id">, TimelineEntry {}

export const TimelineItem = React.forwardRef<HTMLLIElement, TimelineItemProps>(
  ({ className, id, at, title, body, tone = "neutral", icon, actor, ...props }, ref) => {
    const { now } = React.useContext(TimelineContext);
    const date = toDate(at);
    const absolute = formatDateTime(date);
    const relative = formatRelative(date, now);

    return (
      <li ref={ref} data-id={id} data-tone={tone} className={cn("relative flex gap-3", className)} {...props}>
        <span className="flex size-6 shrink-0 items-center justify-center bg-surface">
          {actor ? (
            <Avatar name={actor.name} src={actor.src} size="sm" />
          ) : icon ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-surface-3 text-fg-2 [&_svg]:size-3.5">{icon}</span>
          ) : (
            <span aria-hidden="true" className={cn("size-2.5 rounded-full", toneDot[tone])} />
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-0.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-sm leading-5 text-fg">{title}</span>
            {absolute ? (
              <Tooltip content={absolute}>
                <time dateTime={date.toISOString()} className="shrink-0 text-xs leading-5 text-fg-3 tabular-nums">
                  {relative}
                </time>
              </Tooltip>
            ) : null}
          </div>
          {body ? <div className="text-sm leading-5 text-fg-2">{body}</div> : null}
        </div>
      </li>
    );
  },
);
TimelineItem.displayName = "TimelineItem";
