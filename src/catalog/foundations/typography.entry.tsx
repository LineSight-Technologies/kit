import { MANIFEST } from "../manifest";
import type { KitEntry } from "../types";

const meta = MANIFEST.find((m) => m.id === "typography")!;

const SCALE: { cls: string; px: string; sample: string }[] = [
  { cls: "font-display text-3xl tracking-ls-display", px: "30 / 36", sample: "Slitting schedule" },
  { cls: "font-display text-2xl tracking-ls-display", px: "24 / 32", sample: "Coil 48-0921" },
  { cls: "text-xl font-semibold tracking-ls-tight", px: "20 / 28", sample: "Work order WO-10432" },
  { cls: "text-lg font-medium tracking-ls-tight", px: "18 / 28", sample: "Pattern 3 of 7" },
  { cls: "text-base", px: "16 / 24", sample: "Six cuts at 7.875 in from a 48.00 in master coil, 1.4% trim." },
  { cls: "text-sm", px: "14 / 20", sample: "Ships Tuesday. Slitter 2 is booked until 14:00." },
  { cls: "text-xs text-fg-3", px: "12 / 16", sample: "Updated 4 minutes ago by the scheduler" },
];

function Scale() {
  return (
    <div className="flex flex-col gap-5">
      {SCALE.map((row) => (
        <div key={row.cls} className="flex items-baseline gap-6">
          <div className="w-28 shrink-0 text-xs text-fg-3">
            <div>{row.cls.split(" ").find((c) => c.startsWith("text-"))}</div>
            <div className="tabular-nums">{row.px}</div>
          </div>
          <div className={`min-w-0 truncate ${row.cls}`}>{row.sample}</div>
        </div>
      ))}
    </div>
  );
}

function Fonts() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <div className="text-xs text-fg-3">Lexend</div>
        <div className="font-display text-2xl tracking-ls-display">Coil inventory</div>
        <div className="font-display text-base">AaBbCc 0123456789</div>
        <p className="text-sm text-fg-2">Page titles only. One per screen, set by PageHeader.</p>
      </div>
      <div className="flex flex-col gap-3 rounded-lg border border-line p-4">
        <div className="text-xs text-fg-3">Inter Tight</div>
        <div className="text-2xl font-semibold tracking-ls-tight">Coil inventory</div>
        <div className="text-base">AaBbCc 0123456789</div>
        <p className="text-sm text-fg-2">Everything else: section titles, controls, tables, body.</p>
      </div>
    </div>
  );
}

function Weights() {
  return (
    <div className="flex flex-col gap-2 text-base">
      <div className="flex items-baseline gap-6">
        <span className="w-28 shrink-0 text-xs text-fg-3">400 normal</span>
        <span>Master coil 60.00 in, 0.0598 in galvanized, 48,200 lb</span>
      </div>
      <div className="flex items-baseline gap-6">
        <span className="w-28 shrink-0 text-xs text-fg-3">500 medium</span>
        <span className="font-medium">Master coil 60.00 in, 0.0598 in galvanized, 48,200 lb</span>
      </div>
      <div className="flex items-baseline gap-6">
        <span className="w-28 shrink-0 text-xs text-fg-3">600 semibold</span>
        <span className="font-semibold">Master coil 60.00 in, 0.0598 in galvanized, 48,200 lb</span>
      </div>
    </div>
  );
}

const ROWS = [
  ["48-0921", "0.0478", "48.00", "42,380"],
  ["48-1104", "0.1196", "60.00", "51,900"],
  ["36-0017", "0.0239", "36.00", "9,480"],
];

function Numerals() {
  return (
    <div className="grid max-w-md grid-cols-4 gap-x-6 gap-y-1 text-sm tabular-nums" data-numeric>
      <div className="text-xs text-fg-3">Coil</div>
      <div className="text-right text-xs text-fg-3">Gauge in</div>
      <div className="text-right text-xs text-fg-3">Width in</div>
      <div className="text-right text-xs text-fg-3">Weight lb</div>
      {ROWS.map((r) => (
        <div key={r[0]} className="contents">
          <div>{r[0]}</div>
          <div className="text-right">{r[1]}</div>
          <div className="text-right">{r[2]}</div>
          <div className="text-right">{r[3]}</div>
        </div>
      ))}
    </div>
  );
}

export const typographyEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Scale",
      render: () => <Scale />,
      code: `<h1 className="font-display text-2xl tracking-ls-display">Coil 48-0921</h1>
<h2 className="text-lg font-medium tracking-ls-tight">Pattern 3 of 7</h2>
<p className="text-sm">Ships Tuesday.</p>
<span className="text-xs text-fg-3">Updated 4 minutes ago</span>`,
    },
    {
      title: "Which font where",
      render: () => <Fonts />,
      code: `/* Lexend: page title only */
<h1 className="font-display text-2xl tracking-ls-display">Coil inventory</h1>
/* Inter Tight: everything else (the default, no class needed) */
<h2 className="text-base font-semibold">Dimensions</h2>`,
    },
    {
      title: "Weights",
      render: () => <Weights />,
      code: `<span className="font-medium">…</span>   /* labels, nav, table headers */
<span className="font-semibold">…</span> /* section titles, emphasised numbers */`,
    },
    {
      title: "Numerals",
      render: () => <Numerals />,
      code: `/* Tables and [data-numeric] get tabular figures from base.css; elsewhere add the class */
<td className="text-right tabular-nums">42,380</td>`,
    },
  ],
};
