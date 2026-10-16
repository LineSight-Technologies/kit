"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Input, type InputProps } from "../../primitives/input/input";
import { IconButton } from "../../primitives/icon-button/icon-button";
import { Kbd } from "../../primitives/kbd/kbd";
import { Popover, PopoverContent, PopoverTrigger, type PopoverContentProps } from "../../primitives/popover/popover";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

// ---------------------------------------------------------------------------------------------
// Toolbar — one row above every list: search, filter chips, view toggle, actions; a second row
// of applied filters when there are any.
// ---------------------------------------------------------------------------------------------

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A `SearchInput`. */
  search?: React.ReactNode;
  /** `FilterMenu`s / `FilterChip`s. */
  filters?: React.ReactNode;
  /** A `ViewToggle`, right side. */
  view?: React.ReactNode;
  /** Buttons, right side. */
  actions?: React.ReactNode;
  /** Applied filters as removable `FilterChip`s; renders a second row when present. */
  active?: React.ReactNode;
}

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ search, filters, view, actions, active, className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-wrap items-center gap-2">
        {search}
        {filters}
        {children}
        {view || actions ? (
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {view}
            {actions}
          </div>
        ) : null}
      </div>
      {active ? (
        <div data-active-filters="" className="flex flex-wrap items-center gap-2">
          {active}
        </div>
      ) : null}
    </div>
  ),
);
Toolbar.displayName = "Toolbar";

// ---------------------------------------------------------------------------------------------
// SearchInput
// ---------------------------------------------------------------------------------------------

function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
    }
  };
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export interface SearchInputProps extends Omit<InputProps, "value" | "onChange" | "leading" | "trailing" | "type"> {
  value: string;
  onChange: (value: string) => void;
  /** Fires `debounceMs` after the last keystroke — wire fetching here. */
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  /** Shows a "/" Kbd while empty and focuses the field when "/" is pressed outside another input. */
  shortcut?: boolean;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value, onChange, onDebouncedChange, debounceMs = 250, shortcut = false, placeholder = "Search", className, onFocus, onBlur, ...props },
    ref,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [focused, setFocused] = React.useState(false);
    const mounted = React.useRef(false);
    const debouncedRef = React.useRef(onDebouncedChange);
    debouncedRef.current = onDebouncedChange;

    React.useEffect(() => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      if (!debouncedRef.current) return;
      const t = window.setTimeout(() => debouncedRef.current?.(value), debounceMs);
      return () => window.clearTimeout(t);
    }, [value, debounceMs]);

    React.useEffect(() => {
      if (!shortcut) return;
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTypingTarget(e.target)) return;
        e.preventDefault();
        inputRef.current?.focus();
      };
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }, [shortcut]);

    const showKbd = shortcut && !value && !focused;

    return (
      <Input
        ref={mergeRefs(ref, inputRef)}
        type="search"
        role="searchbox"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        leading={<Search />}
        trailing={
          value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className={cn("-mr-1 flex size-6 items-center justify-center rounded-sm text-fg-3 transition-colors duration-150 hover:text-fg", focusRing)}
            >
              <X />
            </button>
          ) : showKbd ? (
            <Kbd aria-hidden="true">/</Kbd>
          ) : undefined
        }
        className={cn("w-full sm:w-72 [&_input::-webkit-search-cancel-button]:hidden", className)}
        {...props}
      />
    );
  },
);
SearchInput.displayName = "SearchInput";

// ---------------------------------------------------------------------------------------------
// FilterChip
// ---------------------------------------------------------------------------------------------

export const filterChipClassName =
  "inline-flex h-control-sm shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full border text-sm transition-colors duration-150 [&_svg]:size-4 [&_svg]:shrink-0";

const filterChipStateClassName = {
  active: "border-accent bg-accent-soft text-fg",
  inactive: "border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg",
} as const;

export interface FilterChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  label: React.ReactNode;
  /** The applied value: "Status: Open". */
  value?: React.ReactNode;
  /** Applied look. Defaults to `value != null`. */
  active?: boolean;
  /** Leading lucide icon. */
  icon?: React.ReactNode;
  /** Trailing lucide icon (a chevron on menu triggers). */
  trailing?: React.ReactNode;
  /** Adds a remove control and makes this an applied chip. */
  onRemove?: () => void;
  /** The single child (e.g. a router Link) becomes the chip. */
  asChild?: boolean;
}

