import { Pencil, Printer, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { ActionMenu } from "../dropdown-menu/dropdown-menu";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "./sheet";

const meta = MANIFEST.find((m) => m.id === "sheet")!;

type Side = "right" | "left" | "bottom";
type Size = "sm" | "md" | "lg" | "xl";

function Demo({ side, size, label }: { side?: Side; size?: Size; label: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">{label}</Button>
      </SheetTrigger>
      <SheetContent side={side} size={size}>
        <SheetHeader title="New customer" />
        <SheetBody>
          <p className="text-fg-2">
            Side <span className="font-medium text-fg">{side ?? "right"}</span>, size <span className="font-medium text-fg">{size ?? "md"}</span>.
          </p>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

const facts: [string, string][] = [
  ["Width", "48.000 in"],
  ["Gauge", "0.0598 in"],
  ["Weight", "42,180 lb"],
  ["PIW", "879"],
  ["Heat", "H-77120"],
  ["Product", "HDG G90"],
  ["Mill", "Lakeshore Works"],
  ["Received", "Oct 9, 2026"],
  ["Location", "Bay 4, row 12"],
  ["Hold", "None"],
];

function CoilPeek() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Peek at coil C-10422</Button>
      </SheetTrigger>
      <SheetContent size="md">
        <SheetHeader
          title="Coil C-10422"
          actions={
            <>
              <span className="inline-flex h-6 items-center rounded-full bg-success-soft px-2 text-xs font-medium text-success">Available</span>
              <ActionMenu
                items={[
                  { label: "Edit", icon: <Pencil />, onSelect: () => {} },
                  { label: "Print tag", icon: <Printer />, onSelect: () => {} },
                  { separator: true },
                  { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => {} },
                ]}
              />
            </>
          }
        />
        <SheetBody>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <dt className="text-xs text-fg-3">{k}</dt>
                <dd className="tabular-nums text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-paper-6" />
                <div className="flex flex-col">
                  <span className="text-fg">Moved to Bay 4, row {12 - i}</span>
                  <span className="text-xs text-fg-3">Oct {9 - (i % 9)}, 2026 · M. Reyes</span>
                </div>
              </div>
            ))}
          </div>
        </SheetBody>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="secondary">Close</Button>
          </SheetClose>
          <Button>Add to schedule</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const sheetEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Sizes (right)",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Demo size="sm" label="sm · 400" />
          <Demo size="md" label="md · 520" />
          <Demo size="lg" label="lg · 720" />
          <Demo size="xl" label="xl · 960" />
        </div>
      ),
      code: `<Sheet>\n  <SheetTrigger asChild><Button>New customer</Button></SheetTrigger>\n  <SheetContent size="md">\n    <SheetHeader title="New customer" />\n    <SheetBody>…</SheetBody>\n    <SheetFooter>\n      <SheetClose asChild><Button variant="secondary">Cancel</Button></SheetClose>\n      <Button>Save</Button>\n    </SheetFooter>\n  </SheetContent>\n</Sheet>`,
    },
    {
      title: "Sides",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Demo side="right" label="right" />
          <Demo side="left" label="left" />
          <Demo side="bottom" label="bottom" />
        </div>
      ),
      code: `<SheetContent side="left">…</SheetContent>`,
    },
    {
      title: "Coil peek with status and actions",
      render: () => <CoilPeek />,
      code: `<SheetHeader title="Coil C-10422" actions={<><StatusBadge status="available" /><ActionMenu items={…} /></>} />`,
    },
  ],
  props: [
    { name: "side", type: "'right' | 'left' | 'bottom'", default: "'right'", description: "Edge the panel slides from." },
    { name: "size", type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: "400 / 520 / 720 / 960 px wide from the sm breakpoint; full width below it. Ignored for bottom." },
    { name: "SheetHeader.title", type: "ReactNode", description: "Rendered through SheetTitle; names the dialog for assistive tech." },
    { name: "SheetHeader.actions", type: "ReactNode", description: "Right-aligned before the close control: status badge, ActionMenu." },
    { name: "SheetHeader.hideClose", type: "boolean", default: "false", description: "Drop the close control." },
  ],
};
