"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

export const spinnerVariants = cva("inline-flex shrink-0 animate-ls-spin items-center justify-center text-current", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-6",
    },
  },
  defaultVariants: { size: "md" },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  /** Screen-reader text. Visible text is never rendered. */
  label?: string;
}

/** Indeterminate activity arc. Inherits `currentColor`, so it takes the colour of the text around it. */
export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, label = "Loading", ...props }, ref) => (
    <span ref={ref} role="status" className={cn(spinnerVariants({ size }), className)} {...props}>
      <svg className="size-full" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2.5" className="opacity-25" />
        <path
          d="M21.5 12a9.5 9.5 0 0 0-9.5-9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  ),
);
Spinner.displayName = "Spinner";
