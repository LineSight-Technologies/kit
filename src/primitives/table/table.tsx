"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

type Density = "compact" | "default";
const DensityContext = React.createContext<Density>("default");

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** `compact` tightens rows to h-8 / py-1.5. Flows to every TableHead and TableCell. */
  density?: Density;
  /** Classes for the scrolling wrapper rather than the `<table>`. */
  wrapperClassName?: string;
}

/** Styled table elements for small static tables. Anything sortable or selectable is DataTable. */
const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, density = "default", wrapperClassName, ...props }, ref) => (
  <DensityContext.Provider value={density}>
    <div className={cn("relative w-full overflow-auto rounded-lg border border-line", wrapperClassName)}>
      <table ref={ref} data-density={density} className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  </DensityContext.Provider>
));
Table.displayName = "Table";

export type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-surface-2 [&_tr]:border-b [&_tr]:border-line [&_tr]:hover:bg-surface-2", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

export type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn(className)} {...props} />
));
TableBody.displayName = "TableBody";

export type TableRowProps = React.HTMLAttributes<HTMLTableRowElement>;

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-line transition-colors duration-1 last:border-0 hover:bg-surface-2 data-[state=selected]:bg-accent-soft",
      className,
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(({ className, numeric = false, ...props }, ref) => {
  const density = React.useContext(DensityContext);
  return (
    <th
      ref={ref}
      className={cn(
        "whitespace-nowrap px-3 text-left align-middle text-xs font-medium text-fg-2",
        density === "compact" ? "h-8" : "h-10",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
});
TableHead.displayName = "TableHead";

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(({ className, numeric = false, ...props }, ref) => {
  const density = React.useContext(DensityContext);
  return (
    <td
      ref={ref}
      className={cn(
        "px-3 align-middle text-fg",
        density === "compact" ? "py-1.5" : "py-2.5",
        numeric && "text-right tabular-nums",
        className,
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

export type TableCaptionProps = React.HTMLAttributes<HTMLTableCaptionElement>;

/** Screen-reader only. Visible captions are not used. */
const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("sr-only", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption };
