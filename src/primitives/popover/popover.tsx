"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../lib/cn";

/** Anchored floating panel. Radix root — controlled (`open`/`onOpenChange`) or uncontrolled (`defaultOpen`). */
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverClose = PopoverPrimitive.Close;

/** Shared chrome for anchored overlays (popover, menus, command groups). */
export const popoverContentClass =
  "z-dropdown w-72 rounded-lg border border-line bg-surface p-3 text-sm text-fg shadow-ls-2 outline-none " +
  "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out";

export type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>;

const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ className, align = "center", sideOffset = 6, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(popoverContentClass, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
PopoverContent.displayName = "PopoverContent";

export { Popover, PopoverTrigger, PopoverContent, PopoverClose, PopoverAnchor };