export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ label, value, active, icon, trailing, onRemove, asChild = false, className, disabled, children, type, ...props }, ref) => {
    const isActive = active ?? value != null;
    const inner = (
      <>
        {icon}
        <span className="truncate">
          {label}
          {value != null ? ": " : null}
          {value != null ? <span className="font-medium text-fg">{value}</span> : null}
        </span>
        {trailing}
      </>
    );
    const Comp = asChild ? Slot : "button";
    const compProps = asChild ? {} : { type: type ?? "button", disabled };
    const content = asChild ? React.cloneElement(React.Children.only(children) as React.ReactElement, undefined, inner) : inner;

    if (onRemove) {
      return (
        <span
          data-active={isActive || undefined}
          data-disabled={disabled || undefined}
          className={cn(filterChipClassName, "gap-0 pr-1", isActive ? filterChipStateClassName.active : filterChipStateClassName.inactive, disabled && "pointer-events-none opacity-50", className)}
        >
          <Comp
            ref={ref}
            data-active={isActive || undefined}
            className={cn("inline-flex h-full min-w-0 items-center gap-1.5 rounded-l-full pl-3 pr-1 text-inherit", focusRing, "focus-visible:ring-offset-0")}
            {...compProps}
            {...props}
          >
            {content}
          </Comp>
          <button
            type="button"
            aria-label={`Remove ${typeof label === "string" ? label : "filter"}`}
            onClick={onRemove}
            disabled={disabled}
            className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-fg-3 transition-colors duration-150 hover:bg-surface-3 hover:text-fg", focusRing, "focus-visible:ring-offset-0")}
          >
            <X />
          </button>
        </span>
      );
    }

    return (
      <Comp
        ref={ref}
        data-active={isActive || undefined}
        className={cn(
          filterChipClassName,
          "px-3",
          focusRing,
          "disabled:pointer-events-none disabled:opacity-50",
          isActive ? filterChipStateClassName.active : filterChipStateClassName.inactive,
          className,
        )}
        {...compProps}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
FilterChip.displayName = "FilterChip";

// ---------------------------------------------------------------------------------------------
// FilterMenu — a FilterChip that opens a Popover.
// ---------------------------------------------------------------------------------------------

export interface FilterMenuProps {
  label: React.ReactNode;
  /** Applied value shown on the chip; makes it active and, with `onClear`, removable. */
  value?: React.ReactNode;
  icon?: React.ReactNode;
  onClear?: () => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: PopoverContentProps["align"];
  /** Merged onto the popover panel. */
  className?: string;
  /** Merged onto the chip. */
  chipClassName?: string;
  children: React.ReactNode;
}

export function FilterMenu({ label, value, icon, onClear, open, defaultOpen, onOpenChange, align = "start", className, chipClassName, children }: FilterMenuProps) {
  const applied = value != null;
  return (
    <Popover open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <FilterChip
          label={label}
          value={value}
          icon={icon}
          active={applied}
          onRemove={applied && onClear ? onClear : undefined}
          trailing={<ChevronDown className="text-fg-3" />}
          className={chipClassName}
        />
      </PopoverTrigger>
      <PopoverContent align={align} className={cn("w-64", className)}>
        {children}
      </PopoverContent>
    </Popover>
  );
}
FilterMenu.displayName = "FilterMenu";

// ---------------------------------------------------------------------------------------------
// ViewToggle — segmented control of 2–3 icon options.
// ---------------------------------------------------------------------------------------------

export interface ViewToggleOption {
  value: string;
  icon: React.ReactNode;
  label: string;
}

export interface ViewToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  options: ViewToggleOption[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name of the group. */
  label?: string;
}

export const ViewToggle = React.forwardRef<HTMLDivElement, ViewToggleProps>(
  ({ options, value, onChange, label = "View", className, ...props }, ref) => (
    <div ref={ref} role="group" aria-label={label} className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-md bg-surface-3 p-0.5", className)} {...props}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <IconButton
            key={opt.value}
            size="sm"
            variant="ghost"
            label={opt.label}
            aria-pressed={selected}
            data-state={selected ? "on" : "off"}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-sm focus-visible:ring-offset-surface-3",
              selected ? "bg-surface text-fg shadow-ls-1 hover:bg-surface" : "text-fg-2 hover:bg-surface-3 hover:text-fg",
            )}
          >
            {opt.icon}
          </IconButton>
        );
      })}
    </div>
  ),
);
ViewToggle.displayName = "ViewToggle";

// ---------------------------------------------------------------------------------------------
// BulkBar — floats over the list while rows are selected.
// ---------------------------------------------------------------------------------------------

export interface BulkBarProps extends React.HTMLAttributes<HTMLDivElement> {
  count: number;
  /** Ghost Buttons; they are recoloured for the dark surface. */
  actions?: React.ReactNode;
  onClear: () => void;
}

export const BulkBar = React.forwardRef<HTMLDivElement, BulkBarProps>(({ count, actions, onClear, className, ...props }, ref) => {
  if (count <= 0) return null;
  return (
    <div
      ref={ref}
      role="region"
      aria-label="Selection"
      className={cn(
        "sticky bottom-4 z-sticky mx-auto flex w-fit max-w-full items-center gap-3 rounded-lg bg-surface-inverse px-4 py-2 text-sm text-fg-inverse shadow-ls-3 animate-ls-slide-in-up",
        className,
      )}
      {...props}
    >
      <span aria-live="polite" className="whitespace-nowrap font-medium tabular-nums">
        {count.toLocaleString("en-US")} selected
      </span>
      {actions ? (
        <>
          <span aria-hidden="true" className="h-4 w-px bg-ink-3" />
          <div className="flex items-center gap-1 [&_button]:text-fg-inverse [&_button:hover]:bg-ink-2 [&_button]:focus-visible:ring-offset-surface-inverse">{actions}</div>
        </>
      ) : null}
      <IconButton size="sm" variant="ghost" label="Clear selection" onClick={onClear} className="-mr-2 text-fg-inverse hover:bg-ink-2 focus-visible:ring-offset-surface-inverse">
        <X />
      </IconButton>
    </div>
  );
});
BulkBar.displayName = "BulkBar";
