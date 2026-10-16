"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

type TabsVariant = "underline" | "pill";
const TabsVariantContext = React.createContext<TabsVariant>("underline");

const Tabs = TabsPrimitive.Root;

export const tabsListVariants = cva("flex items-center", {
  variants: {
    variant: {
      underline: "gap-4 border-b border-line",
      pill: "inline-flex gap-1 rounded-md bg-surface-3 p-1",
    },
  },
  defaultVariants: { variant: "underline" },
});

export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

/** `underline` at page level, `pill` inside panels. The variant flows to each TabsTrigger through context. */
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, ...props }, ref) => {
    const resolved: TabsVariant = variant ?? "underline";
    return (
      <TabsVariantContext.Provider value={resolved}>
        <TabsPrimitive.List
          ref={ref}
          data-variant={resolved}
          className={cn(tabsListVariants({ variant: resolved }), className)}
          {...props}
        />
      </TabsVariantContext.Provider>
    );
  },
);
TabsList.displayName = "TabsList";

export const tabsTriggerVariants = cva(
  "inline-flex select-none items-center gap-1.5 whitespace-nowrap text-sm font-medium outline-none transition-colors duration-1 " +
    "focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface " +
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        underline:
          "-mb-px border-b-2 border-transparent pb-2 text-fg-2 hover:text-fg data-[state=active]:border-accent data-[state=active]:text-fg",
        pill: "rounded-sm px-3 py-1 text-fg-2 hover:text-fg data-[state=active]:bg-surface data-[state=active]:text-fg data-[state=active]:shadow-ls-1",
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Small tabular count after the label (e.g. open orders). */
  count?: number;
  icon?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, count, icon, children, ...props }, ref) => {
    const variant = React.useContext(TabsVariantContext);
    return (
      <TabsPrimitive.Trigger ref={ref} className={cn(tabsTriggerVariants({ variant }), className)} {...props}>
        {icon}
        {children}
        {count !== undefined ? (
          <span className="text-xs tabular-nums text-fg-3" data-count="">
            {count.toLocaleString("en-US")}
          </span>
        ) : null}
      </TabsPrimitive.Trigger>
    );
  },
);
TabsTrigger.displayName = "TabsTrigger";

export type TabsContentProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>;

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={cn("mt-4 outline-none", className)} {...props} />
  ),
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
