import { Copy, Pencil, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { IconButton } from "../icon-button/icon-button";
import { Tooltip, TooltipProvider } from "./tooltip";

const meta = MANIFEST.find((m) => m.id === "tooltip")!;

export const tooltipEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Hover or focus the trigger",
      render: () => (
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content="Generates a slitting plan for the selected orders">
              <Button variant="outline">Generate</Button>
            </Tooltip>
            <Tooltip content="Save" shortcut="⌘S">
              <Button variant="outline">Save</Button>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
      code: `<TooltipProvider>   {/* once, in the shell */}
  <Tooltip content="Save" shortcut="⌘S">
    <Button variant="outline">Save</Button>
  </Tooltip>
</TooltipProvider>`,
    },
    {
      title: "Sides",
      render: () => (
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side} content={`Opens ${side}`} side={side}>
                <Button variant="secondary" size="sm">
                  {side}
                </Button>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      ),
      code: `<Tooltip content="Opens right" side="right">…</Tooltip>`,
    },
    {
      title: "Open state (controlled / default)",
      render: () => (
        <div className="flex h-16 items-end gap-2">
          <Tooltip content="Always shown in the catalog" defaultOpen>
            <Button variant="outline" size="sm">
              defaultOpen
            </Button>
          </Tooltip>
        </div>
      ),
      code: `<Tooltip content="…" open={open} onOpenChange={setOpen}>…</Tooltip>`,
    },
    {
      title: "In context: truncated cell and row actions",
      render: () => (
        <TooltipProvider>
          <div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-sm">
            <span className="w-24 font-medium text-fg">SO-20931</span>
            <Tooltip content="Midland Stamping & Fabrication, Plant 3 (Toledo)">
              <span className="flex-1 truncate text-fg-2">Midland Stamping & Fabrication, Plant 3 (Toledo)</span>
            </Tooltip>
            <span className="flex items-center gap-1">
              <IconButton label="Copy order number" size="sm" shortcut="⌘C">
                <Copy />
              </IconButton>
              <IconButton label="Edit order" size="sm">
                <Pencil />
              </IconButton>
              <IconButton label="Delete order" size="sm">
                <Trash2 />
              </IconButton>
            </span>
          </div>
        </TooltipProvider>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "content", type: "ReactNode", description: "The label. Empty content renders the child with no tooltip." },
    { name: "shortcut", type: "string", description: "Shown after the label as a Kbd chip." },
    { name: "side", type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", description: "Preferred side; flips on collision." },
    { name: "align", type: "'start' | 'center' | 'end'", default: "'center'", description: "Alignment along the side." },
    { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Controlled or uncontrolled open state." },
    { name: "delayDuration", type: "number", default: "300 (from TooltipProvider)", description: "Hover delay in ms for this tooltip." },
    { name: "TooltipProvider", type: "component", description: "Mount once in the shell; delayDuration 300, skipDelayDuration 300. Tooltip self-provides if missing." },
    { name: "TooltipRoot / TooltipTrigger / TooltipContent", type: "components", description: "Radix parts for custom composition." },
  ],
};
