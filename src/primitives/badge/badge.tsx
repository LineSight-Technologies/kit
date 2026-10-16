import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { TONES, toneSoft, toneSolid, toneText, type Tone } from "../../lib/tone";

/** Outline look: hairline in the tone colour, no fill. Neutral uses the strong line so it reads on paper. */
const toneOutline: Record<Tone, string> = {
  neutral: "border-line-strong text-fg-2",
  accent: cn("border-current", toneText.accent),
  success: cn("border-current", toneText.success),
  warn: cn("border-current", toneText.warn),
  danger: cn("border-current", toneText.danger),
  info: cn("border-current", toneText.info),
};

const toneMaps = { soft: toneSoft, solid: toneSolid, outline: toneOutline } as const;
type BadgeVariant = keyof typeof toneMaps;

const emptyTones = Object.fromEntries(TONES.map((t) => [t, ""])) as Record<Tone, string>;

export const badgeVariants = cva(
  "inline-flex shrink-0 select-none items-center whitespace-nowrap rounded-full font-medium leading-none tabular-nums",
  {
    variants: {
      variant: { soft: "", solid: "", outline: "border bg-transparent" } satisfies Record<BadgeVariant, string>,
      tone: emptyTones,
      size: {
        sm: "h-5 gap-1 px-1.5 text-[11px]",
        md: "h-6 gap-1.5 px-2 text-xs",
      },
    },
    compoundVariants: (Object.keys(toneMaps) as BadgeVariant[]).flatMap((variant) =>
      TONES.map((tone) => ({ variant, tone, className: toneMaps[variant][tone] })),
    ),
    defaultVariants: { variant: "soft", tone: "neutral", size: "md" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Leading dot in the text colour. Ignored with `asChild` (Slot takes one child). */
  dot?: boolean;
  /** Render the child element (e.g. a link) with badge styling. */
  asChild?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, tone, size, dot = false, asChild = false, children, ...props }, ref) => {
    const classes = cn(badgeVariants({ variant, tone, size }), className);
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <span ref={ref} className={classes} {...props}>
        {dot ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
        {children}
      </span>
    );
  },
);
Badge.displayName = "Badge";

// ---------------------------------------------------------------------------------------------
// Status registry
// ---------------------------------------------------------------------------------------------

export interface StatusDefinition {
  tone: Tone;
  /** Display text. Defaults to the title-cased key. */
  label?: string;
}

/** `"In Progress"`, `"in-progress"`, `" IN_PROGRESS "` → `"in_progress"`. */
export function normaliseStatus(status: string): string {
  return status
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** `"in_progress"` → `"In Progress"`. */
export function titleCaseStatus(status: string): string {
  return normaliseStatus(status)
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const seed = (tone: Tone, keys: string[]) => Object.fromEntries(keys.map((k) => [k, { tone }])) as Record<string, StatusDefinition>;

/** Statuses every LineSight app shares. Apps add their own with `registerStatus`. */
export const DEFAULT_STATUS_MAP: Record<string, StatusDefinition> = {
  ...seed("info", ["open", "active", "scheduled", "new", "planned", "ready", "queued"]),
  ...seed("accent", ["in_progress", "running", "processing", "slitting", "in_production"]),
  ...seed("success", ["complete", "completed", "done", "shipped", "won", "approved", "delivered", "paid", "success", "succeeded", "passed"]),
  ...seed("warn", ["pending", "draft", "on_hold", "waiting", "review", "in_review", "partial", "at_risk", "due_soon"]),
  ...seed("danger", ["failed", "failure", "error", "cancelled", "canceled", "rejected", "lost", "overdue", "blocked", "declined"]),
  ...seed("neutral", ["archived", "inactive", "closed", "unknown", "none", "disabled", "void"]),
};

const registry = new Map<string, StatusDefinition>(Object.entries(DEFAULT_STATUS_MAP));

/** Add or override statuses. Keys are normalised, so `"On Hold"` and `"on_hold"` are the same entry. */
export function registerStatus(map: Record<string, StatusDefinition>): void {
  for (const [key, def] of Object.entries(map)) registry.set(normaliseStatus(key), def);
}

/** Resolve a status string to a tone and label. Unknown statuses fall back to neutral with the raw text title-cased. */
export function getStatus(status: string): Required<StatusDefinition> {
  const def = registry.get(normaliseStatus(status));
  return { tone: def?.tone ?? "neutral", label: def?.label ?? titleCaseStatus(status) };
}

export interface StatusBadgeProps extends Omit<BadgeProps, "tone" | "children"> {
  /** Raw status from the record, e.g. `order.status`. */
  status: string;
}

/** `<StatusBadge status={order.status} />` — one look for a status everywhere it appears. */
export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, dot = true, ...props }, ref) => {
    const { tone, label } = getStatus(status);
    return (
      <Badge ref={ref} tone={tone} dot={dot} data-status={normaliseStatus(status)} {...props}>
        {label}
      </Badge>
    );
  },
);
StatusBadge.displayName = "StatusBadge";
