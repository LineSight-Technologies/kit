"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";
import { controlStateClasses, controlVariants, type ControlSize } from "../input/input";

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

/* ------------------------------------------------------------------ */
/* Trigger                                                             */
/* ------------------------------------------------------------------ */

export interface SelectTriggerProps extends ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  size?: ControlSize;
}

export const SelectTrigger = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, SelectTriggerProps>(
  ({ className, size = "md", children, ...props }, ref) => {
    const aria = useFieldControl(props);
    return (
      <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex w-full items-center justify-between gap-2 text-left",
          controlVariants({ size }),
          controlStateClasses,
          "data-[placeholder]:text-fg-3 [&>span:first-child]:min-w-0 [&>span:first-child]:truncate",
          className,
        )}
        {...props}
        {...aria}
      >
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-fg-3" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);
SelectTrigger.displayName = "SelectTrigger";

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

export type SelectContentProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;

export const SelectContent = forwardRef<ElementRef<typeof SelectPrimitive.Content>, SelectContentProps>(
  ({ className, children, position = "popper", sideOffset = 4, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative z-dropdown max-h-72 min-w-[8rem] overflow-hidden rounded-lg border border-line bg-surface text-fg shadow-ls-2",
          "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out",
          position === "popper" && "min-w-[var(--radix-select-trigger-width)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="overflow-auto p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  ),
);
SelectContent.displayName = "SelectContent";

/* ------------------------------------------------------------------ */
/* Items                                                               */
/* ------------------------------------------------------------------ */

export type SelectItemProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Item>;

export const SelectItem = forwardRef<ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm text-fg outline-none",
        "data-[highlighted]:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <span className="absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  ),
);
SelectItem.displayName = "SelectItem";

export type SelectLabelProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Label>;

export const SelectLabel = forwardRef<ElementRef<typeof SelectPrimitive.Label>, SelectLabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-xs font-medium text-fg-3", className)} {...props} />
  ),
);
SelectLabel.displayName = "SelectLabel";

export type SelectSeparatorProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>;

export const SelectSeparator = forwardRef<ElementRef<typeof SelectPrimitive.Separator>, SelectSeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />
  ),
);
SelectSeparator.displayName = "SelectSeparator";

/* ------------------------------------------------------------------ */
/* SimpleSelect — the form most screens use                            */
/* ------------------------------------------------------------------ */

export interface SimpleSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SimpleSelectProps
  extends Omit<SelectTriggerProps, "value" | "defaultValue" | "onChange" | "children"> {
  options: SimpleSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  /** Forwarded to `SelectContent`. */
  contentClassName?: string;
}

export const SimpleSelect = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, SimpleSelectProps>(
  (
    { options, value, defaultValue, onValueChange, placeholder, name, disabled, required, contentClassName, ...trigger },
    ref,
  ) => (
    <Select
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      name={name}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger ref={ref} {...trigger}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
);
SimpleSelect.displayName = "SimpleSelect";
