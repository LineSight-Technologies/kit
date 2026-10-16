"use client";

import * as React from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Slot } from "@radix-ui/react-slot";
import { ChevronDown, PanelLeft, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { IconButton, type IconButtonProps } from "../../primitives/icon-button/icon-button";
import { Tooltip, TooltipProvider } from "../../primitives/tooltip/tooltip";
import { Toaster } from "../../primitives/toast/toast";
import { Sheet, SheetContent, SheetTitle } from "../../primitives/sheet/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  menuItemClass,
} from "../../primitives/dropdown-menu/dropdown-menu";

// ---------------------------------------------------------------------------------------------
// AppShell — the one frame per app. Sidebar column + scrolling <main>; mounts TooltipProvider
// and Toaster once; owns the collapsed / mobile-drawer state.
// ---------------------------------------------------------------------------------------------

export const SIDEBAR_STORAGE_KEY = "ls:sidebar-collapsed";
const DESKTOP_QUERY = "(min-width: 768px)";

export type AppShellLayout = "auto" | "mobile";

export interface AppShellContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  /** `auto` follows the md breakpoint; `mobile` always shows the drawer layout. */
  layout: AppShellLayout;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

/** Collapsed / drawer state of the surrounding `AppShell`. Throws outside one. */
export function useAppShell(): AppShellContextValue {
  const ctx = React.useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShell>");
  return ctx;
}

/** Same as `useAppShell`, but `null` when there is no shell (patterns that work with or without one). */
export function useAppShellOptional(): AppShellContextValue | null {
  return React.useContext(AppShellContext);
}

function readStored(key: string): boolean | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? null : raw === "1";
  } catch {
    return null;
  }
}

function writeStored(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* storage unavailable (private mode, SSR) — state still works in memory */
  }
}

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** A `Sidebar`. */
  sidebar: React.ReactNode;
  /** A `CommandMenu`, mounted once here so ⌘K works everywhere. */
  commandMenu?: React.ReactNode;
  /** Initial collapsed state before (or without) a stored value. */
  defaultCollapsed?: boolean;
  /** localStorage key for the collapsed state. `null` disables persistence. */
  storageKey?: string | null;
  /** `mobile` forces the drawer layout regardless of viewport width. */
  layout?: AppShellLayout;
  /** Mount the kit `Toaster`. Turn off only if the app already mounts one. */
  toaster?: boolean;
  children: React.ReactNode;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  (
    {
      sidebar,
      commandMenu,
      defaultCollapsed = false,
      storageKey = SIDEBAR_STORAGE_KEY,
      layout = "auto",
      toaster = true,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [collapsed, setCollapsedState] = React.useState(defaultCollapsed);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    // Read after mount so server and first client render agree.
    React.useEffect(() => {
      if (!storageKey) return;
      const stored = readStored(storageKey);
      if (stored !== null) setCollapsedState(stored);
    }, [storageKey]);

    const setCollapsed = React.useCallback(
      (next: boolean) => {
        setCollapsedState(next);
        if (storageKey) writeStored(storageKey, next);
      },
      [storageKey],
    );

    const value = React.useMemo<AppShellContextValue>(
      () => ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, layout }),
      [collapsed, setCollapsed, mobileOpen, layout],
    );

    return (
      <AppShellContext.Provider value={value}>
        <TooltipProvider>
          <div
            ref={ref}
            data-collapsed={collapsed || undefined}
            data-layout={layout}
            className={cn("flex h-dvh w-full overflow-hidden bg-surface text-fg", className)}
            {...props}
          >
            {sidebar}
            <div className="flex min-w-0 flex-1 flex-col">
              <div
                className={cn(
                  "flex h-12 shrink-0 items-center border-b border-line bg-surface px-3",
                  layout === "auto" && "md:hidden",
                )}
              >
                <SidebarTrigger mode="drawer" />
              </div>
              <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</main>
            </div>
            {commandMenu}
            {toaster ? <Toaster /> : null}
          </div>
        </TooltipProvider>
      </AppShellContext.Provider>
    );
  },
);
AppShell.displayName = "AppShell";

