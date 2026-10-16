"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";
import { Kbd } from "../kbd/kbd";

/** True once a kit `TooltipProvider` is above us; lets `Tooltip` self-provide when the shell has not mounted one. */
const KitProviderContext = React.createContext(false);

export type TooltipProviderProps = TooltipPrimitive.TooltipProviderProps;

/** Mount once in the app shell. Shares the open delay across every tooltip so adjacent ones feel instant. */
export function TooltipProvider({ delayDuration = 300, skipDelayDuration = 300, children, ...props }: TooltipProviderProps) {
  return (
    <KitProviderContext.Provider value={true}>
      <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props}>
        {children}
      </TooltipPrimitive.Provider>
    </KitProviderContext.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";

/** Radix parts, for the rare case `Tooltip` is not enough (custom trigger wiring). */
export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const tooltipContentClassName =
  "z-tooltip max-w-xs select-none rounded-md bg-surface-inverse px-2 py-1 text-xs leading-snug text-fg-inverse shadow-ls-2 animate-ls-fade-in";

export type TooltipContentProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

export const TooltipContent = React.forwardRef<React.ComponentRef<typeof TooltipPrimitive.Content>, TooltipContentProps>(
  ({ className, sideOffset = 6, collisionPadding = 8, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(tooltipContentClassName, className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  ),
);
TooltipContent.displayName = "TooltipContent";

export interface TooltipProps {
  /** The label. Falsy content renders the child alone, with no tooltip. */
  content: React.ReactNode;
  /** Keyboard shortcut shown after the label as a Kbd chip, e.g. "⌘S". */
  shortcut?: string;
  side?: TooltipContentProps["side"];
  align?: TooltipContentProps["align"];
  sideOffset?: number;
  /** Exactly one element; it becomes the trigger (`asChild`). Disabled buttons do not fire pointer events, wrap them in a span if a tooltip is needed. */
  children: React.ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  /** Merged last onto the content. */
  className?: string;
}

/** Convenience wrapper: `<Tooltip content="Delete coil"><IconButton … /></Tooltip>`. */
export function Tooltip({
  content,
  shortcut,
  side = "top",
  align,
  sideOffset,
  children,
  open,
  defaultOpen,
  onOpenChange,
  delayDuration,
  className,
}: TooltipProps) {
  const hasProvider = React.useContext(KitProviderContext);
  if (content === null || content === undefined || content === false || content === "") return children;

  const node = (
    <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipContent side={side} align={align} sideOffset={sideOffset} className={className}>
        <span className="inline-flex items-center gap-2">
          <span>{content}</span>
          {shortcut ? <Kbd className="border-ink-3 bg-ink-2 text-fg-inverse">{shortcut}</Kbd> : null}
        </span>
      </TooltipContent>
    </TooltipPrimitive.Root>
  );

  return hasProvider ? node : <TooltipPrimitive.Provider delayDuration={300}>{node}</TooltipPrimitive.Provider>;
}
Tooltip.displayName = "Tooltip";
