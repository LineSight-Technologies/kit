"use client";

import * as React from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Columns3 } from "lucide-react";
import { cn } from "../../lib/cn";
import { formatDate, formatDateTime, formatRelative, toDate, type DateInput } from "../../lib/date";
import { StatusBadge } from "../../primitives/badge/badge";
import { Checkbox } from "../../primitives/checkbox/checkbox";
import {
  ActionMenu,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  type ActionMenuItem,
} from "../../primitives/dropdown-menu/dropdown-menu";
import { IconButton } from "../../primitives/icon-button/icon-button";
import { Pagination } from "../../primitives/pagination/pagination";
import { SkeletonRow } from "../../primitives/skeleton/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../primitives/table/table";
import { Tooltip } from "../../primitives/tooltip/tooltip";
import { EmptyState, ErrorState } from "../empty-state/empty-state";

export type { ColumnDef, Row, RowSelectionState, SortingState, VisibilityState };
export { createColumnHelper };

/** A column for `DataTable<T>`. Value type is open so `col.*` presets and `createColumnHelper` mix freely. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataTableColumn<T> = ColumnDef<T, any>;

/** Per-column display hints, read from `columnDef.meta`. */
export interface DataTableColumnMeta {
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
  /** Clip to one line; a `title` appears on hover when the text overflows. */
  truncate?: boolean;
  /** Classes for every body cell in this column. */
  className?: string;
  /** Classes for the header cell. */
  headerClassName?: string;
  /** Label in the column-visibility menu when `header` is not a string. */
  label?: string;
}

const SELECT_ID = "select";
const ACTIONS_ID = "actions";
const DASH = <span className="text-fg-3">–</span>;

function metaOf<T>(def: DataTableColumn<T>): DataTableColumnMeta {
  return (def.meta ?? {}) as DataTableColumnMeta;
}

function columnId<T>(def: DataTableColumn<T>): string | undefined {
  if (def.id) return def.id;
  if ("accessorKey" in def && def.accessorKey != null) return String(def.accessorKey).replace(/\./g, "_");
  return typeof def.header === "string" ? def.header : undefined;
}

function columnLabel<T>(def: DataTableColumn<T>): string {
  return metaOf(def).label ?? (typeof def.header === "string" ? def.header : (columnId(def) ?? ""));
}

/* ------------------------------------------------------------------------------------------------ */
/* col — column presets                                                                              */
/* ------------------------------------------------------------------------------------------------ */

type Key<T> = Extract<keyof T, string>;
type Accessor<T, V> = Key<T> | ((row: T) => V);

export interface ColOptions {
  /** Required when the accessor is a function. Defaults to the key. */
  id?: string;
  /** Fixed width in px. Unset columns share the remaining width. */
  size?: number;
  /** Default true. */
  sortable?: boolean;
  /** Default true; false hides the column from `ColumnVisibilityMenu`. */
  hideable?: boolean;
  /** Classes for the body cells. */
  className?: string;
}

export interface NumberColOptions extends ColOptions {
  /** Fixed decimals, e.g. 4 for gauge. Defaults to the value's own precision (up to 3). */
  digits?: number;
  /** Full control over the text. Wins over `digits`. */
  format?: (value: number) => string;
}

export interface DateColOptions extends ColOptions {
  /** Show "3 days ago" with the absolute date in a tooltip. */
  relative?: boolean;
  /** Reference time for `relative`; defaults to now. */
  now?: DateInput;
}

function define<T>(
  accessor: Accessor<T, unknown>,
  header: string,
  opts: ColOptions,
  rest: Partial<DataTableColumn<T>>,
  meta: DataTableColumnMeta,
): DataTableColumn<T> {
  const id = opts.id ?? (typeof accessor === "string" ? accessor : undefined);
  if (!id) throw new Error("col: pass `id` when the accessor is a function");
  const access = typeof accessor === "string" ? { accessorKey: accessor } : { accessorFn: accessor };
  return {
    id,
    ...access,
    header,
    size: opts.size,
    enableSorting: opts.sortable ?? true,
    enableHiding: opts.hideable ?? true,
    ...rest,
    meta: { ...meta, className: cn(meta.className, opts.className) },
  } as DataTableColumn<T>;
}

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || v === "";
}

/**
 * Column presets. `col.text("grade", "Grade")`, `col.number("weightLbs", "Weight (lb)", { digits: 0 })`,
 * `col.status("status", "Status")`, `col.date("receivedAt", "Received", { relative: true })`,
 * `col.actions((row) => [...])`, `col.select()`.
 */
