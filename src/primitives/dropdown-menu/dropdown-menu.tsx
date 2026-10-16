"use client";

import * as React from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Kbd } from "../kbd/kbd";

const DropdownMenu = MenuPrimitive.Root;
const DropdownMenuTrigger = MenuPrimitive.Trigger;
const DropdownMenuGroup = MenuPrimitive.Group;
const DropdownMenuSub = MenuPrimitive.Sub;
const DropdownMenuRadioGroup = MenuPrimitive.RadioGroup;

/** Menu panel chrome, shared by content and sub-content. */
export const menuContentClass =
  "z-dropdown min-w-44 overflow-hidden rounded-lg border border-line bg-surface p-1 text-sm text-fg shadow-ls-2 outline-none " +
  "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out";

/** Row chrome shared by item, checkbox item, radio item and sub trigger. */
export const menuItemClass =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg outline-none transition-colors duration-1 " +
  "data-[highlighted]:bg-surface-3 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-2";

const menuItemDestructiveClass =
  "text-danger data-[highlighted]:bg-danger-soft data-[highlighted]:text-danger [&_svg]:text-danger";

export type DropdownMenuContentProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>;

const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Content>, DropdownMenuContentProps>(
  ({ className, sideOffset = 6, align = "end", ...props }, ref) => (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(menuContentClass, className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";

export interface DropdownMenuItemProps extends React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> {
  /** Leading lucide icon. */
  icon?: React.ReactNode;
  /** Keyboard shortcut, right-aligned as a Kbd. Display only — bind the key yourself. */
  shortcut?: string;
  /** Danger tone. Put destructive items last. */
  destructive?: boolean;
}

const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Item>, DropdownMenuItemProps>(
  ({ className, icon, shortcut, destructive = false, children, ...props }, ref) => (
    <MenuPrimitive.Item
      ref={ref}
      data-destructive={destructive ? "" : undefined}
      className={cn(menuItemClass, destructive && menuItemDestructiveClass, className)}
      {...props}
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      {shortcut ? <Kbd className="ml-4">{shortcut}</Kbd> : null}
    </MenuPrimitive.Item>
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export type DropdownMenuCheckboxItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenuPrimitive.CheckboxItem>,
  DropdownMenuCheckboxItemProps
>(({ className, children, ...props }, ref) => (
  <MenuPrimitive.CheckboxItem ref={ref} className={cn(menuItemClass, "pl-8", className)} {...props}>
    <span className="absolute left-2 flex size-4 items-center justify-center">
      <MenuPrimitive.ItemIndicator>
        <Check className="size-4" />
      </MenuPrimitive.ItemIndicator>
    </span>
    {children}
  </MenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export type DropdownMenuRadioItemProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>;

const DropdownMenuRadioItem = React.forwardRef<React.ElementRef<typeof MenuPrimitive.RadioItem>, DropdownMenuRadioItemProps>(
  ({ className, children, ...props }, ref) => (
    <MenuPrimitive.RadioItem ref={ref} className={cn(menuItemClass, "pl-8", className)} {...props}>
      <span className="absolute left-2 flex size-4 items-center justify-center">
        <MenuPrimitive.ItemIndicator>
          <Circle className="size-2 fill-current text-fg" />
        </MenuPrimitive.ItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  ),
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export type DropdownMenuLabelProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Label>;

/** Group label. Plain text-xs — no uppercase, no tracking. */
const DropdownMenuLabel = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Label>, DropdownMenuLabelProps>(
  ({ className, ...props }, ref) => (
    <MenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-xs text-fg-3", className)} {...props} />
  ),
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

export type DropdownMenuSeparatorProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>;

const DropdownMenuSeparator = React.forwardRef<React.ElementRef<typeof MenuPrimitive.Separator>, DropdownMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <MenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-line", className)} {...props} />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export interface DropdownMenuSubTriggerProps extends React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger> {
  icon?: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<React.ElementRef<typeof MenuPrimitive.SubTrigger>, DropdownMenuSubTriggerProps>(
  ({ className, icon, children, ...props }, ref) => (
    <MenuPrimitive.SubTrigger
      ref={ref}
      className={cn(menuItemClass, "data-[state=open]:bg-surface-3", className)}
      {...props}
    >
      {icon}
      <span className="flex-1 truncate">{children}</span>
      <ChevronRight className="ml-4" />
    </MenuPrimitive.SubTrigger>
  ),
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export type DropdownMenuSubContentProps = React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>;

const DropdownMenuSubContent = React.forwardRef<React.ElementRef<typeof MenuPrimitive.SubContent>, DropdownMenuSubContentProps>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent ref={ref} sideOffset={sideOffset} className={cn(menuContentClass, className)} {...props} />
    </MenuPrimitive.Portal>
  ),
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

// ---------------------------------------------------------------------------
// ActionMenu — the row / overflow menu as data.
// ---------------------------------------------------------------------------

export interface ActionMenuAction {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}
export interface ActionMenuSeparator {
  separator: true;
}
export type ActionMenuItem = ActionMenuAction | ActionMenuSeparator;

export interface ActionMenuProps {
  items: ActionMenuItem[];
  /** Defaults to a ghost ellipsis icon button labelled "Actions". */
  trigger?: React.ReactNode;
  align?: DropdownMenuContentProps["align"];
  /** Accessible name for the default trigger. */
  label?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

function ActionMenu({ items, trigger, align = "end", label = "Actions", open, onOpenChange, className }: ActionMenuProps) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" aria-label={label} className="w-8 px-0">
            <MoreHorizontal className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={className}>
        {items.map((item, i) =>
          "separator" in item ? (
            <DropdownMenuSeparator key={`sep-${i}`} />
          ) : (
            <DropdownMenuItem
              key={item.label}
              icon={item.icon}
              shortcut={item.shortcut}
              destructive={item.destructive}
              disabled={item.disabled}
              onSelect={() => item.onSelect()}
            >
              {item.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
ActionMenu.displayName = "ActionMenu";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  ActionMenu,
};
