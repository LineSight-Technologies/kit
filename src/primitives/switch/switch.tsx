"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";

export const switchVariants = cva(
  [
    "peer group inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
    "transition-colors duration-200 ease-ls-out",
    "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=checked]:bg-accent data-[state=unchecked]:bg-paper-5",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-surface shadow-ls-1 transition-transform duration-200 ease-ls-out data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        sm: "size-3 data-[state=checked]:translate-x-3",
        md: "size-4 data-[state=checked]:translate-x-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface SwitchProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {
  /** Clicking the label toggles the switch. An id is generated when none is given. */
  label?: ReactNode;
  /** Which side of the switch the label sits on. */
  labelPosition?: "left" | "right";
}

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, size, label, labelPosition = "right", ...props }, ref) => {
    const aria = useFieldControl(props);
    const control = (
      <SwitchPrimitive.Root ref={ref} className={cn(switchVariants({ size }), className)} {...props} {...aria}>
        <SwitchPrimitive.Thumb className={thumbVariants({ size })} />
      </SwitchPrimitive.Root>
    );

    if (label == null) return control;

    return (
      <div className="inline-flex items-center gap-2">
        {control}
        <label
          htmlFor={aria.id}
          className={cn(
            "cursor-pointer select-none text-sm leading-5 text-fg peer-disabled:pointer-events-none peer-disabled:opacity-50",
            size === "sm" && "text-xs leading-4",
            labelPosition === "left" && "order-first",
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);
Switch.displayName = "Switch";
