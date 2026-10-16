"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";

/* ------------------------------------------------------------------ */
/* Shared control chrome — Input, Textarea, SelectTrigger, Combobox    */
/* ------------------------------------------------------------------ */

/** Border, surface, type and height. Padding and focus handling are added by each control. */
export const controlVariants = cva(
  "rounded-md border border-line bg-surface text-sm text-fg transition-colors duration-1 hover:border-line-strong",
  {
    variants: {
      size: {
        sm: "h-control-sm px-2.5",
        md: "h-control px-3",
        lg: "h-control-lg px-3.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** Focus + invalid + disabled for a control that is itself the focusable element. */
export const controlStateClasses =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
  "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger " +
  "disabled:pointer-events-none disabled:opacity-50";

/** Focus + invalid + disabled for a wrapper whose focusable element is a child (slots). */
export const controlWrapperStateClasses =
  "focus-within:ring-2 focus-within:ring-focus focus-within:ring-offset-2 focus-within:ring-offset-surface " +
  "data-[invalid=true]:border-danger data-[invalid=true]:focus-within:ring-danger " +
  "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50";

export type ControlSize = NonNullable<VariantProps<typeof controlVariants>["size"]>;

/* ------------------------------------------------------------------ */
/* Input                                                               */
/* ------------------------------------------------------------------ */

const NUMERIC_TYPES = new Set(["number", "tel"]);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof controlVariants> {
  /** Icon or short text addon ("$") inside the border, before the text. */
  leading?: ReactNode;
  /** Icon or short text addon ("in", "lbs") inside the border, after the text. */
  trailing?: ReactNode;
}

const slotClasses = "flex shrink-0 items-center text-fg-3 [&_svg]:size-4";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, type = "text", leading, trailing, disabled, inputMode, ...props }, ref) => {
    const aria = useFieldControl(props);
    const numeric = NUMERIC_TYPES.has(type) || inputMode === "numeric" || inputMode === "decimal";
    const resolvedInputMode = inputMode ?? (type === "number" ? "decimal" : type === "tel" ? "tel" : undefined);
    const typeClasses = cn("placeholder:text-fg-3", numeric && "tabular-nums");

    if (!leading && !trailing) {
      return (
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          inputMode={resolvedInputMode}
          className={cn("w-full", controlVariants({ size }), controlStateClasses, typeClasses, className)}
          {...props}
          {...aria}
        />
      );
    }

    return (
      <div
        data-invalid={aria["aria-invalid"] ? true : undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "flex w-full items-center gap-2",
          controlVariants({ size }),
          controlWrapperStateClasses,
          className,
        )}
      >
        {leading && <span className={slotClasses}>{leading}</span>}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          inputMode={resolvedInputMode}
          className={cn("h-full w-full min-w-0 bg-transparent text-fg outline-none disabled:pointer-events-none", typeClasses)}
          {...props}
          {...aria}
        />
        {trailing && <span className={slotClasses}>{trailing}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";
