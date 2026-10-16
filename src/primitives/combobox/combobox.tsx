"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronsUpDown, Plus, Search, X } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";
import { controlVariants, type ControlSize } from "../input/input";
import { Spinner } from "../spinner/spinner";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Right-aligned detail in the list: a code, a city, a badge. */
  meta?: ReactNode;
  /** Extra search terms beyond the label. */
  keywords?: string[];
  disabled?: boolean;
}

interface ComboboxBaseProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "children"> {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  emptyText?: string;
  /** Replaces the list with a spinner while async options load. */
  loading?: boolean;
  /** Async option loading. Called 200 ms after the user stops typing, and with "" when the list opens. */
  onSearch?: (query: string) => void;
  /** Offers a "Create “query”" row when the typed text matches no option label. */
  onCreate?: (query: string) => void;
  size?: ControlSize;
  disabled?: boolean;
  /** Shows a clear button when something is selected. */
  clearable?: boolean;
  /** Submits the selection in a plain form (hidden input). */
  name?: string;
  /** Chips shown before collapsing into "+N" (multiple only). */
  maxChips?: number;
  required?: boolean;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export interface ComboboxMultipleProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  onChange?: (value: string[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps;

/** Internal: the union collapsed so one implementation can destructure it. */
type LooseProps = ComboboxBaseProps & {
  multiple?: boolean;
  value?: string | string[] | null;
  onChange?: (value: never) => void;
};

const sizeHeight: Record<ControlSize, { single: string; multi: string }> = {
  sm: { single: "h-control-sm", multi: "min-h-[var(--ls-control-sm)] py-1" },
  md: { single: "h-control", multi: "min-h-control py-1" },
  lg: { single: "h-control-lg", multi: "min-h-[var(--ls-control-lg)] py-1.5" },
};

const SEARCH_DEBOUNCE_MS = 200;

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>((props, ref) => {
  const {
    options,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyText = "No matches",
    loading = false,
    onSearch,
    onCreate,
    size = "md",
    disabled = false,
    clearable = false,
    name,
    maxChips = 3,
    className,
    multiple,
    value,
    onChange,
    required: _required,
    onKeyDown,
    ...rest
  } = props as LooseProps;

  const aria = useFieldControl(props);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo<string[]>(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return typeof value === "string" && value !== "" ? [value] : [];
  }, [multiple, value]);

  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options]);

  const emit = useCallback(
    (next: string[]) => {
      const fire = onChange as ((v: string[] | string | null) => void) | undefined;
      if (multiple) fire?.(next);
      else fire?.(next[0] ?? null);
    },
    [multiple, onChange],
  );

  const toggle = (v: string) => {
    if (multiple) {
      emit(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
    } else {
      emit(selected[0] === v && clearable ? [] : [v]);
      setOpen(false);
    }
  };

  const remove = (v: string, e?: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    emit(selected.filter((s) => s !== v));
  };

  // Async search: debounced on typing, immediate "" when the list opens.
  useEffect(() => {
    if (!open || !onSearch) return;
    const t = setTimeout(() => onSearch(query), query === "" ? 0 : SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [open, query, onSearch]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const trimmed = query.trim();
  const showCreate =
    Boolean(onCreate) &&
    trimmed !== "" &&
    !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || disabled) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    } else if (multiple && e.key === "Backspace" && selected.length) {
      emit(selected.slice(0, -1));
    }
  };

  const visibleChips = selected.slice(0, maxChips);
  const overflow = selected.length - visibleChips.length;
  const hasValue = selected.length > 0;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <div
          ref={ref}
          role="combobox"
          tabIndex={disabled ? -1 : 0}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={disabled || undefined}
          data-disabled={disabled || undefined}
          data-placeholder={hasValue ? undefined : ""}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 text-left",
            controlVariants({ size }),
            multiple ? sizeHeight[size].multi : sizeHeight[size].single,
            "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            "data-[placeholder]:text-fg-3",
            className,
          )}
          {...rest}
          {...aria}
        >
          <span className={cn("flex min-w-0 flex-1 items-center gap-1", multiple ? "flex-wrap" : "truncate")}>
            {!hasValue && <span className="truncate">{placeholder}</span>}
            {hasValue && !multiple && <span className="truncate">{byValue.get(selected[0]!)?.label ?? selected[0]}</span>}
            {hasValue &&
              multiple &&
              visibleChips.map((v) => (
                <span
                  key={v}
                  className="inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-surface-3 pl-2 pr-1 text-xs text-fg"
                >
                  <span className="truncate">{byValue.get(v)?.label ?? v}</span>
                  {!disabled && (
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={`Remove ${byValue.get(v)?.label ?? v}`}
                      onClick={(e) => remove(v, e)}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="inline-flex size-4 items-center justify-center rounded-sm text-fg-3 transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </span>
              ))}
            {overflow > 0 && (
              <span className="inline-flex h-6 items-center rounded-sm bg-surface-3 px-2 text-xs text-fg-2">+{overflow}</span>
            )}
          </span>
          {clearable && hasValue && !disabled && (
            <button
              type="button"
              tabIndex={-1}
              aria-label="Clear"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                emit([]);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-fg-3 transition-colors duration-150 hover:text-fg"
            >
              <X className="size-4" />
            </button>
          )}
          <ChevronsUpDown className="size-4 shrink-0 text-fg-3" />
          {name &&
            (multiple ? (
              selected.map((v) => <input key={v} type="hidden" name={name} value={v} />)
            ) : (
              <input type="hidden" name={name} value={selected[0] ?? ""} />
            ))}
        </div>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "z-dropdown w-[var(--radix-popover-trigger-width)] min-w-[12rem] overflow-hidden rounded-lg border border-line bg-surface p-0 text-fg shadow-ls-2",
            "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out",
          )}
        >
          <CommandPrimitive shouldFilter={!onSearch} loop className="flex flex-col">
            <div className="flex items-center gap-2 border-b border-line px-3">
              <Search className="size-4 shrink-0 text-fg-3" />
              <CommandPrimitive.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder={searchPlaceholder}
                className="h-control w-full min-w-0 bg-transparent text-sm text-fg outline-none placeholder:text-fg-3"
              />
            </div>
            <CommandPrimitive.List className="max-h-72 overflow-auto p-1">
              {loading && (
                // Not cmdk's Loading: it renders role="progressbar", which LineSight bans.
                <div className="flex items-center justify-center py-6 text-fg-3">
                  <Spinner size="md" label="Loading" />
                </div>
              )}
              {!loading && !showCreate && (
                <CommandPrimitive.Empty className="py-6 text-center text-sm text-fg-3">{emptyText}</CommandPrimitive.Empty>
              )}
              {!loading &&
                options.map((o) => {
                  const isSelected = selected.includes(o.value);
                  return (
                    <CommandPrimitive.Item
                      key={o.value}
                      value={o.value}
                      keywords={[o.label, ...(o.keywords ?? [])]}
                      disabled={o.disabled}
                      onSelect={() => toggle(o.value)}
                      aria-selected={isSelected}
                      className={cn(
                        "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-2 text-sm text-fg outline-none",
                        "data-[selected=true]:bg-surface-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
                      )}
                    >
                      <Check className={cn("size-4 shrink-0", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      {o.meta != null && <span className="shrink-0 text-xs text-fg-3">{o.meta}</span>}
                    </CommandPrimitive.Item>
                  );
                })}
              {!loading && showCreate && (
                <CommandPrimitive.Item
                  forceMount
                  value={`__create__ ${trimmed}`}
                  onSelect={() => {
                    onCreate?.(trimmed);
                    setOpen(false);
                  }}
                  className={cn(
                    "relative flex cursor-default select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-2 text-sm text-fg outline-none",
                    "data-[selected=true]:bg-surface-3",
                  )}
                >
                  <Plus className="size-4 shrink-0 text-fg-3" />
                  <span className="min-w-0 flex-1 truncate">Create &ldquo;{trimmed}&rdquo;</span>
                </CommandPrimitive.Item>
              )}
            </CommandPrimitive.List>
          </CommandPrimitive>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
});
Combobox.displayName = "Combobox";
