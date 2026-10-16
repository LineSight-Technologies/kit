"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ChangeEvent,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../../lib/cn";
import { useFieldControl } from "../field/field";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Height floor, in text rows. */
  minRows?: number;
  /** Height cap, in text rows; the textarea scrolls past it. */
  maxRows?: number;
  /** Allow the manual resize handle. Off by default — the textarea grows on its own. */
  resize?: boolean;
}

const px = (value: string, fallback: number) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Grows with its content between `minRows` and `maxRows`. Browsers that support `field-sizing: content`
 * get it for free; the measurement effect below is the fallback and also enforces the cap everywhere.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, minRows = 3, maxRows = 10, resize = false, onChange, value, defaultValue, ...props }, ref) => {
    const inner = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => inner.current as HTMLTextAreaElement);
    const aria = useFieldControl(props);

    const fit = useCallback(() => {
      const el = inner.current;
      if (!el) return;
      const cs = window.getComputedStyle(el);
      // jsdom and "normal" line-height both fall back to the text-sm leading (20px).
      const line = px(cs.lineHeight, 20);
      const padding = px(cs.paddingTop, 8) + px(cs.paddingBottom, 8);
      const border = px(cs.borderTopWidth, 1) + px(cs.borderBottomWidth, 1);
      const min = line * minRows + padding + border;
      const max = line * maxRows + padding + border;
      el.style.height = "0px";
      const content = el.scrollHeight + border;
      const next = Math.min(Math.max(content, min), max);
      el.style.height = `${next}px`;
      el.style.overflowY = content > max ? "auto" : "hidden";
    }, [minRows, maxRows]);

    useIsoLayoutEffect(() => {
      fit();
    }, [fit, value, defaultValue]);

    useEffect(() => {
      const el = inner.current;
      if (!el || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => fit());
      ro.observe(el);
      return () => ro.disconnect();
    }, [fit]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      if (value === undefined) fit();
    };

    return (
      <textarea
        ref={inner}
        rows={minRows}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          "block w-full rounded-md border border-line bg-surface px-3 py-2 text-sm leading-5 text-fg placeholder:text-fg-3",
          "transition-colors duration-1 hover:border-line-strong",
          "outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "aria-invalid:border-danger aria-invalid:focus-visible:ring-danger",
          "disabled:pointer-events-none disabled:opacity-50",
          resize ? "resize-y" : "resize-none",
          "[field-sizing:content]",
          className,
        )}
        {...props}
        {...aria}
      />
    );
  },
);
Textarea.displayName = "Textarea";
