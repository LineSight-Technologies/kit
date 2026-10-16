import { MANIFEST } from "../manifest";
import type { KitEntry } from "../types";

const meta = MANIFEST.find((m) => m.id === "shape-depth")!;

const RADII = [
  { cls: "rounded-sm", px: "4", use: "badges, kbd, checkboxes" },
  { cls: "rounded-md", px: "6", use: "controls, menu items, inputs" },
  { cls: "rounded-lg", px: "10", use: "cards, panels, popovers" },
  { cls: "rounded-xl", px: "16", use: "sheets, dialogs" },
  { cls: "rounded-full", px: "pill", use: "avatars, status pills" },
];

const SHADOWS = [
  { cls: "shadow-ls-1", use: "resting cards" },
  { cls: "shadow-ls-2", use: "popovers, menus" },
  { cls: "shadow-ls-3", use: "dialogs, sheets" },
  { cls: "shadow-ls-flame", use: "primary call to action, rarely" },
];

function Radii() {
  return (
    <div className="flex flex-wrap gap-6">
      {RADII.map((r) => (
        <div key={r.cls} className="flex flex-col items-start gap-2">
          <div className={`size-16 border border-line-strong bg-surface-3 ${r.cls}`} />
          <div className="text-xs">
            <div className="font-medium text-fg">{r.cls}</div>
            <div className="text-fg-3">{r.px}px, {r.use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Shadows() {
  return (
    <div className="flex flex-wrap gap-8 py-4">
      {SHADOWS.map((s) => (
        <div key={s.cls} className="flex flex-col items-start gap-3">
          <div className={`h-20 w-32 rounded-lg bg-surface ${s.cls}`} />
          <div className="text-xs">
            <div className="font-medium text-fg">{s.cls}</div>
            <div className="text-fg-3">{s.use}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Pairings() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <button type="button" className="inline-flex h-control items-center rounded-md border border-line bg-surface px-3 text-sm font-medium">
        Control, rounded-md
      </button>
      <div className="w-64 rounded-lg border border-line bg-surface p-4 shadow-ls-1">
        <div className="text-sm font-medium">Card, rounded-lg</div>
        <div className="mt-1 text-xs text-fg-3">Border plus shadow-ls-1. Never nested.</div>
      </div>
      <div className="w-64 rounded-lg border border-line bg-surface p-3 shadow-ls-2">
        <div className="text-sm">Popover, shadow-ls-2</div>
      </div>
      <div className="w-72 rounded-xl border border-line bg-surface p-5 shadow-ls-3">
        <div className="text-base font-semibold">Dialog, rounded-xl</div>
        <div className="mt-1 text-sm text-fg-2">shadow-ls-3 lifts it off the page.</div>
      </div>
    </div>
  );
}

export const shapeDepthEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Radius",
      render: () => <Radii />,
      code: `<input className="rounded-md" />
<div className="rounded-lg border border-line bg-surface">card</div>
<div className="rounded-xl">dialog</div>`,
    },
    {
      title: "Depth",
      render: () => <Shadows />,
      code: `<div className="rounded-lg border border-line bg-surface shadow-ls-1">card</div>
<div className="rounded-lg border border-line bg-surface shadow-ls-2">popover</div>
<div className="rounded-xl bg-surface shadow-ls-3">dialog</div>`,
    },
    {
      title: "Pairings",
      render: () => <Pairings />,
    },
  ],
};
