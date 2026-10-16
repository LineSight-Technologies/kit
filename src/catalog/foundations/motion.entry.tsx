"use client";

import { useState } from "react";
import { MANIFEST } from "../manifest";
import type { KitEntry } from "../types";

const meta = MANIFEST.find((m) => m.id === "motion")!;

const ENTRANCES = [
  { cls: "animate-ls-fade-in", use: "content appearing in place, 320ms" },
  { cls: "animate-ls-scale-in", use: "popovers, menus, dialogs, 200ms" },
  { cls: "animate-ls-slide-in-right", use: "sheet from the right, 320ms" },
  { cls: "animate-ls-slide-in-left", use: "sheet from the left, 320ms" },
  { cls: "animate-ls-slide-in-up", use: "toasts, 200ms" },
];

const EXITS = [
  { cls: "animate-ls-fade-out", use: "150ms" },
  { cls: "animate-ls-scale-out", use: "150ms" },
  { cls: "animate-ls-slide-out-right", use: "200ms" },
  { cls: "animate-ls-slide-out-left", use: "200ms" },
];

/** Click to re-mount the specimen so the keyframes play again. */
function Replay({ cls, use }: { cls: string; use: string }) {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      className="flex flex-col items-start gap-2 rounded-lg border border-line bg-surface p-3 text-left outline-none transition-colors duration-150 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <div className="flex h-16 w-40 items-center justify-center overflow-hidden rounded-md bg-surface-3">
        <div key={run} className={`size-8 rounded-md bg-accent ${cls}`} />
      </div>
      <div className="text-xs">
        <div className="font-medium text-fg">{cls}</div>
        <div className="text-fg-3">{use}</div>
      </div>
    </button>
  );
}

function ShimmerReplay() {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      className="flex flex-col items-start gap-2 rounded-lg border border-line bg-surface p-3 text-left outline-none transition-colors duration-150 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <div className="relative h-16 w-40 overflow-hidden rounded-md bg-surface-3">
        <div key={run} className="absolute inset-0 animate-ls-shimmer bg-gradient-to-r from-transparent via-surface to-transparent" />
      </div>
      <div className="text-xs">
        <div className="font-medium text-fg">animate-ls-shimmer</div>
        <div className="text-fg-3">skeleton sheen, 1.6s loop</div>
      </div>
    </button>
  );
}

function SpinReplay() {
  const [run, setRun] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setRun((n) => n + 1)}
      className="flex flex-col items-start gap-2 rounded-lg border border-line bg-surface p-3 text-left outline-none transition-colors duration-150 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      <div className="flex h-16 w-40 items-center justify-center rounded-md bg-surface-3">
        <div key={run} className="size-6 animate-ls-spin rounded-full border-2 border-line-strong border-t-accent" />
      </div>
      <div className="text-xs">
        <div className="font-medium text-fg">animate-ls-spin</div>
        <div className="text-fg-3">spinner, 0.8s loop</div>
      </div>
    </button>
  );
}

function Entrances() {
  return (
    <div className="flex flex-wrap gap-4">
      {ENTRANCES.map((a) => (
        <Replay key={a.cls} {...a} />
      ))}
    </div>
  );
}

function Exits() {
  return (
    <div className="flex flex-wrap gap-4">
      {EXITS.map((a) => (
        <Replay key={a.cls} {...a} />
      ))}
    </div>
  );
}

function Loops() {
  return (
    <div className="flex flex-wrap gap-4">
      <ShimmerReplay />
      <SpinReplay />
    </div>
  );
}

/** Click to slide both blocks across; the two easings and three durations race side by side. */
function Easings() {
  const [on, setOn] = useState(false);
  const rows = [
    { label: "ease-ls-out", cls: "duration-300 ease-ls-out", use: "entrances, movement" },
    { label: "ease-ls-inout", cls: "duration-300 ease-ls-inout", use: "exits, reversals" },
  ];
  const durations = [
    { label: "duration-150", cls: "duration-150 ease-ls-out", use: "150ms, hover and focus" },
    { label: "duration-200", cls: "duration-200 ease-ls-out", use: "200ms, menus and toasts" },
    { label: "duration-300", cls: "duration-300 ease-ls-out", use: "320ms, sheets and page content" },
  ];
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-line bg-surface p-4 text-left outline-none transition-colors duration-150 hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      {[...rows, ...durations].map((r) => (
        <div key={r.label} className="flex items-center gap-4">
          <div className="w-28 shrink-0 text-xs">
            <div className="font-medium text-fg">{r.label}</div>
            <div className="text-fg-3">{r.use}</div>
          </div>
          <div className="h-6 flex-1 rounded-md bg-surface-3 p-1">
            <div className={`size-4 rounded-sm bg-accent transition-transform ${r.cls} ${on ? "translate-x-56" : "translate-x-0"}`} />
          </div>
        </div>
      ))}
    </button>
  );
}

export const motionEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Entrances",
      render: () => <Entrances />,
      code: `<div className="animate-ls-fade-in">content</div>
<div data-state="open" className="data-[state=open]:animate-ls-scale-in">popover</div>
<aside className="animate-ls-slide-in-right">sheet</aside>`,
    },
    {
      title: "Exits",
      render: () => <Exits />,
      code: `<div className="data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out">…</div>
<aside className="data-[state=closed]:animate-ls-slide-out-right">sheet</aside>`,
    },
    {
      title: "Loops",
      render: () => <Loops />,
      code: `<div className="relative overflow-hidden bg-surface-3">
  <div className="absolute inset-0 animate-ls-shimmer bg-gradient-to-r from-transparent via-surface to-transparent" />
</div>
<div className="animate-ls-spin rounded-full border-2 border-line-strong border-t-accent" />`,
    },
    {
      title: "Easings and durations",
      render: () => <Easings />,
      code: `<button className="transition-colors duration-150">hover feedback</button>
<div className="transition-transform duration-300 ease-ls-out">enter</div>
<div className="transition-transform duration-200 ease-ls-inout">leave</div>`,
    },
  ],
};