// ---------------------------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------------------------

interface SidebarContextValue {
  collapsed: boolean;
  /** Rendered inside the mobile drawer: always expanded, closes on navigation. */
  inDrawer: boolean;
}
const SidebarContext = React.createContext<SidebarContextValue>({ collapsed: false, inDrawer: false });

/** `{ collapsed, inDrawer }` of the surrounding `Sidebar`, for brand and footer slots that adapt to the rail. */
export function useSidebar(): SidebarContextValue {
  return React.useContext(SidebarContext);
}

/** Items in a collapsed `SidebarGroup` render as menu rows instead of nav rows. */
const GroupMenuContext = React.createContext(false);

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Logo slot, top. */
  brand: React.ReactNode;
  /** Shown instead of `brand` on the collapsed rail (a logo mark). Defaults to `brand`. */
  mark?: React.ReactNode;
  /** Nav: `SidebarNav`, `SidebarGroup`, `SidebarSeparator`. */
  children: React.ReactNode;
  /** User menu slot, bottom. */
  footer?: React.ReactNode;
}

function SidebarFrame({
  brand,
  mark,
  footer,
  children,
  collapsed,
  inDrawer,
  onClose,
}: Pick<SidebarProps, "brand" | "mark" | "footer" | "children"> & {
  collapsed: boolean;
  inDrawer: boolean;
  onClose?: () => void;
}) {
  return (
    <SidebarContext.Provider value={{ collapsed, inDrawer }}>
      <div className={cn("flex h-14 shrink-0 items-center gap-2 px-3", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <div className="flex items-center justify-center">{mark ?? brand}</div>
        ) : (
          <>
            <div className="flex min-w-0 flex-1 items-center">{brand}</div>
            {inDrawer ? (
              <IconButton variant="ghost" size="sm" label="Close navigation" tooltip={false} onClick={onClose}>
                <X />
              </IconButton>
            ) : (
              <SidebarTrigger mode="collapse" size="sm" />
            )}
          </>
        )}
      </div>
      <div className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden py-2", collapsed ? "px-3" : "px-2")}>
        {children}
      </div>
      {collapsed ? (
        <div className="flex shrink-0 justify-center py-2">
          <SidebarTrigger mode="collapse" size="sm" />
        </div>
      ) : null}
      {footer ? <div className={cn("shrink-0 border-t border-line p-2", collapsed && "flex justify-center px-3")}>{footer}</div> : null}
    </SidebarContext.Provider>
  );
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ brand, mark, footer, children, className, ...props }, ref) => {
    const shell = useAppShell();
    const desktopHidden = shell.layout === "mobile";

    return (
      <>
        <aside
          ref={ref}
          data-collapsed={shell.collapsed || undefined}
          className={cn(
            "h-full shrink-0 flex-col border-r border-line bg-surface-2 transition-[width] duration-200 ease-ls-out",
            desktopHidden ? "hidden" : "hidden md:flex",
            shell.collapsed ? "w-rail" : "w-sidebar",
            className,
          )}
          {...props}
        >
          <SidebarFrame brand={brand} mark={mark} footer={footer} collapsed={shell.collapsed} inDrawer={false}>
            {children}
          </SidebarFrame>
        </aside>
        <Sheet open={shell.mobileOpen} onOpenChange={shell.setMobileOpen}>
          <SheetContent side="left" size="sm" className="w-sidebar max-w-[85vw] bg-surface-2 p-0 sm:w-sidebar">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SidebarFrame brand={brand} mark={mark} footer={footer} collapsed={false} inDrawer onClose={() => shell.setMobileOpen(false)}>
              {children}
            </SidebarFrame>
          </SheetContent>
        </Sheet>
      </>
    );
  },
);
Sidebar.displayName = "Sidebar";

// ---------------------------------------------------------------------------------------------
// SidebarNav / SidebarItem / SidebarGroup / SidebarSeparator / SidebarTrigger
// ---------------------------------------------------------------------------------------------

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name of the landmark. */
  label?: string;
}

