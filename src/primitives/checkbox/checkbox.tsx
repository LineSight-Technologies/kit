"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, Minus } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";

export const checkboxVariants = cva(
  [
    "peer inline-flex shrink-0 items-center justify-center rounded-sm border border-line-strong bg-surface text-accent-fg",
    "transition-colors duration-150 hover:border-fg-3",
    "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=checked]:border-accent data-[state=checked]:bg-accent",
    "data-[state=indeterminate]:border-accent data-[state=indeterminate]:bg-accent",
  ],
  {
    variants: {
      size: {
        sm: "size-3.5 [&_svg]:size-2.5",
        md: "size-4 [&_svg]:size-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface CheckboxProps
  extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  /** Clicking the label toggles the box. An id is generated when none is given. */
  label?: ReactNode;
  /** Shows a dash instead of a check. Overrides `checked` while true. */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, size, label, indeterminate, checked, ...props }, ref) => {
    const aria = useFieldControl(props);
    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        checked={indeterminate ? "indeterminate" : checked}
        className={cn(checkboxVariants({ size }), className)}
        {...props}
        {...aria}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {indeterminate ? <Minus strokeWidth={3} /> : <Check strokeWidth={3} />}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (label == null) return box;

    return (
      <div className="inline-flex items-center gap-2">
        {box}
        <label
          htmlFor={aria.id}
          className={cn("cursor-pointer select-none text-sm leading-5 text-fg peer-disabled:pointer-events-none peer-disabled:opacity-50", size === "sm" && "text-xs leading-4")}
        >
          {label}
        </label>
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
