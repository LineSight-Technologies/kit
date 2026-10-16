"use client";

import * as React from "react";
import { Toaster as SonnerToaster, toast, type ToasterProps as SonnerToasterProps } from "sonner";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "../../lib/cn";
import { toneText } from "../../lib/tone";
import { Spinner } from "../spinner/spinner";

export type ToasterProps = SonnerToasterProps;

/** Mount once, in the app shell. Bottom-right; kit chrome; rich colours off (tones come from the icons). */
function Toaster({ toastOptions, className, style, ...props }: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors={false}
      closeButton={false}
      gap={8}
      offset={16}
      visibleToasts={4}
      className={cn("font-sans", className)}
      style={{ zIndex: "var(--ls-z-toast)", ...style } as React.CSSProperties}
      icons={{
        success: <CheckCircle2 className={cn("size-4", toneText.success)} />,
        error: <XCircle className={cn("size-4", toneText.danger)} />,
        warning: <AlertTriangle className={cn("size-4", toneText.warn)} />,
        info: <Info className={cn("size-4", toneText.info)} />,
        loading: <Spinner size="md" className="text-fg-3" />,
      }}
      toastOptions={{
        duration: 4000,
        unstyled: true,
        ...toastOptions,
        classNames: {
          toast:
            "flex w-[356px] max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-fg shadow-ls-3",
          icon: "flex size-4 shrink-0 items-center justify-center",
          content: "flex min-w-0 flex-1 flex-col gap-0.5",
          title: "font-medium text-fg",
          description: "text-fg-2",
          actionButton:
            "ml-2 inline-flex h-7 shrink-0 items-center rounded-md bg-ink px-2.5 text-xs font-medium text-fg-inverse transition-colors duration-150 hover:bg-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          cancelButton:
            "ml-2 inline-flex h-7 shrink-0 items-center rounded-md px-2.5 text-xs font-medium text-fg-2 transition-colors duration-150 hover:bg-surface-3 outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          closeButton: "text-fg-3 hover:text-fg",
          ...toastOptions?.classNames,
        },
      }}
      {...props}
    />
  );
}
Toaster.displayName = "Toaster";

export interface NotifyOptions {
  /** One action, e.g. Undo. */
  action?: { label: string; onClick: () => void };
  /** Stable id to update a previous toast in place. */
  id?: string | number;
  duration?: number;
}

function toSonner(opts?: NotifyOptions) {
  if (!opts) return undefined;
  const { action, ...rest } = opts;
  return { ...rest, action: action ? { label: action.label, onClick: action.onClick } : undefined };
}

export interface NotifyPromiseMessages<T> {
  loading: string;
  success: string | ((value: T) => string);
  error: string | ((error: unknown) => string);
}

/** Thin, typed wrapper over sonner for the three things screens actually do. */
export const notify = {
  success: (message: string, opts?: NotifyOptions) => toast.success(message, toSonner(opts)),
  error: (message: string, opts?: NotifyOptions) => toast.error(message, toSonner(opts)),
  info: (message: string, opts?: NotifyOptions) => toast.info(message, toSonner(opts)),
  warning: (message: string, opts?: NotifyOptions) => toast.warning(message, toSonner(opts)),
  loading: (message: string, opts?: Pick<NotifyOptions, "id">) => toast.loading(message, opts),
  promise: <T,>(promise: Promise<T>, messages: NotifyPromiseMessages<T>) => toast.promise(promise, messages),
  dismiss: (id?: string | number) => toast.dismiss(id),
};

export { Toaster, toast };