export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(({ className, label = "Main", ...props }, ref) => (
  <nav ref={ref} aria-label={label} className={cn("flex flex-col gap-0.5", className)} {...props} />
));
SidebarNav.displayName = "SidebarNav";

export const sidebarItemClassName =
  "group flex h-9 w-full select-none items-center gap-2.5 rounded-md px-2.5 text-sm font-medium outline-none transition-colors duration-150 " +
  "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 " +
  "disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0";

const sidebarItemStateClassName = {
  active: "bg-surface text-fg shadow-ls-1",
  inactive: "text-fg-2 hover:bg-surface-3 hover:text-fg",
} as const;

export interface SidebarItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick" | "onSelect"> {
  /** One lucide icon. */
  icon: React.ReactNode;
  label: string;
  /** Renders an `<a>`. For router links use `asChild` with the Link as the child. */
  href?: string;
  /** The single child (e.g. a router `Link`) becomes the element; its children are replaced by the icon, label and count. */
  asChild?: boolean;
  active?: boolean;
  /** Tabular count, right-aligned. Hidden on the collapsed rail. */
  count?: number;
  onClick?: React.MouseEventHandler<HTMLElement>;
  disabled?: boolean;
}

export const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(
  ({ icon, label, href, asChild = false, active = false, count, onClick, disabled, className, children, ...props }, ref) => {
    const shell = useAppShellOptional();
    const { collapsed, inDrawer } = useSidebar();
    const inMenu = React.useContext(GroupMenuContext);
    const iconOnly = collapsed && !inMenu;

    const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
      onClick?.(e);
      if (inDrawer && shell && !e.defaultPrevented) shell.setMobileOpen(false);
    };

    const countNode =
      count !== undefined ? (
        <span data-count="" className="ml-auto text-xs tabular-nums text-fg-3">
          {count.toLocaleString("en-US")}
        </span>
      ) : null;

    const inner = iconOnly ? (
      <>
        {icon}
        <span className="sr-only">{label}</span>
      </>
    ) : (
      <>
        {icon}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {countNode}
      </>
    );

    const shared = {
      "aria-current": active ? ("page" as const) : undefined,
      "data-active": active || undefined,
      onClick: handleClick,
      ...props,
    };

    // Collapsed group flyout: the item is a menu row.
    if (inMenu) {
      const rowClass = cn(menuItemClass, active && "bg-surface-3 text-fg", className);
      if (asChild) {
        const child = React.Children.only(children) as React.ReactElement;
        return (
          <MenuPrimitive.Item ref={ref as React.Ref<HTMLDivElement>} asChild disabled={disabled} className={rowClass} {...shared}>
            {React.cloneElement(child, undefined, inner)}
          </MenuPrimitive.Item>
        );
      }
      if (href) {
        return (
          <MenuPrimitive.Item ref={ref as React.Ref<HTMLDivElement>} asChild disabled={disabled} className={rowClass} {...shared}>
            <a href={href}>{inner}</a>
          </MenuPrimitive.Item>
        );
      }
      return (
        <MenuPrimitive.Item ref={ref as React.Ref<HTMLDivElement>} disabled={disabled} className={rowClass} {...shared}>
          {inner}
        </MenuPrimitive.Item>
      );
    }

    const classes = cn(
      sidebarItemClassName,
      active ? sidebarItemStateClassName.active : sidebarItemStateClassName.inactive,
      iconOnly && "w-10 justify-center px-0",
      disabled && "pointer-events-none opacity-50",
      className,
    );

    let element: React.ReactElement;
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement;
      element = (
        <Slot ref={ref} className={classes} aria-disabled={disabled || undefined} {...shared}>
          {React.cloneElement(child, undefined, inner)}
        </Slot>
      );
    } else if (href) {
      element = (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} aria-disabled={disabled || undefined} {...shared}>
          {inner}
        </a>
      );
    } else {
      element = (
        <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={classes} disabled={disabled} {...shared}>
          {inner}
        </button>
      );
    }

    return iconOnly ? (
      <Tooltip content={label} side="right">
        {element}
      </Tooltip>
    ) : (
      element
    );
  },
);
SidebarItem.displayName = "SidebarItem";

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  /** Icon for the collapsed rail, where the group becomes one icon with a flyout. */
  icon: React.ReactNode;
  defaultOpen?: boolean;
  /** Persist open/closed in localStorage under this key. */
  storageKey?: string;
  children: React.ReactNode;
}

