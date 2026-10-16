"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { cn } from "../../lib/cn";
import { Kbd } from "../kbd/kbd";
import { Spinner } from "../spinner/spinner";
import { overlayClass } from "../dialog/dialog";

// ---------------------------------------------------------------------------
// Raw cmdk wrappers, styled with tokens — compose these for custom palettes.
// ---------------------------------------------------------------------------

export type CommandProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive>;

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, CommandProps>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn("flex h-full w-full flex-col overflow-hidden bg-surface text-sm text-fg", className)}
    {...props}
  />
));
Command.displayName = "Command";

export type CommandInputProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>;

const CommandInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center gap-2 border-b border-line px-3" cmdk-input-wrapper="">
      <Search className="size-4 shrink-0 text-fg-3" aria-hidden="true" />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "h-12 w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-3 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
CommandInput.displayName = "CommandInput";

export type CommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, CommandListProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List
      ref={ref}
      className={cn("max-h-[min(60vh,420px)] overflow-y-auto overflow-x-hidden p-1.5", className)}
      {...props}
    />
  ),
);
CommandList.displayName = "CommandList";

export type CommandEmptyProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>;

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, CommandEmptyProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Empty ref={ref} className={cn("px-2 py-8 text-center text-sm text-fg-3", className)} {...props} />
  ),
);
CommandEmpty.displayName = "CommandEmpty";

export type CommandGroupProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>;

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, CommandGroupProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-fg-3",
        className,
      )}
      {...props}
    />
  ),
);
CommandGroup.displayName = "CommandGroup";

export type CommandSeparatorProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>;

const CommandSeparator = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Separator>, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Separator ref={ref} className={cn("-mx-1.5 my-1 h-px bg-line", className)} {...props} />
  ),
);
CommandSeparator.displayName = "CommandSeparator";

export type CommandItemProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, CommandItemProps>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg outline-none transition-colors duration-1 " +
          "data-[selected=true]:bg-surface-3 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2",
        className,
      )}
      {...props}
    />
  ),
);
CommandItem.displayName = "CommandItem";

// ---------------------------------------------------------------------------
// CommandMenu — the app's ⌘K palette, driven by data.
// ---------------------------------------------------------------------------

export interface CommandMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Display only; bind the key in the app. */
  shortcut?: string;
  /** Extra search terms (aliases, record numbers). */
  keywords?: string[];
  onSelect: () => void;
  /** Trailing detail: record type, customer, status. */
  meta?: React.ReactNode;
  disabled?: boolean;
}

export interface CommandMenuGroup {
  heading: string;
  items: CommandMenuItem[];
}

export interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommandMenuGroup[];
  /** Ids to float into a "Recent" group while the query is empty, in this order. */
  recentIds?: string[];
  /** Shows a spinner row under the input; the list still renders. */
  loading?: boolean;
  emptyText?: string;
  placeholder?: string;
  /** Called on every keystroke — wire async search here and pass results back through `groups`. */
  onQueryChange?: (query: string) => void;
  /** Set false when `groups` are already filtered server-side. */
  shouldFilter?: boolean;
  className?: string;
}

function CommandMenu({
  open,
  onOpenChange,
  groups,
  recentIds,
  loading = false,
  emptyText = "No results",
  placeholder = "Search or jump to…",
  onQueryChange,
  shouldFilter = true,
  className,
}: CommandMenuProps) {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleQuery = (q: string) => {
    setQuery(q);
    onQueryChange?.(q);
  };

  const byId = React.useMemo(() => {
    const map = new Map<string, CommandMenuItem>();
    for (const g of groups) for (const it of g.items) map.set(it.id, it);
    return map;
  }, [groups]);

  const recents =
    query === "" && recentIds?.length
      ? recentIds.map((id) => byId.get(id)).filter((it): it is CommandMenuItem => it !== undefined)
      : [];
  const recentSet = new Set(recents.map((r) => r.id));

  const select = (item: CommandMenuItem) => {
    onOpenChange(false);
    item.onSelect();
  };

  const renderItem = (item: CommandMenuItem) => (
    <CommandItem
      key={item.id}
      value={item.label}
      keywords={item.keywords}
      disabled={item.disabled}
      onSelect={() => select(item)}
    >
      {item.icon}
      <span className="flex-1 truncate">{item.label}</span>
      {item.meta !== undefined ? <span className="ml-2 shrink-0 text-xs text-fg-3">{item.meta}</span> : null}
      {item.shortcut ? <Kbd className="ml-2">{item.shortcut}</Kbd> : null}
    </CommandItem>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={cn(overlayClass, "z-dialog")} />
        <div className="fixed inset-0 z-dialog flex items-start justify-center px-4 pt-[15vh]">
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className={cn(
              "w-full max-w-xl overflow-hidden rounded-xl border border-line bg-surface shadow-ls-3 outline-none " +
                "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out",
              className,
            )}
          >
            <DialogPrimitive.Title className="sr-only">Command menu</DialogPrimitive.Title>
            <Command loop shouldFilter={shouldFilter} label="Command menu">
              <CommandInput value={query} onValueChange={handleQuery} placeholder={placeholder} autoFocus />
              {loading ? (
                <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs text-fg-3">
                  <Spinner size="sm" label="Searching" />
                  Searching…
                </div>
              ) : null}
              <CommandList>
                <CommandEmpty>{emptyText}</CommandEmpty>
                {recents.length ? <CommandGroup heading="Recent">{recents.map(renderItem)}</CommandGroup> : null}
                {groups.map((group) => {
                  const items = recentSet.size ? group.items.filter((it) => !recentSet.has(it.id)) : group.items;
                  if (!items.length) return null;
                  return (
                    <CommandGroup key={group.heading} heading={group.heading}>
                      {items.map(renderItem)}
                    </CommandGroup>
                  );
                })}
              </CommandList>
            </Command>
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
CommandMenu.displayName = "CommandMenu";

/** Binds ⌘K / Ctrl+K to toggle. `const { open, setOpen } = useCommandMenu();` */
function useCommandMenu(initialOpen = false) {
  const [open, setOpen] = React.useState(initialOpen);
  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);
  return { open, setOpen };
}

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandMenu, useCommandMenu };
