"use client";

import { useEffect, useState } from "react";
import { MANIFEST } from "../manifest";
import type { KitEntry } from "../types";
import { TONES, toneDot, toneSoft, toneSolid, toneText } from "../../lib/tone";

const meta = MANIFEST.find((m) => m.id === "colors")!;

/* Read the tokens from the live stylesheet so the catalog never drifts from tokens.css. */

interface Swatch {
  name: string;
  hex: string;
  contrast: number | null;
}

const SEMANTIC = /^--ls-(surface|line|fg|accent|focus|neutral)(-|$)/;
const TEXT_TOKEN = /^--ls-(fg|ink|accent|success|warn|danger|info)(-\d)?$/;

function listTokenNames(): string[] {
  const names = new Set<string>();
  if (typeof document === "undefined") return [];
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // cross-origin sheet
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!/(^|,)\s*:root\s*(,|$)/.test(rule.selectorText)) continue;
      for (let i = 0; i < rule.style.length; i++) {
        const prop = rule.style[i];
        if (prop && prop.startsWith("--ls-")) names.add(prop);
      }
    }
  }
  return Array.from(names);
}

function toHex(rgb: string): string | null {
  const m = rgb.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  if (!m) return null;
  const part = (s: string | undefined) => Number(s ?? 0).toString(16).padStart(2, "0");
  return `#${part(m[1])}${part(m[2])}${part(m[3])}`;
}

/** Paint the value as a colour and read it back; null when the value is not a colour (shadows, fonts). */
function resolveHex(probe: HTMLElement, value: string): string | null {
  probe.style.color = "";
  probe.style.color = value;
  if (!probe.style.color) return null;
  return toHex(getComputedStyle(probe).color);
}

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (lin[0] ?? 0) + 0.7152 * (lin[1] ?? 0) + 0.0722 * (lin[2] ?? 0);
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function readSwatches(): { semantic: Swatch[]; primitives: Swatch[] } {
  if (typeof document === "undefined") return { semantic: [], primitives: [] };
  const root = getComputedStyle(document.documentElement);
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  document.body.appendChild(probe);
  try {
    const paper = resolveHex(probe, root.getPropertyValue("--ls-paper").trim()) ?? "#ffffff";
    const semantic: Swatch[] = [];
    const primitives: Swatch[] = [];
    for (const name of listTokenNames()) {
      const value = root.getPropertyValue(name).trim();
      if (!value) continue;
      const hex = resolveHex(probe, value);
      if (!hex) continue;
      const swatch: Swatch = {
        name,
        hex,
        contrast: TEXT_TOKEN.test(name) ? contrast(hex, paper) : null,
      };
      (SEMANTIC.test(name) ? semantic : primitives).push(swatch);
    }
    return { semantic, primitives };
  } finally {
    probe.remove();
  }
}

function useSwatches() {
  const [state, setState] = useState<{ semantic: Swatch[]; primitives: Swatch[] }>({ semantic: [], primitives: [] });
  useEffect(() => {
    setState(readSwatches());
  }, []);
  return state;
}

const MONO = "font-mono text-xs"; // lint-classes-ignore

function SwatchGrid({ items }: { items: Swatch[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.name} className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="h-14 border-b border-line" style={{ background: `var(${s.name})` }} />
          <div className="flex flex-col gap-0.5 p-2.5">
            <div className={`${MONO} text-fg`}>{s.name.replace("--ls-", "")}</div>
            <div className="flex items-center justify-between text-xs text-fg-3">
              <span className={MONO}>{s.hex}</span>
              {s.contrast !== null ? <span className="tabular-nums">{s.contrast.toFixed(1)}:1</span> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SemanticSwatches() {
  return <SwatchGrid items={useSwatches().semantic} />;
}

function PrimitiveSwatches() {
  return <SwatchGrid items={useSwatches().primitives} />;
}

function ToneSpecimens() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <span key={t} className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${toneSoft[t]}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {TONES.map((t) => (
          <span key={t} className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${toneSolid[t]}`}>
            {t}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {TONES.map((t) => (
          <span key={t} className={`inline-flex items-center gap-1.5 ${toneText[t]}`}>
            <span className={`size-2 rounded-full ${toneDot[t]}`} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export const colorsEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Semantic tokens",
      render: () => <SemanticSwatches />,
      code: `<div className="bg-surface text-fg border-line">page</div>
<aside className="bg-surface-2">sidebar, panels, table header</aside>
<tr className="bg-surface-3">hover, selected row</tr>
<p className="text-fg-2">secondary</p>
<p className="text-fg-3">meta, placeholder</p>
<button className="bg-accent text-accent-fg hover:bg-accent-hover">Save</button>`,
    },
    {
      title: "Brand primitives",
      render: () => <PrimitiveSwatches />,
      code: `/* Direct scale access, for illustration and marketing moments only */
<div className="bg-ink text-paper">…</div>
<div className="bg-flame-6 text-ember">…</div>`,
    },
    {
      title: "Status tones",
      render: () => <ToneSpecimens />,
      code: `import { toneSoft, toneSolid, toneText, toneDot } from "@linesight/kit";

<span className={toneSoft.success}>Shipped</span>
<span className={toneText.danger}>Overdue</span>
<span className={\`size-2 rounded-full \${toneDot.warn}\`} />`,
    },
  ],
};
