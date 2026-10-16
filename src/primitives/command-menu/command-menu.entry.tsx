import * as React from "react";
import { Calendar, FileText, Package, Plus, Scissors, Settings, Users } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { Kbd } from "../kbd/kbd";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandMenu, useCommandMenu, type CommandMenuGroup } from "./command-menu";

const meta = MANIFEST.find((m) => m.id === "command-menu")!;

function makeGroups(log: (s: string) => void): CommandMenuGroup[] {
  return [
    {
      heading: "Go to",
      items: [
        { id: "orders", label: "Orders", icon: <FileText />, shortcut: "G O", onSelect: () => log("Orders") },
        { id: "inventory", label: "Inventory", icon: <Package />, shortcut: "G I", onSelect: () => log("Inventory") },
        { id: "schedule", label: "Schedule", icon: <Calendar />, shortcut: "G S", onSelect: () => log("Schedule") },
        { id: "customers", label: "Customers", icon: <Users />, onSelect: () => log("Customers") },
        { id: "settings", label: "Settings", icon: <Settings />, onSelect: () => log("Settings") },
      ],
    },
    {
      heading: "Create",
      items: [
        { id: "new-order", label: "New order", icon: <Plus />, keywords: ["create", "add"], onSelect: () => log("New order") },
        { id: "new-schedule", label: "Generate schedule", icon: <Scissors />, keywords: ["optimize", "run"], onSelect: () => log("Generate schedule") },
      ],
    },
    {
      heading: "Records",
      items: [
        { id: "c-10422", label: "C-10422", icon: <Package />, meta: "Coil · 48.000 in", keywords: ["coil"], onSelect: () => log("C-10422") },
        { id: "wo-2291", label: "WO-2291", icon: <FileText />, meta: "Work order · Northgate", keywords: ["work order"], onSelect: () => log("WO-2291") },
        { id: "so-8810", label: "SO-8810", icon: <FileText />, meta: "Order · Harbor Metals", keywords: ["sales order"], onSelect: () => log("SO-8810") },
      ],
    },
  ];
}

function Shell() {
  const { open, setOpen } = useCommandMenu();
  const [last, setLast] = React.useState<string | null>(null);
  const groups = React.useMemo(() => makeGroups(setLast), []);
  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open command menu
      </Button>
      <span className="flex items-center gap-1 text-sm text-fg-3">
        or press <Kbd>⌘K</Kbd>
      </span>
      {last ? <span className="text-sm text-fg-2">Selected: {last}</span> : null}
      <CommandMenu open={open} onOpenChange={setOpen} groups={groups} recentIds={["wo-2291", "schedule"]} />
    </div>
  );
}

function Async() {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [groups, setGroups] = React.useState<CommandMenuGroup[]>(() => makeGroups(() => {}).slice(0, 1));
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onQueryChange = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    if (!q) {
      setLoading(false);
      setGroups(makeGroups(() => {}).slice(0, 1));
      return;
    }
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      setGroups(makeGroups(() => {}));
    }, 700);
  };
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Async search
      </Button>
      <CommandMenu open={open} onOpenChange={setOpen} groups={groups} loading={loading} onQueryChange={onQueryChange} emptyText="No records match" placeholder="Search coils, orders, customers…" />
    </>
  );
}

export const commandMenuEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "⌘K palette with groups, shortcuts, meta and recents",
      render: () => <Shell />,
      code: `const { open, setOpen } = useCommandMenu(); // binds ⌘K / Ctrl+K\n<CommandMenu\n  open={open}\n  onOpenChange={setOpen}\n  groups={[{ heading: "Go to", items: [{ id: "orders", label: "Orders", icon: <FileText />, shortcut: "G O", onSelect: go }] }]}\n  recentIds={recent}\n/>`,
    },
    {
      title: "Loading state (async results)",
      render: () => <Async />,
      code: `<CommandMenu … loading={isFetching} onQueryChange={setQuery} shouldFilter />`,
    },
    {
      title: "Raw Command wrappers (inline picker)",
      render: () => (
        <Command className="w-80 rounded-lg border border-line shadow-ls-1">
          <CommandInput placeholder="Pick a slitter" />
          <CommandList>
            <CommandEmpty>No slitter matches</CommandEmpty>
            <CommandGroup heading="Slitters">
              <CommandItem value="line-1">
                <Scissors /> Line 1 <span className="ml-auto text-xs text-fg-3">72 in</span>
              </CommandItem>
              <CommandItem value="line-2">
                <Scissors /> Line 2 <span className="ml-auto text-xs text-fg-3">60 in</span>
              </CommandItem>
              <CommandItem value="line-3" disabled>
                <Scissors /> Line 3 <span className="ml-auto text-xs text-fg-3">Down</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ),
      code: `<Command>\n  <CommandInput placeholder="Pick a slitter" />\n  <CommandList>\n    <CommandEmpty>No slitter matches</CommandEmpty>\n    <CommandGroup heading="Slitters"><CommandItem value="line-1">Line 1</CommandItem></CommandGroup>\n  </CommandList>\n</Command>`,
    },
  ],
  props: [
    { name: "open / onOpenChange", type: "boolean / (open) => void", description: "Controlled. `useCommandMenu()` supplies both and binds ⌘K." },
    { name: "groups", type: "{ heading, items: { id, label, icon?, shortcut?, keywords?, onSelect, meta?, disabled? }[] }[]", description: "The palette as data." },
    { name: "recentIds", type: "string[]", description: "Ids floated into a Recent group while the query is empty." },
    { name: "loading", type: "boolean", default: "false", description: "Spinner row under the input." },
    { name: "emptyText", type: "string", default: "'No results'", description: "" },
    { name: "onQueryChange", type: "(query) => void", description: "Hook for async search." },
    { name: "shouldFilter", type: "boolean", default: "true", description: "Set false when results arrive already filtered." },
  ],
};
