import { ArrowRight, Download, Plus, Scissors, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "./button";

const meta = MANIFEST.find((m) => m.id === "button")!;

export const buttonEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Variants",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Button>Generate schedule</Button>
          <Button variant="secondary">Save draft</Button>
          <Button variant="outline">Export</Button>
          <Button variant="ghost">Cancel</Button>
          <Button variant="danger">Delete order</Button>
          <Button variant="link">View coil history</Button>
        </div>
      ),
      code: `<Button>Generate schedule</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="outline">Export</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="danger">Delete order</Button>
<Button variant="link">View coil history</Button>`,
    },
    {
      title: "Sizes",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
      code: `<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`,
    },
    {
      title: "With icons",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Button leadingIcon={<Plus />}>New order</Button>
          <Button variant="outline" leadingIcon={<Download />}>
            Export CSV
          </Button>
          <Button variant="secondary" trailingIcon={<ArrowRight />}>
            Next coil
          </Button>
          <Button variant="link" trailingIcon={<ArrowRight />}>
            All work orders
          </Button>
        </div>
      ),
      code: `<Button leadingIcon={<Plus />}>New order</Button>
<Button variant="outline" leadingIcon={<Download />}>Export CSV</Button>
<Button variant="secondary" trailingIcon={<ArrowRight />}>Next coil</Button>`,
    },
    {
      title: "Loading & disabled",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Button loading>Optimising</Button>
          <Button loading leadingIcon={<Scissors />}>
            Slitting plan
          </Button>
          <Button variant="outline" loading>
            Syncing ERP
          </Button>
          <Button disabled>Approve</Button>
          <Button variant="danger" disabled>
            Delete order
          </Button>
        </div>
      ),
      code: `<Button loading>Optimising</Button>
<Button loading leadingIcon={<Scissors />}>Slitting plan</Button>
<Button disabled>Approve</Button>`,
    },
    {
      title: "Full width & asChild",
      render: () => (
        <div className="flex w-72 flex-col gap-2">
          <Button fullWidth>Release to floor</Button>
          <Button asChild variant="outline" fullWidth>
            <a href="#orders">Open orders list</a>
          </Button>
        </div>
      ),
      code: `<Button fullWidth>Release to floor</Button>
<Button asChild variant="outline" fullWidth>
  <Link to="/orders">Open orders list</Link>
</Button>`,
    },
    {
      title: "In context: work order actions",
      render: () => (
        <div className="flex w-full max-w-xl items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4 shadow-ls-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-fg">WO-48213 · 0.048 × 48.000 HDG</span>
            <span className="text-xs text-fg-3">Line 2 · 6 cuts · 41,200 lb</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leadingIcon={<Trash2 />}>
              Remove
            </Button>
            <Button variant="outline" size="sm">
              Edit pattern
            </Button>
            <Button size="sm" leadingIcon={<Scissors />}>
              Release
            </Button>
          </div>
        </div>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "variant", type: "'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'", default: "'primary'", description: "Visual weight. One primary per view." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control height 32 / 36 / 40px. Link ignores height." },
    { name: "loading", type: "boolean", default: "false", description: "Shows a Spinner, disables the button, sets aria-busy. Width does not change." },
    { name: "leadingIcon", type: "ReactNode", description: "A lucide icon before the label, sized to 16px." },
    { name: "trailingIcon", type: "ReactNode", description: "A lucide icon after the label, sized to 16px." },
    { name: "fullWidth", type: "boolean", default: "false", description: "Stretch to the parent width." },
    { name: "asChild", type: "boolean", default: "false", description: "Style the child element (a router Link) instead of rendering a button. Icons and loading are not applied." },
    { name: "disabled", type: "boolean", default: "false", description: "Native disabled; 50% opacity, no pointer events." },
  ],
};
