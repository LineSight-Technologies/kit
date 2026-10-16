"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useId, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";

/* ------------------------------------------------------------------ */
/* RadioGroup                                                          */
/* ------------------------------------------------------------------ */

export type RadioGroupProps = ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;

export const RadioGroup = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, RadioGroupProps>(
  ({ className, orientation = "vertical", ...props }, ref) => {
    const aria = useFieldControl(props);
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        orientation={orientation}
        className={cn("flex gap-2", orientation === "vertical" ? "flex-col" : "flex-row flex-wrap gap-x-4", className)}
        {...props}
        {...aria}
      />
    );
  },
);
RadioGroup.displayName = "RadioGroup";

/* ------------------------------------------------------------------ */
/* RadioGroupItem                                                      */
/* ------------------------------------------------------------------ */

export interface RadioGroupItemProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  /** Clicking the label selects the item. An id is generated when none is given. */
  label?: ReactNode;
}

export const RadioGroupItem = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, RadioGroupItemProps>(
  ({ className, label, id: idProp, ...props }, ref) => {
    const generated = useId();
    const id = idProp ?? generated;
    const item = (
      <RadioGroupPrimitive.Item
        ref={ref}
        id={id}
        className={cn(
          "peer inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface",
          "transition-colors duration-150 hover:border-fg-3",
          "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=checked]:border-accent",
          className,
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          <span className="block size-2 rounded-full bg-accent" />
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
    );

    if (label == null) return item;

    return (
      <div className="inline-flex items-center gap-2">
        {item}
        <label
          htmlFor={id}
          className="cursor-pointer select-none text-sm leading-5 text-fg peer-disabled:pointer-events-none peer-disabled:opacity-50"
        >
          {label}
        </label>
      </div>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

/* ------------------------------------------------------------------ */
/* RadioCards                                                          */
/* ------------------------------------------------------------------ */

export interface RadioCardOption {
  value: string;
  title: ReactNode;
  /** Right-aligned detail: a price, a badge, a short spec. */
  meta?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardProps extends Omit<ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
}

/** One bordered option. Use inside `RadioCards` (or any `RadioGroup`). */
export const RadioCard = forwardRef<ElementRef<typeof RadioGroupPrimitive.Item>, RadioCardProps>(
  ({ className, title, meta, ...props }, ref) => (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-left text-sm text-fg",
        "transition-colors duration-150 hover:border-line-strong",
        "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=checked]:border-accent data-[state=checked]:bg-accent-soft",
        className,
      )}
      {...props}
    >
      <span className="min-w-0 truncate font-medium">{title}</span>
      {meta != null && <span className="flex shrink-0 items-center gap-2 text-fg-2">{meta}</span>}
    </RadioGroupPrimitive.Item>
  ),
);
RadioCard.displayName = "RadioCard";

export const radioCardsVariants = cva("grid gap-2", {
  variants: {
    columns: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" },
  },
  defaultVariants: { columns: 1 },
});

export interface RadioCardsProps extends RadioGroupProps, VariantProps<typeof radioCardsVariants> {
  /** Render one card per option. Alternatively pass `RadioCard` children. */
  options?: RadioCardOption[];
}

export const RadioCards = forwardRef<ElementRef<typeof RadioGroupPrimitive.Root>, RadioCardsProps>(
  ({ className, columns, options, children, ...props }, ref) => {
    const aria = useFieldControl(props);
    return (
      <RadioGroupPrimitive.Root
        ref={ref}
        className={cn(radioCardsVariants({ columns }), className)}
        {...props}
        {...aria}
      >
        {options?.map((o) => (
          <RadioCard key={o.value} value={o.value} title={o.title} meta={o.meta} disabled={o.disabled} />
        ))}
        {children}
      </RadioGroupPrimitive.Root>
    );
  },
);
RadioCards.displayName = "RadioCards";
