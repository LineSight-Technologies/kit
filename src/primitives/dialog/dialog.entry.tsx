import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

const meta = MANIFEST.find((m) => m.id === "dialog")!;

function SizeDemo({ size }: { size: "sm" | "md" | "lg" }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{size}</Button>
      </DialogTrigger>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>Reassign work order WO-2291</DialogTitle>
        </DialogHeader>
        <DialogBody>Move this work order to a different slitter. The schedule will be recalculated.</DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Reassign</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const fieldClass =
  "h-control w-full rounded-md border border-line bg-surface px-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

function EditCoil() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit coil</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit coil C-10422</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-3 py-1">
            <label className="flex flex-col gap-1.5 text-sm text-fg">
              Width (in)
              <input className={fieldClass} defaultValue="48.000" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg">
              Gauge (in)
              <input className={fieldClass} defaultValue="0.0598" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg">
              Weight (lb)
              <input className={fieldClass} defaultValue="42,180" />
            </label>
            <label className="flex flex-col gap-1.5 text-sm text-fg">
              Heat
              <input className={fieldClass} defaultValue="H-77120" />
            </label>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LongBody() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Tall body (scrolls)</Button>
      </DialogTrigger>
      <DialogContent size="md" hideClose>
        <DialogHeader>
          <DialogTitle>Release notes</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-3">
            {Array.from({ length: 18 }, (_, i) => (
              <p key={i}>
                Schedule {i + 1}: knife changes reduced by grouping widths, scrap held under 2.1% on the 72-inch line.
              </p>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const dialogEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Sizes",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <SizeDemo size="sm" />
          <SizeDemo size="md" />
          <SizeDemo size="lg" />
        </div>
      ),
      code: `<Dialog>\n  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>\n  <DialogContent size="md">\n    <DialogHeader><DialogTitle>Reassign work order</DialogTitle></DialogHeader>\n    <DialogBody>…</DialogBody>\n    <DialogFooter>\n      <DialogClose asChild><Button variant="secondary">Cancel</Button></DialogClose>\n      <Button>Reassign</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`,
    },
    { title: "Edit form", render: () => <EditCoil /> },
    { title: "Scrolling body, no close control", render: () => <LongBody />, code: `<DialogContent hideClose>…</DialogContent>` },
  ],
  props: [
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "max-w-sm / max-w-lg / max-w-2xl." },
    { name: "hideClose", type: "boolean", default: "false", description: "Drop the top-right close control. Only when the footer offers a way out." },
    { name: "open / onOpenChange", type: "boolean / (open) => void", description: "Controlled mode on `Dialog`." },
  ],
};