export const col = {
  text<T>(accessor: Accessor<T, unknown>, header: string, opts: ColOptions = {}): DataTableColumn<T> {
    return define<T>(
      accessor,
      header,
      opts,
      { cell: (ctx) => (isBlank(ctx.getValue()) ? DASH : String(ctx.getValue())) },
      { truncate: true },
    );
  },

  number<T>(accessor: Accessor<T, number | null | undefined>, header: string, opts: NumberColOptions = {}): DataTableColumn<T> {
    const { digits, format, ...base } = opts;
    const fmt =
      format ??
      ((n: number) =>
        n.toLocaleString("en-US", digits == null ? { maximumFractionDigits: 3 } : { minimumFractionDigits: digits, maximumFractionDigits: digits }));
    return define<T>(
      accessor,
      header,
      base,
      {
        cell: (ctx) => {
          const v = ctx.getValue() as number | null | undefined;
          return v == null || Number.isNaN(v) ? DASH : fmt(v);
        },
      },
      { numeric: true },
    );
  },

  status<T>(accessor: Accessor<T, string | null | undefined>, header: string, opts: ColOptions = {}): DataTableColumn<T> {
    return define<T>(
      accessor,
      header,
      opts,
      {
        cell: (ctx) => {
          const v = ctx.getValue() as string | null | undefined;
          return isBlank(v) ? DASH : <StatusBadge status={String(v)} />;
        },
      },
      {},
    );
  },

  date<T>(accessor: Accessor<T, DateInput | null | undefined>, header: string, opts: DateColOptions = {}): DataTableColumn<T> {
    const { relative = false, now, ...base } = opts;
    const read = typeof accessor === "string" ? (row: T) => row[accessor] as unknown as DateInput | null | undefined : accessor;
    return define<T>(
      (row: T) => {
        const raw = read(row);
        return raw == null ? null : toDate(raw);
      },
      header,
      { ...base, id: base.id ?? (typeof accessor === "string" ? accessor : undefined) },
      {
        sortingFn: "datetime",
        cell: (ctx) => {
          const d = ctx.getValue() as Date | null;
          const absolute = d ? formatDateTime(d) : "";
          if (!d || !absolute) return DASH;
          const iso = d.toISOString();
          if (!relative) return <time dateTime={iso}>{formatDate(d)}</time>;
          return (
            <Tooltip content={absolute}>
              <time dateTime={iso} className="underline-offset-2 hover:underline">
                {formatRelative(d, now)}
              </time>
            </Tooltip>
          );
        },
      },
      { truncate: false },
    );
  },

  /** Appends a row-actions column: an `ActionMenu` built from `items(row)`. */
  actions<T>(items: (row: T) => ActionMenuItem[]): DataTableColumn<T> {
    return {
      id: ACTIONS_ID,
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <ActionMenu items={items(row.original)} label="Row actions" />,
      size: 48,
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-12 py-0 text-right", headerClassName: "w-12" } satisfies DataTableColumnMeta,
    };
  },

  /** The selection checkbox column. `DataTable` adds it for you when `enableRowSelection` is set. */
  select<T>(): DataTableColumn<T> {
    return {
      id: SELECT_ID,
      header: ({ table }) => {
        const all = table.getIsAllPageRowsSelected();
        const some = table.getIsSomePageRowsSelected();
        return (
          <Checkbox
            aria-label="Select all rows"
            checked={all}
            indeterminate={some && !all}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onCheckedChange={(v) => row.toggleSelected(v === true)}
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
      meta: { className: "w-10 pr-0 align-middle", headerClassName: "w-10 pr-0" } satisfies DataTableColumnMeta,
    };
  },
};

/* ------------------------------------------------------------------------------------------------ */
/* State helpers                                                                                     */
/* ------------------------------------------------------------------------------------------------ */

/** Controlled when `value` is given, otherwise internal; TanStack updaters resolve against the latest value. */
function useControllable<S>(value: S | undefined, defaultValue: S, onChange?: (next: S) => void): [S, OnChangeFn<S>] {
  const [internal, setInternal] = React.useState(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as S) : internal;
  const currentRef = React.useRef(current);
  currentRef.current = current;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;
  const set = React.useCallback<OnChangeFn<S>>(
    (updater) => {
      const next = typeof updater === "function" ? (updater as (old: S) => S)(currentRef.current) : updater;
      currentRef.current = next;
      if (!controlled) setInternal(next);
      onChangeRef.current?.(next);
    },
    [controlled],
  );
  return [current, set];
}

const INTERACTIVE = "button, a:not([data-row-link]), input, select, textarea, [role=menuitem], [role=checkbox], [role=switch]";

function fromInteractive(e: React.SyntheticEvent): boolean {
  const target = e.target as HTMLElement | null;
  return !!target && target !== e.currentTarget && !!target.closest(INTERACTIVE);
}

/* ------------------------------------------------------------------------------------------------ */
/* DataTable                                                                                         */
/* ------------------------------------------------------------------------------------------------ */

export interface DataTablePagination {
  /** 1-based. */
  page: number;
  pageSize: number;
  /** Server-side total. Omit to page `data` on the client. */
  total?: number;
  onPageChange: (page: number) => void;
  /** When omitted the page-size select is not shown. */
  onPageSizeChange?: (pageSize: number) => void;
}

export interface DataTableProps<T> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Stable ids keep selection correct across sorting and paging. Defaults to the row index. */
  getRowId?: (row: T, index: number) => string;
  /** Replaces the body with `skeletonRows` placeholder rows. */
  loading?: boolean;
  skeletonRows?: number;
  /** Any truthy value renders an ErrorState in the body. */
  error?: unknown;
  onRetry?: () => void;
  /** Body content when there are no rows. Defaults to an EmptyState. */
  empty?: React.ReactNode;

  sorting?: SortingState;
  defaultSorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  /** The server sorts: header clicks only report through `onSortingChange`. */
  manualSorting?: boolean;

  /** Adds the checkbox column. A function decides per row. */
  enableRowSelection?: boolean | ((row: Row<T>) => boolean);
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Convenience: the selected records whenever the selection changes. */
  onSelectionChange?: (rows: T[]) => void;
  /** Rendered above the table while rows are selected (pass a BulkBar). */
  renderBulkBar?: (count: number, clear: () => void) => React.ReactNode;

  /** Rows become focusable buttons: click or Enter. Clicks on controls inside the row are ignored. */
  onRowClick?: (row: T) => void;
  /** Wraps the first data cell in a link so middle-click and ⌘-click open the record in a new tab. */
  rowHref?: (row: T) => string | undefined;
  /** Shorthand for appending `col.actions(rowActions)`. */
  rowActions?: (row: T) => ActionMenuItem[];

  density?: "default" | "compact";
  /** Header stays visible while the body scrolls. Default true. */
  stickyHeader?: boolean;
  /** Height of the scroll container, e.g. `480` or `"60vh"`. */
  maxHeight?: number | string;
  /** First column stays visible on horizontal scroll, with a hairline once scrolled. */
  pinFirstColumn?: boolean;

  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (visibility: VisibilityState) => void;

  pagination?: DataTablePagination;
  /** Screen-reader caption. */
  caption?: string;
  /** Classes for the `<table>` itself; `className` goes on the outer frame. */
  tableClassName?: string;
}

function DataTableInner<T>(
  {
    columns,
    data,
    getRowId,
    loading = false,
    skeletonRows = 8,
    error,
    onRetry,
    empty,
    sorting: sortingProp,
    defaultSorting,
    onSortingChange,
    manualSorting = false,
    enableRowSelection = false,
    rowSelection: rowSelectionProp,
    onRowSelectionChange,
    onSelectionChange,
    renderBulkBar,
    onRowClick,
    rowHref,
    rowActions,
    density = "default",
    stickyHeader = true,
    maxHeight,
    pinFirstColumn = false,
    columnVisibility: visibilityProp,
    onColumnVisibilityChange,
    pagination,
    caption,
    className,
    tableClassName,
    style,
    ...props
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const [sorting, setSorting] = useControllable<SortingState>(sortingProp, defaultSorting ?? [], onSortingChange);
  const [rowSelection, setRowSelection] = useControllable<RowSelectionState>(rowSelectionProp, {}, onRowSelectionChange);
  const [columnVisibility, setColumnVisibility] = useControllable<VisibilityState>(visibilityProp, {}, onColumnVisibilityChange);

  const allColumns = React.useMemo(() => {
    const cols = [...columns];
    if (enableRowSelection && !cols.some((c) => c.id === SELECT_ID)) cols.unshift(col.select<T>());
    if (rowActions && !cols.some((c) => c.id === ACTIONS_ID)) cols.push(col.actions<T>(rowActions));
    return cols;
  }, [columns, enableRowSelection, rowActions]);

  const clientPaging = !!pagination && pagination.total == null;
  const paginationRef = React.useRef(pagination);
  paginationRef.current = pagination;
  const onPaginationChange = React.useCallback<OnChangeFn<PaginationState>>((updater) => {
    const p = paginationRef.current;
    if (!p) return;
    const prev: PaginationState = { pageIndex: p.page - 1, pageSize: p.pageSize };
    const next = typeof updater === "function" ? updater(prev) : updater;
    if (next.pageSize !== prev.pageSize) p.onPageSizeChange?.(next.pageSize);
    if (next.pageIndex !== prev.pageIndex) p.onPageChange(next.pageIndex + 1);
  }, []);

  const table = useReactTable<T>({
    data,
    columns: allColumns,
    getRowId,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      ...(clientPaging && pagination ? { pagination: { pageIndex: pagination.page - 1, pageSize: pagination.pageSize } } : {}),
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: clientPaging ? onPaginationChange : undefined,
    enableRowSelection,
    enableSorting: true,
    sortDescFirst: false,
    manualSorting,
    manualPagination: !clientPaging,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getPaginationRowModel: clientPaging ? getPaginationRowModel() : undefined,
  });

  // onSelectionChange(rows): fires after the selection changes, never on mount.
  const onSelectionChangeRef = React.useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;
  const mounted = React.useRef(false);
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onSelectionChangeRef.current?.(table.getSelectedRowModel().rows.map((r) => r.original));
  }, [rowSelection, data, table]);

  const [scrolledX, setScrolledX] = React.useState(false);
  const onScrollCapture = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.target as HTMLElement;
      if (!(el instanceof HTMLElement) || el.tagName !== "DIV") return;
      const next = el.scrollLeft > 0;
      if (next !== scrolledX) setScrolledX(next);
    },
    [scrolledX],
  );

  const rows = table.getRowModel().rows;
  const visibleColumns = table.getVisibleLeafColumns();
  const colSpan = Math.max(1, visibleColumns.length);
  const firstDataIndex = Math.max(
    0,
    visibleColumns.findIndex((c) => c.id !== SELECT_ID && c.id !== ACTIONS_ID),
  );
  const selectedCount = table.getSelectedRowModel().rows.length;
  const total = pagination ? (pagination.total ?? data.length) : 0;
  const interactive = !!onRowClick;

  const pinnedClass = (isHeader: boolean) =>
    cn("sticky left-0", isHeader ? "z-sticky" : "z-[1] bg-inherit", scrolledX && "border-r border-line");

  return (
    <div
      ref={ref}
      aria-busy={loading || undefined}
      data-density={density}
      className={cn("flex flex-col gap-3", className)}
      style={maxHeight != null ? ({ ...style, "--dt-max-h": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } as React.CSSProperties) : style}
      onScrollCapture={pinFirstColumn ? onScrollCapture : undefined}
      {...props}
    >
      {renderBulkBar && selectedCount > 0 ? renderBulkBar(selectedCount, () => table.resetRowSelection()) : null}

      <Table
        density={density}
        className={cn("border-separate border-spacing-0", tableClassName)}
        wrapperClassName={cn(maxHeight != null && "max-h-[var(--dt-max-h)]")}
      >
        {caption ? <TableCaption>{caption}</TableCaption> : null}
        <TableHeader className="bg-transparent">
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} className="border-0 hover:bg-transparent">
              {hg.headers.map((header, i) => {
                const meta = metaOf(header.column.columnDef as DataTableColumn<T>);
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();
                const width = header.column.columnDef.size;
                const label = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());
                return (
                  <TableHead
                    key={header.id}
                    numeric={meta.numeric}
                    aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                    style={width != null ? { width } : undefined}
                    className={cn(
                      "border-b border-line bg-surface-2",
                      stickyHeader && "sticky top-0 z-sticky",
                      pinFirstColumn && i === 0 && pinnedClass(true),
                      meta.headerClassName,
                    )}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        data-sorted={sorted || undefined}
                        className={cn(
                          "group -mx-1 inline-flex h-7 max-w-full items-center gap-1 rounded-sm px-1 text-xs font-medium text-fg-2 outline-none transition-colors duration-150 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus",
                          sorted && "text-fg",
                          meta.numeric && "flex-row-reverse",
                        )}
                      >
                        <span className="truncate">{label}</span>
                        {sorted === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" />
                        ) : sorted === "desc" ? (
                          <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" />
                        ) : (
                          <ChevronsUpDown
                            aria-hidden="true"
                            className="size-3.5 shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
                          />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={colSpan} className="p-0" data-loading="">
                {Array.from({ length: Math.max(1, skeletonRows) }, (_, i) => (
                  <SkeletonRow
                    key={i}
                    cells={Math.min(6, colSpan)}
                    className={cn(density === "compact" && "h-9", i === skeletonRows - 1 && "border-b-0")}
                  />
                ))}
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={colSpan} className="py-10" data-error="">
                <ErrorState error={error} onRetry={onRetry} size="sm" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={colSpan} className="py-10" data-empty="">
                {empty ?? <EmptyState title="No results" size="sm" />}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, rowIndex) => {
              const last = rowIndex === rows.length - 1;
              const href = rowHref ? rowHref(row.original) : undefined;
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  tabIndex={interactive ? 0 : undefined}
                  onClick={
                    interactive
                      ? (e) => {
                          if (fromInteractive(e)) return;
                          onRowClick?.(row.original);
                        }
                      : undefined
                  }
                  onKeyDown={
                    interactive
                      ? (e) => {
                          if (e.key === "Enter" && e.target === e.currentTarget) {
                            e.preventDefault();
                            onRowClick?.(row.original);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-0 bg-surface",
                    interactive && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
                  )}
                >
                  {row.getVisibleCells().map((cell, i) => {
                    const meta = metaOf(cell.column.columnDef as DataTableColumn<T>);
                    const isFirstData = i === firstDataIndex;
                    const raw = cell.getValue();
                    const text = typeof raw === "string" || typeof raw === "number" ? String(raw) : undefined;
                    let content: React.ReactNode = flexRender(cell.column.columnDef.cell, cell.getContext());
                    if (href && isFirstData) {
                      content = (
                        <a
                          href={href}
                          data-row-link=""
                          tabIndex={interactive ? -1 : undefined}
                          className="text-current outline-none after:absolute after:inset-0 after:content-['']"
                          onClick={(e) => {
                            // Plain left click: let the row handler navigate in-app. Modified clicks keep native behaviour.
                            if (interactive && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) e.preventDefault();
                          }}
                        >
                          {content}
                        </a>
                      );
                    }
                    return (
                      <TableCell
                        key={cell.id}
                        numeric={meta.numeric}
                        onMouseEnter={
                          meta.truncate && text
                            ? (e) => {
                                const el = e.currentTarget;
                                if (el.scrollWidth > el.clientWidth) el.title = text;
                                else el.removeAttribute("title");
                              }
                            : undefined
                        }
                        className={cn(
                          "border-b border-line",
                          last && "border-b-0",
                          meta.truncate && "max-w-xs truncate",
                          href && isFirstData && "relative",
                          pinFirstColumn && i === 0 && pinnedClass(false),
                          meta.className,
                        )}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination ? (
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        />
      ) : null}
    </div>
  );
}

const DataTableForwarded = React.forwardRef(DataTableInner);
DataTableForwarded.displayName = "DataTable";

/** TanStack-based records table. Declare columns with `col.*`, pass `data`; every state is built in. */
export const DataTable = DataTableForwarded as unknown as (<T>(
  props: DataTableProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null) & { displayName: string };

/* ------------------------------------------------------------------------------------------------ */
/* ColumnVisibilityMenu                                                                              */
/* ------------------------------------------------------------------------------------------------ */

export interface ColumnVisibilityMenuProps<T> {
  /** The same `columns` array the table receives. Select and actions columns are skipped. */
  columns: DataTableColumn<T>[];
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: (visibility: VisibilityState) => void;
  /** Accessible name and tooltip. */
  label?: string;
  className?: string;
}

/** Toolbar control that toggles columns. Pair with `columnVisibility` / `onColumnVisibilityChange` on the table. */
export function ColumnVisibilityMenu<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  label = "Columns",
  className,
}: ColumnVisibilityMenuProps<T>) {
  const options = columns
    .filter((c) => c.enableHiding !== false)
    .map((c) => ({ id: columnId(c), label: columnLabel(c) }))
    .filter((o): o is { id: string; label: string } => !!o.id && o.id !== SELECT_ID && o.id !== ACTIONS_ID);

  return (
    <DropdownMenu>
      <Tooltip content={label}>
        <DropdownMenuTrigger asChild>
          <IconButton label={label} tooltip={false} variant="outline" size="sm" className={className}>
            <Columns3 />
          </IconButton>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-48">
        {options.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.id}
            checked={columnVisibility[o.id] !== false}
            onCheckedChange={(checked) => onColumnVisibilityChange({ ...columnVisibility, [o.id]: checked === true })}
            onSelect={(e) => e.preventDefault()}
          >
            {o.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
ColumnVisibilityMenu.displayName = "ColumnVisibilityMenu";
