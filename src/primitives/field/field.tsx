"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useId,
  type ComponentPropsWithoutRef,
  type ElementRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface FieldContextValue {
  /** id the control must use so the label's `htmlFor` resolves. */
  id: string;
  /** id of the Field's label, when it has one — for controls `<label for>` cannot name (div-based). */
  labelId?: string;
  /** id of the error element, present only while `error` is set. */
  errorId?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/** The nearest `Field`, or `null` when the control is used on its own. */
export function useFieldContext() {
  return useContext(FieldContext);
}

export interface FieldControlAria {
  id?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  required?: boolean;
}

/**
 * Resolve `id`, `aria-invalid`, `aria-describedby` and `required` for a control: explicit props win,
 * then the nearest Field, then a generated id. Every kit control calls this so wiring is automatic.
 */
export function useFieldControl<T extends FieldControlAria>(props: T) {
  const field = useFieldContext();
  const generated = useId();
  const id = props.id ?? field?.id ?? generated;
  const invalid = props["aria-invalid"] ?? (field?.invalid ? true : undefined);
  const describedBy =
    [props["aria-describedby"], field?.errorId].filter(Boolean).join(" ") || undefined;
  const required = props.required ?? (field?.required || undefined);
  const labelledBy =
    props["aria-labelledby"] ?? (props["aria-label"] == null && field?.labelId ? field.labelId : undefined);
  return {
    id,
    "aria-invalid": invalid,
    "aria-describedby": describedBy,
    "aria-labelledby": labelledBy,
    required,
  } as const;
}

/* ------------------------------------------------------------------ */
/* Label                                                               */
/* ------------------------------------------------------------------ */

export interface LabelProps extends ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  /** Renders an accent asterisk after the text. */
  required?: boolean;
  /** Accepted for symmetry; renders nothing extra by design. */
  optional?: boolean;
}

export const Label = forwardRef<ElementRef<typeof LabelPrimitive.Root>, LabelProps>(
  ({ className, required, optional: _optional, children, ...props }, ref) => (
    <LabelPrimitive.Root
      ref={ref}
      className={cn("inline-flex items-center gap-1 text-sm font-medium leading-5 text-fg", className)}
      {...props}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="text-accent">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  ),
);
Label.displayName = "Label";

/* ------------------------------------------------------------------ */
/* FieldError                                                          */
/* ------------------------------------------------------------------ */

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  children?: ReactNode;
}

/** The only text allowed under a control. Renders nothing when empty. */
export const FieldError = forwardRef<HTMLParagraphElement, FieldErrorProps>(
  ({ className, children, ...props }, ref) => {
    const field = useFieldContext();
    if (!children) return null;
    return (
      <p
        ref={ref}
        id={props.id ?? field?.errorId}
        role="alert"
        className={cn("text-xs leading-4 text-danger", className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
FieldError.displayName = "FieldError";

/* ------------------------------------------------------------------ */
/* Field                                                               */
/* ------------------------------------------------------------------ */

export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  label?: ReactNode;
  /** Control id. Generated with `useId` when absent. */
  htmlFor?: string;
  /** Validation message. Sets `aria-invalid` and `aria-describedby` on the control. */
  error?: string;
  required?: boolean;
  /** `horizontal` puts the label in a fixed 10rem column — dense settings forms. */
  orientation?: "vertical" | "horizontal";
  children: ReactNode;
}

const INTRINSIC_CONTROLS = new Set(["input", "select", "textarea", "button"]);
const LABELABLE = /^(INPUT|SELECT|TEXTAREA|BUTTON|METER|OUTPUT)$/;

/** `<label for>` only focuses labelable elements; a div-based control (Combobox) needs a hand. */
function focusNonLabelable(e: MouseEvent<HTMLLabelElement>) {
  const target = e.currentTarget.htmlFor ? document.getElementById(e.currentTarget.htmlFor) : null;
  if (target && !LABELABLE.test(target.tagName)) target.focus();
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ label, htmlFor, error, required = false, orientation = "vertical", className, children, ...props }, ref) => {
    const generated = useId();
    const id = htmlFor ?? generated;
    const errorId = error ? `${id}-error` : undefined;
    const labelId = label != null ? `${id}-label` : undefined;
    const invalid = Boolean(error);
    const horizontal = orientation === "horizontal";

    // Kit controls read the context. A bare DOM control (non-kit child) gets the same wiring cloned on.
    let content = children;
    const only = Children.count(children) === 1 ? Children.toArray(children)[0] : null;
    if (isValidElement(only) && typeof only.type === "string" && INTRINSIC_CONTROLS.has(only.type)) {
      const el = only as ReactElement<FieldControlAria>;
      content = cloneElement(el, {
        id: el.props.id ?? id,
        "aria-invalid": el.props["aria-invalid"] ?? (invalid || undefined),
        "aria-describedby": [el.props["aria-describedby"], errorId].filter(Boolean).join(" ") || undefined,
        required: el.props.required ?? (required || undefined),
      });
    }

    return (
      <FieldContext.Provider value={{ id, labelId, errorId, invalid, required }}>
        <div
          ref={ref}
          data-orientation={orientation}
          data-invalid={invalid || undefined}
          className={cn(
            horizontal ? "grid grid-cols-[10rem_minmax(0,1fr)] items-start gap-x-4 gap-y-1" : "flex flex-col gap-1.5",
            className,
          )}
          {...props}
        >
          {label != null && (
            <Label
              id={labelId}
              htmlFor={id}
              required={required}
              onClick={focusNonLabelable}
              className={cn(horizontal && "min-h-control py-2")}
            >
              {label}
            </Label>
          )}
          <div className={cn("flex min-w-0 flex-col gap-1.5", horizontal && label == null && "col-start-2")}>
            {content}
            <FieldError>{error}</FieldError>
          </div>
        </div>
      </FieldContext.Provider>
    );
  },
);
Field.displayName = "Field";
