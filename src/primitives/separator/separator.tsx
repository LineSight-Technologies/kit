"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../lib/cn";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> {
  /** Short text centred between two hairlines. Horizontal only; ignored when vertical. */
  label?: React.ReactNode;
}

export const Separator = React.forwardRef<React.ComponentRef<typeof SeparatorPrimitive.Root>, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, label, ...props }, ref) => {
    if (label != null && label !== false && orientation === "horizontal") {
      return (
        <div
          ref={ref}
          role={decorative ? "none" : "separator"}
          className={cn("flex w-full items-center gap-3", className)}
          {...props}
        >
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
          <span className="shrink-0 text-xs text-fg-3">{label}</span>
          <span aria-hidden="true" className="h-px flex-1 bg-line" />
        </div>
      );
    }
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn("shrink-0 bg-line", orientation === "horizontal" ? "h-px w-full" : "h-full w-px self-stretch", className)}
        {...props}
      />
    );
  },
);
Separator.displayName = "Separator";
