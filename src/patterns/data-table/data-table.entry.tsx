import * as React from "react";
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../../primitives/button/button";
import { ColumnVisibilityMenu, DataTable, col, type DataTableColumn, type SortingState, type VisibilityState } from "./data-table";

const meta = MANIFEST.find((m) => m.id === "data-table")!;

interface Coil {
  id: string;
  gaugeIn: number;
  widthIn: number;
  weightLbs: number;
  grade: string;
  status: string;
  location: string;
  receivedAt: string;
}

const coils: Coil[] = [
  { id: "C-10422", gaugeIn: 0.0598, widthIn: 48.0, weightLbs: 42180, grade: "HDG G90", status: "available", location: "Bay 4 · A12", receivedAt: "2026-02-24T08:10:00" },
  { id: "C-10423", gaugeIn: 0.0478, widthIn: 60.0, weightLbs: 38900, grade: "HDG G90", status: "scheduled", location: "Bay 4 · A13", receivedAt: "2026-02-24T08:10:00" },
  { id: "C-10431", gaugeIn: 0.0299, widthIn: 36.0, weightLbs: 21450, grade: "CR 1008", status: "available", location: "Bay 2 · C04", receivedAt: "2026-02-26T13:45:00" },
  { id: "C-10440", gaugeIn: 0.1196, widthIn: 72.0, weightLbs: 51020, grade: "HRPO A1011", status: "on_hold", location: "Bay 1 · B01", receivedAt: "2026-02-27T07:30:00" },
  { id: "C-10441", gaugeIn: 0.0239, widthIn: 24.0, weightLbs: 12300, grade: "CR 1008", status: "available", location: "Bay 2 · C05", receivedAt: "2026-02-27T07:30:00" },
  { id: "C-10450", gaugeIn: 0.0747, widthIn: 54.0, weightLbs: 44010, grade: "HRPO A1011", status: "scheduled", location: "Bay 1 · B02", receivedAt: "2026-03-02T10:05:00" },
  { id: "C-10452", gaugeIn: 0.0359, widthIn: 42.0, weightLbs: 27800, grade: "Galvalume AZ50", status: "in_production", location: "Slitter 2", receivedAt: "2026-03-02T10:05:00" },
  { id: "C-10458", gaugeIn: 0.0538, widthIn: 48.0, weightLbs: 40120, grade: "HDG G60", status: "available", location: "Bay 4 · A20", receivedAt: "2026-03-03T15:20:00" },
  { id: "C-10461", gaugeIn: 0.0179, widthIn: 30.0, weightLbs: 9850, grade: "CR 1010", status: "available", location: "Bay 2 · C11", receivedAt: "2026-03-04T09:00:00" },
  { id: "C-10466", gaugeIn: 0.0897, widthIn: 60.0, weightLbs: 47300, grade: "HRPO A1011", status: "scheduled", location: "Bay 1 · B06", receivedAt: "2026-03-05T11:40:00" },
  { id: "C-10470", gaugeIn: 0.0478, widthIn: 36.0, weightLbs: 23640, grade: "HDG G90", status: "cancelled", location: "Bay 4 · A22", receivedAt: "2026-03-06T08:15:00" },
  { id: "C-10473", gaugeIn: 0.0299, widthIn: 48.0, weightLbs: 31200, grade: "Galvalume AZ50", status: "available", location: "Bay 3 · D02", receivedAt: "2026-03-06T16:50:00" },
];

const columns: DataTableColumn<Coil>[] = [
  col.text<Coil>("id", "Coil", { size: 104 }),
  col.number<Coil>("gaugeIn", "Gauge (in)", { digits: 4, size: 104 }),
  col.number<Coil>("widthIn", "Width (in)", { digits: 3, size: 104 }),
  col.number<Coil>("weightLbs", "Weight (lb)", { digits: 0, size: 112 }),
  col.text<Coil>("grade", "Grade"),
  col.status<Coil>("status", "Status", { size: 128 }),
  col.text<Coil>("location", "Location"),
  col.date<Coil>("receivedAt", "Received", { size: 120 }),
];

