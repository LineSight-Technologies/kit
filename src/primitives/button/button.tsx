"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Spinner } from "../spinner/spinner";

/** Shared by Button and IconButton so both stay identical in colour and state handling. */
export const buttonBaseClassName =
  "relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-md text-sm font-medium outline-none transition-colors duration-150 ease-ls-out focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

export const buttonToneClassNames = {
  primary: "bg-accent text-accent-fg shadow-ls-1 hover:bg-accent-hover",
  secondary: "bg-surface-3 text-fg hover:bg-paper-4",
  outline: "border border-line bg-surface text-fg hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-3",
  danger: "bg-danger text-fg-inverse hover:opacity-90",
} as const;

export const buttonVariants = cva(cn(buttonBaseClassName, "gap-2"), {
  variants: {
    variant: {
      ...buttonToneClassNames,
      link: "text-accent underline-offset-4 hover:underline active:translate-y-0",
    },
    size: {
      sm: "h-control-sm px-3 text-sm",
      md: "h-control px-3.5",
      lg: "h-control-lg px-4 text-base",
    },
    fullWidth: {
      true: "w-full",
    },
  },
  compoundVariants: [{ variant: "link", size: ["sm", "md", "lg"], className: "h-auto px-0" }],
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render the child element (e.g. a router `Link`) with button styling. Icons and `loading` are ignored. */
  asChild?: boolean;
  /** Shows a Spinner, disables the button, sets `aria-busy`. Width is kept: the spinner takes the leading icon's slot, or overlays the label. */
  loading?: boolean;
  /** A lucide icon. Sized to `size-4` automatically. */
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const iconSlotClassName = "inline-flex shrink-0 items-center justify-center [&>svg]:size-4";

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      loading = false,
      disabled,
      leadingIcon,
      trailingIcon,
      children,
      type,
      ...props
    },
    ref,
  ) => {
    const classes = cn(buttonVariants({ variant, size, fullWidth }), className);

    if (asChild) {
      return (
        <Slot ref={ref} className={classes} aria-busy={loading || undefined} data-loading={loading || undefined} {...props}>
          {children}
        </Slot>
      );
    }

    const spinnerOverlaysLabel = loading && leadingIcon == null;

    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {spinnerOverlaysLabel ? <Spinner size="md" className="absolute inset-0 m-auto" /> : null}
        {loading && leadingIcon != null ? (
          <Spinner size="md" />
        ) : leadingIcon != null ? (
          <span aria-hidden="true" className={iconSlotClassName}>
            {leadingIcon}
          </span>
        ) : null}
        <span className={cn("inline-flex items-center gap-2", spinnerOverlaysLabel && "invisible")}>
          {children}
          {trailingIcon != null ? (
            <span aria-hidden="true" className={iconSlotClassName}>
              {trailingIcon}
            </span>
          ) : null}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
