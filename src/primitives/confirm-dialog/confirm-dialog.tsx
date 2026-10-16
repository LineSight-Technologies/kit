"use client";

import * as React from "react";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog/dialog";

export type ConfirmTone = "danger" | "accent";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Names the thing: "Delete coil C-10422?" */
  title: React.ReactNode;
  /** One sentence naming the consequence. */
  body?: React.ReactNode;
  /** A verb. */
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  /** Async: the confirm button shows loading until it settles; rejects stay open and show the error. */
  onConfirm: () => void | Promise<void>;
  /** Require this exact text to be typed before confirm enables. */
  typeToConfirm?: string;
}

function errorMessage(e: unknown) {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string" && e) return e;
  return "Something went wrong. Try again.";
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  typeToConfirm,
}: ConfirmDialogProps) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [typed, setTyped] = React.useState("");
  const inputId = React.useId();

  React.useEffect(() => {
    if (open) {
      setTyped("");
      setError(null);
      setPending(false);
    }
  }, [open]);

  const locked = typeToConfirm !== undefined && typed !== typeToConfirm;

  const handleOpenChange = (next: boolean) => {
    if (!next && pending) return;
    onOpenChange(next);
  };

  const confirm = async () => {
    if (pending || locked) return;
    setError(null);
    try {
      const result = onConfirm();
      if (result && typeof (result as Promise<void>).then === "function") {
        setPending(true);
        await result;
        setPending(false);
      }
      onOpenChange(false);
    } catch (e) {
      setPending(false);
      setError(errorMessage(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        size="sm"
        hideClose
        onInteractOutside={(e) => {
          if (pending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (pending) e.preventDefault();
        }}
      >
        <DialogHeader className="pr-6">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {body || typeToConfirm !== undefined || error ? (
          <DialogBody className="flex flex-col gap-3">
            {body ? <div>{body}</div> : null}
            {typeToConfirm !== undefined ? (
              <form
                className="flex flex-col gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  void confirm();
                }}
              >
                <label htmlFor={inputId} className="text-sm text-fg-2">
                  Type <span className="font-medium text-fg">{typeToConfirm}</span> to continue
                </label>
                <Input
                  id={inputId}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  spellCheck={false}
                  disabled={pending}
                />
              </form>
            ) : null}
            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}
          </DialogBody>
        ) : null}
        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={() => void confirm()}
            loading={pending}
            disabled={locked || pending}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
ConfirmDialog.displayName = "ConfirmDialog";

// ---------------------------------------------------------------------------
// useConfirm — imperative confirmation for flows that are not already modal.
// ---------------------------------------------------------------------------

export interface ConfirmOptions {
  title: React.ReactNode;
  body?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  typeToConfirm?: string;
}

interface ConfirmState {
  options: ConfirmOptions;
  open: boolean;
}

/**
 * `const [confirm, confirmDialog] = useConfirm();` — render `confirmDialog` once, then
 * `if (await confirm({ title: "Delete coil C-10422?" })) …`. Resolves `false` on cancel, Escape or outside click.
 */
function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, React.ReactElement] {
  const [state, setState] = React.useState<ConfirmState | null>(null);
  const resolver = React.useRef<((value: boolean) => void) | null>(null);

  const settle = React.useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setState((s) => (s ? { ...s, open: false } : s));
  }, []);

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setState({ options, open: true });
      }),
    [],
  );

  const element = (
    <ConfirmDialog
      open={state?.open ?? false}
      onOpenChange={(next) => {
        if (!next) settle(false);
      }}
      title={state?.options.title ?? ""}
      body={state?.options.body}
      confirmLabel={state?.options.confirmLabel}
      cancelLabel={state?.options.cancelLabel}
      tone={state?.options.tone}
      typeToConfirm={state?.options.typeToConfirm}
      onConfirm={() => settle(true)}
    />
  );

  return [confirm, element];
}

export { ConfirmDialog, useConfirm };