const rowActions = (coil: Coil) => [
  { label: "Edit coil", icon: <Pencil />, onSelect: () => console.log("edit", coil.id) },
  { label: "Move location", icon: <ArrowRightLeft />, onSelect: () => console.log("move", coil.id) },
  { separator: true as const },
  { label: "Scrap coil", icon: <Trash2 />, destructive: true, onSelect: () => console.log("scrap", coil.id) },
];

function InventoryDemo() {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);
  return (
    <DataTable
      caption="Coil inventory"
      columns={columns}
      data={coils}
      getRowId={(c) => c.id}
      defaultSorting={[{ id: "receivedAt", desc: true }]}
      enableRowSelection
      renderBulkBar={(count, clear) => (
        <div className="flex h-control items-center gap-3 rounded-md bg-accent-soft px-3 text-sm text-fg">
          <span className="font-medium tabular-nums">{count} selected</span>
          <Button size="sm" variant="outline">
            Schedule
          </Button>
          <Button size="sm" variant="outline">
            Move
          </Button>
          <Button size="sm" variant="ghost" className="ml-auto" onClick={clear}>
            Clear
          </Button>
        </div>
      )}
      onRowClick={(c) => console.log("open", c.id)}
      rowHref={(c) => `#coil-${c.id}`}
      rowActions={rowActions}
      pagination={{ page, pageSize, onPageChange: setPage, onPageSizeChange: (n) => { setPageSize(n); setPage(1); } }}
    />
  );
}

function ColumnsDemo() {
  const [visibility, setVisibility] = React.useState<VisibilityState>({ location: false, gaugeIn: false });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <ColumnVisibilityMenu columns={columns} columnVisibility={visibility} onColumnVisibilityChange={setVisibility} />
      </div>
      <DataTable columns={columns} data={coils.slice(0, 5)} getRowId={(c) => c.id} columnVisibility={visibility} onColumnVisibilityChange={setVisibility} />
    </div>
  );
}

/** The server sorts: we only hold the sorting state, show a loading body, and swap the page in. */
function ServerSortDemo() {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "weightLbs", desc: true }]);
  const [rows, setRows] = React.useState<Coil[]>(() => sortLikeServer(coils, sorting).slice(0, 6));
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setRows(sortLikeServer(coils, sorting).slice(0, 6));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [sorting]);

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(c) => c.id}
      manualSorting
      sorting={sorting}
      onSortingChange={setSorting}
      loading={loading}
      skeletonRows={6}
      pagination={{ page: 1, pageSize: 6, total: 1204, onPageChange: () => {} }}
    />
  );
}

function sortLikeServer(data: Coil[], sorting: SortingState): Coil[] {
  const [s] = sorting;
  if (!s) return data;
  const key = s.id as keyof Coil;
  return [...data].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
    return s.desc ? -cmp : cmp;
  });
}

