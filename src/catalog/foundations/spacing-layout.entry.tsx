import { MANIFEST } from "../manifest";
import type { KitEntry } from "../types";

const meta = MANIFEST.find((m) => m.id === "spacing-layout")!;

const CONTROLS = [
  { cls: "h-control-sm", px: "32", use: "dense toolbars, table row actions" },
  { cls: "h-control", px: "36", use: "the default for buttons, inputs, selects" },
  { cls: "h-control-lg", px: "40", use: "primary action on a page, empty states" },
];

const GAPS = [
  { cls: "gap-1", px: "4", use: "icon to label" },
  { cls: "gap-2", px: "8", use: "controls in a row" },
  { cls: "gap-3", px: "12", use: "fields in a row" },
  { cls: "gap-4", px: "16", use: "sections inside a panel" },
  { cls: "gap-6", px: "24", use: "sections on a page" },
  { cls: "gap-8", px: "32", use: "page header to content" },
];

const LAYERS = [
  { cls: "z-sticky", value: "10", use: "sticky table headers, form action bars" },
  { cls: "z-dropdown", value: "40", use: "menus, popovers, selects" },
  { cls: "z-sheet", value: "50", use: "side sheets" },
  { cls: "z-dialog", value: "60", use: "dialogs" },
  { cls: "z-toast", value: "70", use: "toasts" },
  { cls: "z-tooltip", value: "80", use: "tooltips" },
];

const MONO = "font-mono text-xs"; // lint-classes-ignore

function Controls() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      {CONTROLS.map((c) => (
        <div key={c.cls} className="flex flex-col items-start gap-2">
          <div className={`flex w-40 items-center rounded-md border border-line bg-surface px-3 text-sm ${c.cls}`}>Search coils</div>
          <div className="text-xs">
            <div className="font-medium text-fg">{c.cls}</div>
            <div className="text-fg-3">{c.px}px, {c.use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Gaps() {
  return (
    <div className="flex flex-col gap-3">
      {GAPS.map((g) => (
        <div key={g.cls} className="flex items-center gap-6">
          <div className="w-16 shrink-0 text-xs font-medium text-fg">{g.cls}</div>
          <div className={`flex ${g.cls}`}>
            <div className="size-6 rounded-sm bg-surface-3 border border-line" />
            <div className="size-6 rounded-sm bg-surface-3 border border-line" />
            <div className="size-6 rounded-sm bg-surface-3 border border-line" />
          </div>
          <div className="text-xs text-fg-3">{g.px}px, {g.use}</div>
        </div>
      ))}
    </div>
  );
}

function Widths() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <div className="flex h-24 w-sidebar flex-col gap-2 rounded-md border border-line bg-surface-2 p-3">
          <div className="h-control-sm rounded-md bg-surface-3" />
          <div className="h-control-sm rounded-md bg-surface" />
        </div>
        <div className="flex h-24 w-rail flex-col items-center gap-2 rounded-md border border-line bg-surface-2 p-3">
          <div className="size-8 rounded-md bg-surface-3" />
          <div className="size-8 rounded-md bg-surface" />
        </div>
      </div>
      <div className="flex gap-6 text-xs">
        <div>
          <div className="font-medium text-fg">w-sidebar</div>
          <div className="text-fg-3">260px, expanded</div>
        </div>
        <div>
          <div className="font-medium text-fg">w-rail</div>
          <div className="text-fg-3">64px, collapsed</div>
        </div>
        <div>
          <div className="font-medium text-fg">max-w-page</div>
          <div className="text-fg-3">1280px, page content; tables may run full width</div>
        </div>
      </div>
    </div>
  );
}

function Layers() {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-2 text-xs font-medium text-fg-2">
          <tr>
            <th scope="col" className="px-3 py-2">Class</th>
            <th scope="col" className="px-3 py-2">Value</th>
            <th scope="col" className="px-3 py-2">Used by</th>
          </tr>
        </thead>
        <tbody>
          {LAYERS.map((l) => (
            <tr key={l.cls} className="border-t border-line">
              <td className={`px-3 py-2 ${MONO}`}>{l.cls}</td>
              <td className="px-3 py-2 tabular-nums text-fg-2">{l.value}</td>
              <td className="px-3 py-2 text-fg-2">{l.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const spacingLayoutEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Control heights",
      render: () => <Controls />,
      code: `<button className="h-control">Save</button>
<input className="h-control-sm" />
<button className="h-control-lg">Create work order</button>`,
    },
    {
      title: "Gaps",
      render: () => <Gaps />,
      code: `/* gap between siblings, never margins */
<div className="flex items-center gap-2">
  <Button>Cancel</Button>
  <Button variant="primary">Save</Button>
</div>`,
    },
    {
      title: "Widths",
      render: () => <Widths />,
      code: `<aside className="w-sidebar">…</aside>
<aside className="w-rail">…</aside>
<main className="mx-auto max-w-page px-8">…</main>`,
    },
    {
      title: "Layers",
      render: () => <Layers />,
      code: `<thead className="sticky top-0 z-sticky">…</thead>
<PopoverContent className="z-dropdown" />
<DialogContent className="z-dialog" />`,
    },
  ],
};
