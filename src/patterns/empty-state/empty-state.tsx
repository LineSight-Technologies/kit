import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, RotateCw } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/button/button";

export const emptyStateVariants = cva("flex w-full flex-col items-center justify-center gap-3 px-6 text-center", {
  variants: {
    size: {
      sm: "py-8",
      md: "py-16",
    },
  },
  defaultVariants: { size: "md" },
});

const iconFrameClassName = "flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-3 text-fg-2 [&>svg]:size-5";

export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof emptyStateVariants> {
  /** One lucide icon. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  /** One Button that teaches the next step. */
  action?: React.ReactNode;
}

/** Nothing here yet. `sm` inside panels and table bodies, `md` for whole pages. */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, action, size, className, ...props }, ref) => (
    <div ref={ref} data-size={size ?? "md"} className={cn(emptyStateVariants({ size }), className)} {...props}>
      {icon ? (
        <span aria-hidden="true" className={iconFrameClassName}>
          {icon}
        </span>
      ) : null}
      <p className="text-sm font-medium text-fg">{title}</p>
      {action ? <div className="mt-1 flex items-center gap-2">{action}</div> : null}
    </div>
  ),
);
EmptyState.displayName = "EmptyState";

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof emptyStateVariants> {
  title?: React.ReactNode;
  /** The caught value. Only an `Error` with a message renders a detail line — it is data, not copy. */
  error?: unknown;
  onRetry?: () => void;
}

function errorMessage(error: unknown): string | null {
  return error instanceof Error && error.message ? error.message : null;
}

/** Something failed. Names the problem; the only action is to try again. */
export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ title = "Something went wrong", error, onRetry, size, className, ...props }, ref) => {
    const message = errorMessage(error);
    return (
      <div ref={ref} role="alert" data-size={size ?? "md"} className={cn(emptyStateVariants({ size }), className)} {...props}>
        <span aria-hidden="true" className={cn(iconFrameClassName, "bg-danger-soft text-danger")}>
          <AlertTriangle />
        </span>
        <p className="text-sm font-medium text-fg">{title}</p>
        {message ? (
          <p className="max-w-md break-words font-mono text-xs text-fg-2" data-error-message="">{/* lint-classes-ignore */}
            {message}
          </p>
        ) : null}
        {onRetry ? (
          <div className="mt-1">
            <Button variant="secondary" leadingIcon={<RotateCw />} onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : null}
      </div>
    );
  },
);
ErrorState.displayName = "ErrorState";
