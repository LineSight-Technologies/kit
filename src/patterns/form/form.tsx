"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/button/button";

/* ------------------------------------------------------------------------------------------------ */
/* Form + busy context                                                                               */
/* ------------------------------------------------------------------------------------------------ */

const FormBusyContext = React.createContext(false);

/** True while the enclosing `Form` is submitting. `FormActions` reads it; custom controls can too. */
export function useFormBusy(): boolean {
  return React.useContext(FormBusyContext);
}

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /** Called with default prevented. Return a promise and the form is busy until it settles. */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void | Promise<unknown>;
  /** Force the busy state (e.g. a mutation tracked outside the form). */
  busy?: boolean;
}

/** `<form noValidate>` that prevents default, runs `onSubmit`, and shares a busy flag with `FormActions`. */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, onSubmit, busy: busyProp, children, ...props }, ref) => {
    const [pending, setPending] = React.useState(false);
    const busy = busyProp ?? pending;
    const alive = React.useRef(true);
    React.useEffect(() => {
      alive.current = true;
      return () => {
        alive.current = false;
      };
    }, []);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (busy) return;
      const result = onSubmit?.(event);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        setPending(true);
        (result as Promise<unknown>).finally(() => {
          if (alive.current) setPending(false);
        });
      }
    };

    return (
      <FormBusyContext.Provider value={busy}>
        <form
          ref={ref}
          noValidate
          aria-busy={busy || undefined}
          onSubmit={handleSubmit}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          {children}
        </form>
      </FormBusyContext.Provider>
    );
  },
);
Form.displayName = "Form";

/* ------------------------------------------------------------------------------------------------ */
/* FormSection                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

export interface FormSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
}

/** Titled group of rows. Sections stack with a hairline between them; the first has none. */
export const FormSection = React.forwardRef<HTMLElement, FormSectionProps>(({ className, title, children, ...props }, ref) => (
  <section
    ref={ref}
    className={cn("flex flex-col gap-4 border-t border-line pt-6 first:border-t-0 first:pt-0", className)}
    {...props}
  >
    {title != null ? <h2 className="text-sm font-semibold leading-5 text-fg">{title}</h2> : null}
    {children}
  </section>
));
FormSection.displayName = "FormSection";

/* ------------------------------------------------------------------------------------------------ */
/* FormRow                                                                                           */
/* ------------------------------------------------------------------------------------------------ */

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fields per row at `sm` and up; always one column below. */
  columns?: 1 | 2 | 3;
}

const rowColumns: Record<NonNullable<FormRowProps["columns"]>, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
};

export const FormRow = React.forwardRef<HTMLDivElement, FormRowProps>(({ className, columns = 1, ...props }, ref) => (
  <div ref={ref} data-columns={columns} className={cn("grid gap-4", rowColumns[columns], className)} {...props} />
));
FormRow.displayName = "FormRow";

/* ------------------------------------------------------------------------------------------------ */
/* FormActions                                                                                       */
/* ------------------------------------------------------------------------------------------------ */

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The primary button's text. Names the action: "Create order", not "OK". */
  submitLabel: React.ReactNode;
  /** Renders a secondary Cancel button before the primary. */
  onCancel?: () => void;
  cancelLabel?: React.ReactNode;
  /** Danger-toned primary for an irreversible submit. */
  destructive?: boolean;
  /** Left-aligned content (a Switch, a note count). */
  extra?: React.ReactNode;
  /** Pins the bar to the bottom of a Sheet or Page body with its own surface. */
  sticky?: boolean;
  /** Overrides the Form's busy state. */
  loading?: boolean;
  /** Disables the primary (e.g. form invalid). */
  disabled?: boolean;
  /** Set when the primary is not a submit button. */
  onSubmit?: () => void;
}

/** Cancel then one primary, right-aligned. Reads the enclosing `Form`'s busy flag. */
export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  (
    { className, submitLabel, onCancel, cancelLabel = "Cancel", destructive = false, extra, sticky = false, loading, disabled, onSubmit, children, ...props },
    ref,
  ) => {
    const busy = useFormBusy();
    const isBusy = loading ?? busy;
    return (
      <div
        ref={ref}
        data-sticky={sticky || undefined}
        className={cn(
          "flex items-center justify-end gap-2",
          sticky && "sticky bottom-0 z-sticky -mx-6 -mb-5 border-t border-line bg-surface-2 px-6 py-4",
          className,
        )}
        {...props}
      >
        {extra != null ? <div className="mr-auto flex min-w-0 items-center gap-2">{extra}</div> : null}
        {children}
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
        ) : null}
        <Button
          type={onSubmit ? "button" : "submit"}
          variant={destructive ? "danger" : "primary"}
          loading={isBusy}
          disabled={disabled}
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    );
  },
);
FormActions.displayName = "FormActions";