export const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ label, icon, defaultOpen = true, storageKey, children, className, ...props }, ref) => {
    const { collapsed } = useSidebar();
    const id = React.useId();
    const [open, setOpenState] = React.useState(defaultOpen);

    React.useEffect(() => {
      if (!storageKey) return;
      const stored = readStored(storageKey);
      if (stored !== null) setOpenState(stored);
    }, [storageKey]);

    const setOpen = (next: boolean) => {
      setOpenState(next);
      if (storageKey) writeStored(storageKey, next);
    };

    if (collapsed) {
      return (
        <div ref={ref} className={cn("flex justify-center", className)} {...props}>
          <DropdownMenu>
            <Tooltip content={label} side="right">
              <DropdownMenuTrigger
                className={cn(sidebarItemClassName, sidebarItemStateClassName.inactive, "w-10 justify-center px-0 data-[state=open]:bg-surface-3 data-[state=open]:text-fg")}
                aria-label={label}
              >
                {icon}
              </DropdownMenuTrigger>
            </Tooltip>
            <DropdownMenuContent side="right" align="start" sideOffset={10} className="min-w-48">
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
              <GroupMenuContext.Provider value={true}>{children}</GroupMenuContext.Provider>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("flex flex-col gap-0.5", className)} {...props}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="flex h-8 w-full items-center gap-2.5 rounded-md px-2.5 text-xs font-medium text-fg-3 outline-none transition-colors duration-150 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2"
        >
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          <ChevronDown aria-hidden="true" className={cn("size-4 shrink-0 transition-transform duration-150 ease-ls-out", !open && "-rotate-90")} />
        </button>
        {open ? (
          <div id={id} className="flex flex-col gap-0.5">
            {children}
          </div>
        ) : null}
      </div>
    );
  },
);
SidebarGroup.displayName = "SidebarGroup";

export type SidebarSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

export const SidebarSeparator = React.forwardRef<HTMLDivElement, SidebarSeparatorProps>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" aria-orientation="horizontal" className={cn("my-1 h-px shrink-0 bg-line", className)} {...props} />
));
SidebarSeparator.displayName = "SidebarSeparator";

export interface SidebarTriggerProps extends Omit<IconButtonProps, "label" | "children"> {
  label?: string;
  /** `auto` collapses on md and up and opens the drawer below it. */
  mode?: "auto" | "collapse" | "drawer";
}

/** PanelLeft control: collapses the sidebar on desktop, opens the drawer on mobile. */
export const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ label, mode = "auto", onClick, variant = "ghost", className, ...props }, ref) => {
    const shell = useAppShell();
    const resolve = () => {
      if (mode !== "auto") return mode;
      if (shell.layout === "mobile") return "drawer";
      return typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches ? "collapse" : "drawer";
    };
    const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      onClick?.(e);
      if (e.defaultPrevented) return;
      if (resolve() === "collapse") shell.setCollapsed(!shell.collapsed);
      else shell.setMobileOpen(!shell.mobileOpen);
    };
    const name = label ?? (mode === "drawer" ? "Open navigation" : shell.collapsed ? "Expand sidebar" : "Collapse sidebar");
    return (
      <IconButton
        ref={ref}
        variant={variant}
        label={name}
        aria-expanded={mode === "drawer" ? shell.mobileOpen : !shell.collapsed}
        className={cn("text-fg-2", className)}
        onClick={handleClick}
        {...props}
      >
        <PanelLeft />
      </IconButton>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";
