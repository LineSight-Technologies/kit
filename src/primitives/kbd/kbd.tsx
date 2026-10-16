import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

export const kbdVariants = cva(
  "inline-flex h-5 min-w-5 select-none items-center justify-center rounded-sm border border-line bg-surface-2 px-1 font-sans text-xs font-medium leading-none tabular-nums text-fg-2",
);

export type KbdProps = React.HTMLAttributes<HTMLElement>;

/** One key or chord, e.g. `⌘K`, `Esc`, `⇧⏎`. */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(({ className, ...props }, ref) => (
  <kbd ref={ref} className={cn(kbdVariants(), className)} {...props} />
));
Kbd.displayName = "Kbd";

export type KbdGroupProps = React.HTMLAttributes<HTMLSpanElement>;

/** A sequence of keys pressed one after another: `<KbdGroup><Kbd>G</Kbd><Kbd>O</Kbd></KbdGroup>`. */
export const KbdGroup = React.forwardRef<HTMLSpanElement, KbdGroupProps>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("inline-flex items-center gap-1", className)} {...props} />
));
KbdGroup.displayName = "KbdGroup";
