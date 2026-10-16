import * as React from "react";
import { Building2, CalendarDays, Download, LayoutGrid, List, Plus, Send } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../../primitives/button/button";
import { BulkBar, FilterChip, FilterMenu, SearchInput, Toolbar, ViewToggle } from "./toolbar";

const meta = MANIFEST.find((m) => m.id === "toolbar")!;

const STATUSES = ["Open", "Scheduled", "In progress", "Complete"];
const CUSTOMERS = ["Harbor Steel Fabrication", "Northline Duct Co.", "Prairie Metal Roofing"];

function Choices({ options, onPick }: { options: string[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      {options.map((o) => (
        <Button key={o} variant="ghost" size="sm" className="justify-start" onClick={() => onPick(o)}>
          {o}
        </Button>
      ))}
    </div>
  );
}

function ListToolbar() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<string | undefined>("Open");
  const [customer, setCustomer] = React.useState<string | undefined>();
  const [view, setView] = React.useState("table");
  const applied = [
    status ? <FilterChip key="status" label="Status" value={status} onRemove={() => setStatus(undefined)} /> : null,
    customer ? <FilterChip key="customer" label="Customer" value={customer} onRemove={() => setCustomer(undefined)} /> : null,
  ].filter(Boolean);
  return (
    <Toolbar
      search={<SearchInput value={query} onChange={setQuery} shortcut placeholder="Search orders" />}
      filters={
        <>
          <FilterMenu label="Status" value={status} onClear={() => setStatus(undefined)}>
            <Choices options={STATUSES} onPick={setStatus} />
          </FilterMenu>
          <FilterMenu label="Customer" icon={<Building2 />} value={customer} onClear={() => setCustomer(undefined)}>
            <Choices options={CUSTOMERS} onPick={setCustomer} />
          </FilterMenu>
          <FilterMenu label="Due" icon={<CalendarDays />}>
            <Choices options={["This week", "Next week", "Overdue"]} onPick={() => {}} />
          </FilterMenu>
        </>
      }
      view={
        <ViewToggle
          value={view}
          onChange={setView}
          options={[
            { value: "table", icon: <List />, label: "Table" },
            { value: "grid", icon: <LayoutGrid />, label: "Grid" },
          ]}
        />
      }
      actions={
        <>
          <Button variant="secondary" leadingIcon={<Download />}>
            Export
          </Button>
          <Button leadingIcon={<Plus />}>New order</Button>
        </>
      }
      active={applied.length ? applied : undefined}
    />
  );
}

function SearchStates() {
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("C-10422");
  return (
    <div className="flex flex-col gap-3">
      <SearchInput value={a} onChange={setA} shortcut placeholder="Search coils" />
      <SearchInput value={b} onChange={setB} placeholder="Search coils" />
      <SearchInput value="" onChange={() => {}} placeholder="Search coils" disabled />
    </div>
  );
}

function Chips() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip label="Status" />
      <FilterChip label="Status" value="Open" />
      <FilterChip label="Gauge" value="0.0598 in" onRemove={() => {}} />
      <FilterChip label="Mill" icon={<Building2 />} />
      <FilterChip label="Product" disabled />
    </div>
  );
}

function Views() {
  const [v, setV] = React.useState("table");
  const [w, setW] = React.useState("week");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <ViewToggle
        value={v}
        onChange={setV}
        options={[
          { value: "table", icon: <List />, label: "Table" },
          { value: "grid", icon: <LayoutGrid />, label: "Grid" },
        ]}
      />
      <ViewToggle
        label="Range"
        value={w}
        onChange={setW}
        options={[
          { value: "day", icon: <CalendarDays />, label: "Day" },
          { value: "week", icon: <List />, label: "Week" },
          { value: "month", icon: <LayoutGrid />, label: "Month" },
        ]}
      />
    </div>
  );
}

