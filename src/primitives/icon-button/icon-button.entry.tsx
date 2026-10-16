import { Copy, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { IconButton } from "./icon-button";

const meta = MANIFEST.find((m) => m.id === "icon-button")!;

export const iconButtonEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Variants",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="New coil" variant="primary">
            <Plus />
          </IconButton>
          <IconButton label="Duplicate" variant="secondary">
            <Copy />
          </IconButton>
          <IconButton label="Edit" variant="outline">
            <Pencil />
          </IconButton>
          <IconButton label="More actions" variant="ghost">
            <MoreHorizontal />
          </IconButton>
          <IconButton label="Delete coil" variant="danger">
            <Trash2 />
          </IconButton>
        </div>
      ),
      code: `<IconButton label="New coil" variant="primary"><Plus /></IconButton>
<IconButton label="Edit" variant="outline"><Pencil /></IconButton>
<IconButton label="More actions"><MoreHorizontal /></IconButton>
<IconButton label="Delete coil" variant="danger"><Trash2 /></IconButton>`,
    },
    {
      title: "Sizes",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="Edit" size="sm" variant="outline">
            <Pencil />
          </IconButton>
          <IconButton label="Edit" size="md" variant="outline">
            <Pencil />
          </IconButton>
          <IconButton label="Edit" size="lg" variant="outline">
            <Pencil />
          </IconButton>
        </div>
      ),
      code: `<IconButton label="Edit" size="sm"><Pencil /></IconButton>
<IconButton label="Edit" size="md"><Pencil /></IconButton>
<IconButton label="Edit" size="lg"><Pencil /></IconButton>`,
    },
    {
      title: "Loading, disabled, shortcut, no tooltip",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <IconButton label="Refresh inventory" variant="outline" loading>
            <RefreshCw />
          </IconButton>
          <IconButton label="Delete coil" variant="danger" disabled>
            <Trash2 />
          </IconButton>
          <IconButton label="Copy coil ID" shortcut="⌘C">
            <Copy />
          </IconButton>
          <IconButton label="Close" tooltip={false}>
            <X />
          </IconButton>
        </div>
      ),
      code: `<IconButton label="Refresh inventory" loading><RefreshCw /></IconButton>
<IconButton label="Copy coil ID" shortcut="⌘C"><Copy /></IconButton>
<IconButton label="Close" tooltip={false}><X /></IconButton>`,
    },
    {
      title: "In context: table row actions",
      render: () => (
        <div className="w-full max-w-xl overflow-hidden rounded-lg border border-line bg-surface">
          {[
            ["C-118204", "0.060 × 60.000", "Galvanneal", "38,410 lb"],
            ["C-118209", "0.048 × 48.000", "HDG", "41,200 lb"],
            ["C-118215", "0.036 × 36.000", "Cold rolled", "22,980 lb"],
          ].map(([id, dims, grade, wt], i) => (
            <div key={id} className={["flex h-12 items-center gap-4 px-3 text-sm", i > 0 ? "border-t border-line" : ""].join(" ")}>
              <span className="w-24 font-medium text-fg">{id}</span>
              <span className="w-32 tabular-nums text-fg-2">{dims}</span>
              <span className="flex-1 text-fg-2">{grade}</span>
              <span className="w-20 text-right tabular-nums text-fg-2">{wt}</span>
              <span className="flex items-center gap-1">
                <IconButton label="Edit coil" size="sm">
                  <Pencil />
                </IconButton>
                <IconButton label="More actions" size="sm">
                  <MoreHorizontal />
                </IconButton>
              </span>
            </div>
          ))}
        </div>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "label", type: "string", description: "Required. Accessible name and tooltip text." },
    { name: "variant", type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'", default: "'ghost'", description: "Same tones as Button. Ghost is right for row and toolbar actions." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Square 32 / 36 / 40px." },
    { name: "tooltip", type: "boolean", default: "true", description: "Set false to suppress the tooltip (e.g. a close button in a dialog header)." },
    { name: "tooltipSide", type: "'top' | 'right' | 'bottom' | 'left'", default: "'top'", description: "Where the tooltip appears." },
    { name: "shortcut", type: "string", description: "Keyboard shortcut shown in the tooltip." },
    { name: "loading", type: "boolean", default: "false", description: "Spinner replaces the icon; button is disabled and aria-busy." },
    { name: "asChild", type: "boolean", default: "false", description: "Style the child element (a router Link) instead of rendering a button." },
  ],
};
