import * as React from "react";
import { Archive, ChevronDown, Copy, Download, FileText, Pencil, Printer, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import {
  ActionMenu,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta = MANIFEST.find((m) => m.id === "dropdown-menu")!;

function Basic() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" trailingIcon={<ChevronDown />}>
          Coil actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Coil C-10422</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem icon={<Pencil />} shortcut="E">
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Copy />} shortcut="⌘D">
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger icon={<Download />}>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem icon={<FileText />}>CSV</DropdownMenuItem>
              <DropdownMenuItem icon={<Printer />}>Coil tag (PDF)</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Archive />}>Archive</DropdownMenuItem>
        <DropdownMenuItem icon={<Trash2 />} destructive shortcut="⌫">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColumnsMenu() {
  const [gauge, setGauge] = React.useState(true);
  const [piw, setPiw] = React.useState(false);
  const [sort, setSort] = React.useState("width");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" trailingIcon={<ChevronDown />}>
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={gauge} onCheckedChange={(v) => setGauge(v === true)}>
          Gauge
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={piw} onCheckedChange={(v) => setPiw(v === true)}>
          PIW
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenuRadioItem value="width">Width</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="weight">Weight</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="received">Received date</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RowWithActions() {
  const [last, setLast] = React.useState<string | null>(null);
  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="font-medium text-fg">WO-2291 · Northgate Fabrication</div>
        <div className="text-xs text-fg-3">{last ? `Last action: ${last}` : "4 cuts · 48.000 in · 0.0598 in"}</div>
      </div>
      <ActionMenu
        items={[
          { label: "Edit", icon: <Pencil />, shortcut: "E", onSelect: () => setLast("Edit") },
          { label: "Print tags", icon: <Printer />, onSelect: () => setLast("Print tags") },
          { label: "Duplicate", icon: <Copy />, disabled: true, onSelect: () => setLast("Duplicate") },
          { separator: true },
          { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => setLast("Delete") },
        ]}
      />
    </div>
  );
}

export const dropdownMenuEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Items, shortcuts, submenu, destructive last",
      render: () => <Basic />,
      code: `<DropdownMenu>\n  <DropdownMenuTrigger asChild><Button variant="outline">Coil actions</Button></DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem icon={<Pencil />} shortcut="E">Edit</DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem icon={<Trash2 />} destructive>Delete</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`,
    },
    {
      title: "Checkbox and radio items",
      render: () => <ColumnsMenu />,
      code: `<DropdownMenuCheckboxItem checked={gauge} onCheckedChange={setGauge}>Gauge</DropdownMenuCheckboxItem>\n<DropdownMenuRadioGroup value={sort} onValueChange={setSort}>\n  <DropdownMenuRadioItem value="width">Width</DropdownMenuRadioItem>\n</DropdownMenuRadioGroup>`,
    },
    {
      title: "ActionMenu on a row",
      render: () => <RowWithActions />,
      code: `<ActionMenu items={[\n  { label: "Edit", icon: <Pencil />, onSelect: edit },\n  { separator: true },\n  { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: remove },\n]} />`,
    },
  ],
  props: [
    { name: "DropdownMenuItem.icon", type: "ReactNode", description: "Leading lucide icon." },
    { name: "DropdownMenuItem.shortcut", type: "string", description: "Rendered right-aligned as a Kbd. Display only." },
    { name: "DropdownMenuItem.destructive", type: "boolean", default: "false", description: "Danger tone; highlighted in danger-soft." },
    { name: "ActionMenu.items", type: "({ label, icon?, shortcut?, destructive?, disabled?, onSelect } | { separator: true })[]", description: "Menu as data." },
    { name: "ActionMenu.trigger", type: "ReactNode", default: "ghost ellipsis button", description: "Custom trigger element." },
    { name: "ActionMenu.align", type: "'start' | 'center' | 'end'", default: "'end'", description: "Menu alignment." },
  ],
};
