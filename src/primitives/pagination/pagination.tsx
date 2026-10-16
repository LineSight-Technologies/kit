"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { controlStateClasses, controlVariants } from "../input/input";

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** 1-based. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** When omitted the page-size select is not rendered. */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

const fmt = (n: number) => n.toLocaleString("en-US");

/** Range text, page-size select, prev/next. Disabled at the bounds. */
const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  ({ className, page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [25, 50, 100], ...props }, ref) => {
    const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
    const current = Math.min(Math.max(1, page), pageCount);
    const start = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const end = Math.min(current * pageSize, total);
    const options = pageSizeOptions.includes(pageSize) ? pageSizeOptions : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

    return (
      <nav
        ref={ref}
        aria-label="Pagination"
        className={cn("flex items-center justify-between gap-4 text-sm text-fg-2", className)}
        {...props}
      >
        <span className="tabular-nums" data-range="">
          {total === 0 ? "0 results" : `${fmt(start)}–${fmt(end)} of ${fmt(total)}`}
        </span>
        <div className="flex items-center gap-2">
          {onPageSizeChange ? (
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(controlVariants({ size: "sm" }), controlStateClasses, "pr-2 tabular-nums")}
            >
              {options.map((n) => (
                <option key={n} value={n}>
                  {fmt(n)} per page
                </option>
              ))}
            </select>
          ) : null}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous page"
              className="w-8 px-0"
              disabled={current <= 1}
              onClick={() => onPageChange(current - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Next page"
              className="w-8 px-0"
              disabled={current >= pageCount}
              onClick={() => onPageChange(current + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";

export { Pagination };