export const dataTableEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Coil inventory: sorting, selection, row click, row actions, pagination",
      wide: true,
      render: () => <InventoryDemo />,
      code: `const columns = [
  col.text<Coil>("id", "Coil"),
  col.number<Coil>("gaugeIn", "Gauge (in)", { digits: 4 }),
  col.number<Coil>("weightLbs", "Weight (lb)", { digits: 0 }),
  col.status<Coil>("status", "Status"),
  col.date<Coil>("receivedAt", "Received"),
];

<DataTable
  columns={columns}
  data={coils}
  getRowId={(c) => c.id}
  defaultSorting={[{ id: "receivedAt", desc: true }]}
  enableRowSelection
  renderBulkBar={(count, clear) => <BulkBar count={count} onClear={clear}>…</BulkBar>}
  onRowClick={(c) => navigate(\`/coils/\${c.id}\`)}
  rowHref={(c) => \`/coils/\${c.id}\`}
  rowActions={(c) => [{ label: "Edit coil", onSelect: () => edit(c) }]}
  pagination={{ page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
/>`,
    },
    {
      title: "Compact density, pinned first column, fixed height",
      wide: true,
      render: () => (
        <DataTable
          columns={columns}
          data={coils}
          getRowId={(c) => c.id}
          density="compact"
          pinFirstColumn
          maxHeight={240}
          tableClassName="min-w-[1100px]"
          rowActions={rowActions}
        />
      ),
      code: `<DataTable columns={columns} data={coils} density="compact" pinFirstColumn maxHeight={240} />`,
    },
    {
      title: "Loading",
      wide: true,
      render: () => <DataTable columns={columns} data={[]} loading skeletonRows={5} />,
      code: `<DataTable columns={columns} data={[]} loading />`,
    },
    {
      title: "Empty",
      wide: true,
      render: () => <DataTable columns={columns} data={[]} />,
      code: `<DataTable columns={columns} data={[]} empty={<EmptyState title="No coils match" action={…} />} />`,
    },
    {
      title: "Error with retry",
      wide: true,
      render: () => <DataTable columns={columns} data={[]} error={new Error("Inventory sync timed out")} onRetry={() => console.log("retry")} />,
      code: `<DataTable columns={columns} data={[]} error={query.error} onRetry={query.refetch} />`,
    },
    {
      title: "Column visibility",
      wide: true,
      render: () => <ColumnsDemo />,
      code: `const [visibility, setVisibility] = useState<VisibilityState>({ location: false });

<ColumnVisibilityMenu columns={columns} columnVisibility={visibility} onColumnVisibilityChange={setVisibility} />
<DataTable columns={columns} data={coils} columnVisibility={visibility} onColumnVisibilityChange={setVisibility} />`,
    },
    {
      title: "Server-side sorting and paging",
      wide: true,
      render: () => <ServerSortDemo />,
      code: `<DataTable
  columns={columns}
  data={page.rows}
  manualSorting
  sorting={sorting}
  onSortingChange={setSorting}
  loading={query.isFetching}
  pagination={{ page, pageSize, total: page.total, onPageChange: setPage }}
/>`,
    },
  ],
  props: [
    { name: "columns", type: "DataTableColumn<T>[]", description: "Declared with col.text / number / status / date / actions / select, or createColumnHelper." },
    { name: "data", type: "T[]", description: "The rows for this page." },
    { name: "getRowId", type: "(row: T, index: number) => string", default: "index", description: "Stable ids keep selection correct across sorting and paging." },
    { name: "loading / skeletonRows", type: "boolean / number", default: "false / 8", description: "Skeleton rows in the body; header stays." },
    { name: "error / onRetry", type: "unknown / () => void", description: "Any truthy error renders an ErrorState with retry in the body." },
    { name: "empty", type: "ReactNode", default: "<EmptyState title=\"No results\" />", description: "Body when there are no rows." },
    { name: "sorting / defaultSorting / onSortingChange", type: "SortingState", description: "Controlled or uncontrolled. Header click cycles asc → desc → off." },
    { name: "manualSorting", type: "boolean", default: "false", description: "The server sorts; clicks only report through onSortingChange." },
    { name: "enableRowSelection", type: "boolean | (row) => boolean", default: "false", description: "Adds the checkbox column. Header checkbox is indeterminate for partial selection." },
    { name: "rowSelection / onRowSelectionChange / onSelectionChange", type: "RowSelectionState / (rows: T[]) => void", description: "Controlled selection, plus a convenience callback with the selected records." },
    { name: "renderBulkBar", type: "(count, clear) => ReactNode", description: "Rendered above the table while rows are selected. Pass a BulkBar." },
    { name: "onRowClick / rowHref", type: "(row: T) => void / (row: T) => string", description: "Clickable, focusable rows (Enter activates). rowHref adds a real link on the first cell for middle-click." },
    { name: "rowActions", type: "(row: T) => ActionMenuItem[]", description: "Appends an ActionMenu column." },
    { name: "density", type: "'default' | 'compact'", default: "'default'", description: "Row padding py-2.5 or py-1.5." },
    { name: "stickyHeader / maxHeight / pinFirstColumn", type: "boolean / number | string / boolean", default: "true / – / false", description: "Scrolling body with a sticky header and an optional pinned first column." },
    { name: "columnVisibility / onColumnVisibilityChange", type: "VisibilityState", description: "Pair with ColumnVisibilityMenu in the toolbar." },
    { name: "pagination", type: "{ page, pageSize, total?, onPageChange, onPageSizeChange? }", description: "Renders Pagination under the table. Omit total to page on the client." },
    { name: "caption", type: "string", description: "Screen-reader caption." },
  ],
};