function Bulk() {
  const [count, setCount] = React.useState(3);
  return (
    <div className="relative flex h-56 w-full flex-col overflow-y-auto rounded-lg border border-line bg-surface">
      <div className="flex flex-col p-4 text-sm text-fg-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="flex items-center justify-between border-b border-line py-2 tabular-nums last:border-b-0">
            <span>ORD-{5120 + i}</span>
            <span>{(12 + i * 3).toLocaleString("en-US")} pcs</span>
          </div>
        ))}
        <div className="pt-3">
          <Button variant="secondary" size="sm" onClick={() => setCount(count ? 0 : 3)}>
            {count ? "Clear selection" : "Select three"}
          </Button>
        </div>
      </div>
      <BulkBar
        count={count}
        onClear={() => setCount(0)}
        actions={
          <>
            <Button variant="ghost" size="sm" leadingIcon={<Send />}>
              Release
            </Button>
            <Button variant="ghost" size="sm" leadingIcon={<Download />}>
              Export
            </Button>
          </>
        }
      />
    </div>
  );
}

export const toolbarEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "List toolbar with applied filters",
      wide: true,
      render: () => <ListToolbar />,
      code: `<Toolbar
  search={<SearchInput value={q} onChange={setQ} onDebouncedChange={refetch} shortcut />}
  filters={
    <FilterMenu label="Status" value={status} onClear={() => setStatus(undefined)}>…</FilterMenu>
  }
  view={<ViewToggle value={view} onChange={setView} options={[…]} />}
  actions={<Button leadingIcon={<Plus />}>New order</Button>}
  active={status && <FilterChip label="Status" value={status} onRemove={() => setStatus(undefined)} />}
/>`,
    },
    {
      title: "SearchInput: empty with shortcut, with value, disabled",
      render: () => <SearchStates />,
      code: `<SearchInput value={q} onChange={setQ} onDebouncedChange={refetch} shortcut placeholder="Search coils" />`,
    },
    {
      title: "FilterChip: idle, applied, removable, with icon, disabled",
      render: () => <Chips />,
      code: `<FilterChip label="Status" value="Open" onRemove={clear} />`,
    },
    {
      title: "ViewToggle: two and three options",
      render: () => <Views />,
      code: `<ViewToggle value={view} onChange={setView} options={[{ value: "table", icon: <List />, label: "Table" }, { value: "grid", icon: <LayoutGrid />, label: "Grid" }]} />`,
    },
    {
      title: "BulkBar over a list",
      render: () => <Bulk />,
      code: `<BulkBar count={selected.length} onClear={clearSelection} actions={<Button variant="ghost" size="sm">Release</Button>} />`,
    },
  ],
  props: [
    { name: "Toolbar.search / filters / view / actions", type: "ReactNode", description: "Slots left to right; view and actions sit on the right and wrap under on narrow screens." },
    { name: "Toolbar.active", type: "ReactNode", description: "Applied filters as removable FilterChips; renders a second row only when present." },
    { name: "SearchInput.value / onChange", type: "string / (value) => void", description: "Controlled. Clears from the trailing X." },
    { name: "SearchInput.onDebouncedChange / debounceMs", type: "(value) => void / number", default: "250", description: "Fires after typing pauses; never on mount." },
    { name: "SearchInput.shortcut", type: "boolean", default: "false", description: "Shows the / key while empty and focuses the field on /." },
    { name: "FilterChip.label / value", type: "ReactNode", description: "Idle chip shows the label; an applied chip reads \"Label: Value\"." },
    { name: "FilterChip.active / onRemove / asChild", type: "boolean / () => void / boolean", description: "Applied look (defaults to value != null); remove control; render the child as the chip." },
    { name: "FilterMenu.label / value / onClear", type: "ReactNode / ReactNode / () => void", description: "Chip that opens a w-64 Popover with the children; Escape closes it." },
    { name: "ViewToggle.options / value / onChange", type: "{ value, icon, label }[] / string / (value) => void", description: "Two or three icon options, aria-pressed." },
    { name: "BulkBar.count / actions / onClear", type: "number / ReactNode / () => void", description: "Floating dark bar while count > 0; ghost Buttons are recoloured for it." },
  ],
};
