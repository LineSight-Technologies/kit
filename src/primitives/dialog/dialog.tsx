"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

/** Backdrop shared by Dialog, Sheet and CommandMenu. Dimmed ember, slight blur. */
export const overlayClass =
  "fixed inset-0 bg-[rgba(18,6,4,0.55)] backdrop-blur-[2px] data-[state=open]:animate-ls-fade-in data-[state=closed]:animate-ls-fade-out"; // lint-classes-ignore

export type DialogOverlayProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>;

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, DialogOverlayProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay ref={ref} className={cn(overlayClass, "z-dialog", className)} {...props} />
  ),
);
DialogOverlay.displayName = "DialogOverlay";

export const dialogContentVariants = cva(
  "relative flex w-full flex-col rounded-xl border border-line bg-surface text-fg shadow-ls-3 outline-none " +
    "data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out",
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Drop the top-right close control (only when the footer offers an explicit way out). */
  hideClose?: boolean;
}

/**
 * Centered panel. Positioned by a flex wrapper rather than translate utilities so the scale-in
 * keyframes do not fight `transform` under Tailwind v3.
 */
const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
  ({ className, size, hideClose = false, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-dialog flex items-center justify-center p-4">
        <DialogPrimitive.Content
          ref={ref}
          aria-describedby={undefined}
          className={cn(dialogContentVariants({ size }), className)}
          {...props}
        >
          {children}
          {hideClose ? null : (
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="sm" aria-label="Close" className="absolute right-3 top-3 w-8 px-0">
                <X className="size-4" />
              </Button>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  ),
);
DialogContent.displayName = "DialogContent";

export type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 px-6 pb-3 pt-5 pr-14", className)} {...props} />
));
DialogHeader.displayName = "DialogHeader";

export type DialogTitleProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>;

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, DialogTitleProps>(
  ({ className, ...props }, ref) => (
    <DialogPrimitive.Title ref={ref} className={cn("text-base font-semibold leading-6 text-fg", className)} {...props} />
  ),
);
DialogTitle.displayName = "DialogTitle";

export type DialogBodyProps = React.HTMLAttributes<HTMLDivElement>;

const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("max-h-[70vh] overflow-y-auto px-6 py-2 text-sm text-fg-2", className)} {...props} />
));
DialogBody.displayName = "DialogBody";

export type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-2 flex justify-end gap-2 rounded-b-xl border-t border-line bg-surface-2 px-6 py-4", className)}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

export { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, DialogClose };
