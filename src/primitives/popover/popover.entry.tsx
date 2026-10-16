import { SlidersHorizontal } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "./popover";

const meta = MANIFEST.find((m) => m.id === "popover")!;

function GaugeFilter() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" leadingIcon={<SlidersHorizontal />}>
          Gauge
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-fg">Gauge range</div>
          <div className="grid grid-cols-2 gap-2">
            <input aria-label="Min gauge" defaultValue="0.0180" className="h-control-sm rounded-md border border-line bg-surface px-2.5 text-sm tabular-nums text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" />
            <input aria-label="Max gauge" defaultValue="0.0598" className="h-control-sm rounded-md border border-line bg-surface px-2.5 text-sm tabular-nums text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface" />
          </div>
          <div className="flex justify-end gap-2">
            <PopoverClose asChild>
              <Button variant="ghost" size="sm">
                Clear
              </Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button size="sm">Apply</Button>
            </PopoverClose>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const popoverEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Default",
      render: () => (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent>Anchored to the trigger, 6px offset, w-72 by default.</PopoverContent>
        </Popover>
      ),
      code: `<Popover>\n  <PopoverTrigger asChild><Button variant="outline">Open</Button></PopoverTrigger>\n  <PopoverContent>…</PopoverContent>\n</Popover>`,
    },
    {
      title: "Sides and alignment",
      render: () => (
        <div className="flex flex-wrap gap-2">
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Popover key={side}>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm">
                  {side}
                </Button>
              </PopoverTrigger>
              <PopoverContent side={side} className="w-48">
                Opens {side}.
              </PopoverContent>
            </Popover>
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" size="sm">
                align start
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-48">
              Aligned to the start edge.
            </PopoverContent>
          </Popover>
        </div>
      ),
      code: `<PopoverContent side="top" align="start">…</PopoverContent>`,
    },
    {
      title: "Filter popover",
      render: () => <GaugeFilter />,
      code: `<PopoverContent align="start">\n  {/* small form */}\n  <PopoverClose asChild><Button size="sm">Apply</Button></PopoverClose>\n</PopoverContent>`,
    },
  ],
  props: [
    { name: "side", type: "'top' | 'right' | 'bottom' | 'left'", default: "'bottom'", description: "Which side of the trigger the panel opens on." },
    { name: "align", type: "'start' | 'center' | 'end'", default: "'center'", description: "Alignment along the trigger." },
    { name: "sideOffset", type: "number", default: "6", description: "Gap from the trigger in px." },
    { name: "open / onOpenChange", type: "boolean / (open) => void", description: "Controlled mode. Omit for uncontrolled (`defaultOpen`)." },
  ],
};
