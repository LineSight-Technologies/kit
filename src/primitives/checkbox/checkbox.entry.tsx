"use client";

import { useState } from "react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { Checkbox } from "./checkbox";

const meta = MANIFEST.find((m) => m.id === "checkbox")!;

const coils = ["C-10421", "C-10422", "C-10423"];

function RowSelection() {
  const [picked, setPicked] = useState<string[]>(["C-10422"]);
  const all = picked.length === coils.length;
  const some = picked.length > 0 && !all;
  return (
    <div className="flex w-64 flex-col gap-2">
      <Checkbox
        label="All coils"
        checked={all}
        indeterminate={some}
        onCheckedChange={(c) => setPicked(c ? coils : [])}
      />
      <div className="ml-6 flex flex-col gap-2">
        {coils.map((c) => (
          <Checkbox
            key={c}
            label={c}
            checked={picked.includes(c)}
            onCheckedChange={(on) => setPicked((p) => (on ? [...p, c] : p.filter((x) => x !== c)))}
          />
        ))}
      </div>
    </div>
  );
}

export const checkboxEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "States",
      render: () => (
        <div className="flex flex-wrap items-center gap-6">
          <Checkbox label="Unchecked" />
          <Checkbox label="Checked" defaultChecked />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled" disabled />
          <Checkbox label="Disabled checked" disabled defaultChecked />
          <Checkbox label="Invalid" aria-invalid />
        </div>
      ),
      code: `<Checkbox label="Include scrap" />\n<Checkbox label="All coils" checked={all} indeterminate={some} onCheckedChange={…} />`,
    },
    {
      title: "Sizes",
      render: () => (
        <div className="flex items-center gap-6">
          <Checkbox size="sm" label="Small" defaultChecked />
          <Checkbox size="md" label="Medium" defaultChecked />
        </div>
      ),
      code: `<Checkbox size="sm" label="Small" />`,
    },
    {
      title: "Without a label (row selection)",
      render: () => <Checkbox aria-label="Select row" />,
      code: `<Checkbox aria-label="Select row" checked={row.getIsSelected()} onCheckedChange={row.toggleSelected} />`,
    },
    { title: "Select-all with indeterminate", render: () => <RowSelection /> },
    {
      title: "In a Field",
      render: () => (
        <Field label="Terms" error="You must accept the cut tolerance">
          <Checkbox label="Accept ±0.005 in width tolerance" />
        </Field>
      ),
      code: `<Field label="Terms" error={error}>\n  <Checkbox label="Accept ±0.005 in width tolerance" />\n</Field>`,
    },
  ],
  props: [
    { name: "label", type: "ReactNode", description: "Clickable label. An id is generated so it toggles the box." },
    { name: "indeterminate", type: "boolean", description: "Shows a dash; overrides `checked` while true." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "14px or 16px box." },
    { name: "checked / onCheckedChange", type: "boolean / (c: boolean | 'indeterminate') => void", description: "Controlled state (Radix)." },
  ],
};
