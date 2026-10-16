"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { buttonBaseClassName, buttonToneClassNames } from "../button/button";
import { Spinner } from "../spinner/spinner";
import { Tooltip, type TooltipProps } from "../tooltip/tooltip";

export const iconButtonVariants = cva(cn(buttonBaseClassName, "shrink-0 [&>svg]:size-4"), {
  variants: {
    variant: buttonToneClassNames,
    size: {
      sm: "size-8",
      md: "size-9",
      lg: "size-10",
    },
  },
  defaultVariants: { variant: "ghost", size: "md" },
});

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children">,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible name. Becomes `aria-label` and, unless `tooltip={false}`, the tooltip text. */
  label: string;
  /** The icon (one lucide element). */
  children: React.ReactNode;
  /** Set `false` when the control sits somewhere a tooltip would be noise (e.g. inside another tooltip trigger). */
  tooltip?: boolean;
  tooltipSide?: TooltipProps["side"];
  /** Shown in the tooltip as a Kbd chip. */
  shortcut?: string;
  /** Shows a Spinner in place of the icon, disables the button, sets `aria-busy`. */
  loading?: boolean;
  /** Render the child element (e.g. a router `Link`) with icon-button styling. `loading` is ignored. */
  asChild?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      label,
      children,
      tooltip = true,
      tooltipSide,
      shortcut,
      loading = false,
      disabled,
      asChild = false,
      type,
      ...props
    },
    ref,
  ) => {
    const classes = cn(iconButtonVariants({ variant, size }), className);

    const control = asChild ? (
      <Slot ref={ref} className={classes} aria-label={label} {...props}>
        {children}
      </Slot>
    ) : (
      <button
        ref={ref}
        type={type ?? "button"}
        className={classes}
        aria-label={label}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading ? <Spinner size="md" /> : children}
      </button>
    );

    if (!tooltip) return control;
    return (
      <Tooltip content={label} side={tooltipSide} shortcut={shortcut}>
        {control}
      </Tooltip>
    );
  },
);
IconButton.displayName = "IconButton";
