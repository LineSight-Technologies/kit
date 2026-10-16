import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Separator } from "./separator";

const meta = MANIFEST.find((m) => m.id === "separator")!;

export const separatorEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Horizontal",
      render: () => (
        <div className="flex w-72 flex-col gap-3 text-sm text-fg-2">
          <span>Coil C-118204 received</span>
          <Separator />
          <span>Coil C-118209 received</span>
        </div>
      ),
      code: `<Separator />`,
    },
    {
      title: "Vertical",
      render: () => (
        <div className="flex h-5 items-center gap-3 text-sm text-fg-2">
          <span>Line 2</span>
          <Separator orientation="vertical" />
          <span>0.048 × 48.000</span>
          <Separator orientation="vertical" />
          <span>41,200 lb</span>
        </div>
      ),
      code: `<div className="flex items-center gap-3">
  <span>Line 2</span>
  <Separator orientation="vertical" />
  <span>41,200 lb</span>
</div>`,
    },
    {
      title: "With label",
      render: () => (
        <div className="flex w-80 flex-col gap-3 text-sm text-fg-2">
          <span>Pattern released to floor</span>
          <Separator label="Yesterday" />
          <span>Pattern approved by scheduler</span>
          <Separator label="12 Oct" />
          <span>Order imported from ERP</span>
        </div>
      ),
      code: `<Separator label="Yesterday" />`,
    },
    {
      title: "Non-decorative (exposed to assistive tech)",
      render: () => (
        <div className="flex w-72 flex-col gap-3 text-sm text-fg-2">
          <span>Slitter settings</span>
          <Separator decorative={false} />
          <span>Knife tolerances</span>
        </div>
      ),
      code: `<Separator decorative={false} />`,
    },
  ],
  props: [
    { name: "orientation", type: "'horizontal' | 'vertical'", default: "'horizontal'", description: "Vertical needs a flex parent with a height, or self-stretch does the rest." },
    { name: "label", type: "ReactNode", description: "Short text centred between two hairlines. Horizontal only." },
    { name: "decorative", type: "boolean", default: "true", description: "False renders role=separator for screen readers." },
  ],
};
