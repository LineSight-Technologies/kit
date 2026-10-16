"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { overlayClass } from "../dialog/dialog";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;
const SheetPortal = DialogPrimitive.Portal;

export type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;

const SheetOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, SheetOverlayProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={cn(overlayClass, "z-sheet", className)} {...props} />
  ),
);
SheetOverlay.displayName = "SheetOverlay";

export const sheetContentVariants = cva(
  "fixed z-sheet flex flex-col bg-surface text-fg shadow-ls-3 outline-none",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-full max-w-full border-l border-line data-[state=open]:animate-ls-slide-in-right data-[state=closed]:animate-ls-slide-out-right",
        left: "inset-y-0 left-0 h-full w-full max-w-full border-r border-line data-[state=open]:animate-ls-slide-in-left data-[state=closed]:animate-ls-slide-out-left",
        bottom:
          "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-xl border-t border-line data-[state=open]:animate-ls-slide-in-up data-[state=closed]:animate-ls-fade-out",
      },
      size: {
        sm: "",
        md: "",
        lg: "",
        xl: "",
      },
    },
    compoundVariants: [
      { side: ["right", "left"], size: "sm", className: "sm:w-[400px]" },
      { side: ["right", "left"], size: "md", className: "sm:w-[520px]" },
      { side: ["right", "left"], size: "lg", className: "sm:w-[720px]" },
      { side: ["right", "left"], size: "xl", className: "sm:w-[960px]" },
    ],
    defaultVariants: { side: "right", size: "md" },
  },
);

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetContentVariants> {}

const SheetContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, side, size, children, ...props }, ref) => (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        aria-describedby={undefined}
        data-side={side ?? "right"}
        className={cn(sheetContentVariants({ side, size }), className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </SheetPortal>
  ),
);
SheetContent.displayName = "SheetContent";

export type SheetTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;

const SheetTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("truncate text-base font-semibold leading-6 text-fg", className)} {...props} />
  ),
);
SheetTitle.displayName = "SheetTitle";

export interface SheetHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  /** Right-aligned, before the close control (status badge, ActionMenu). */
  actions?: React.ReactNode;
  hideClose?: boolean;
}

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, title, actions, hideClose = false, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex shrink-0 items-center gap-3 border-b border-line px-6 py-4", className)} {...props}>
      <SheetTitle className="min-w-0 flex-1">{title}</SheetTitle>
      {children}
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      {hideClose ? null : (
        <SheetClose asChild>
          <Button variant="ghost" size="sm" aria-label="Close" className="-mr-2 w-8 shrink-0 px-0">
            <X className="size-4" />
          </Button>
        </SheetClose>
      )}
    </div>
  ),
);
SheetHeader.displayName = "SheetHeader";

export type SheetBodyProps = React.HTMLAttributes<HTMLDivElement>;

const SheetBody = React.forwardRef<HTMLDivElement, SheetBodyProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm", className)} {...props} />
));
SheetBody.displayName = "SheetBody";

export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>;

const SheetFooter = React.forwardRef<HTMLDivElement, SheetFooterProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex shrink-0 justify-end gap-2 border-t border-line bg-surface-2 px-6 py-4", className)}
    {...props}
  />
));
SheetFooter.displayName = "SheetFooter";

export { Sheet, SheetTrigger, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose };
