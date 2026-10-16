import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Kbd, KbdGroup } from "./kbd";

const meta = MANIFEST.find((m) => m.id === "kbd")!;

export const kbdEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Keys",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Kbd>⌘K</Kbd>
          <Kbd>Esc</Kbd>
          <Kbd>⏎</Kbd>
          <Kbd>⇧⏎</Kbd>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          <Kbd>/</Kbd>
        </div>
      ),
      code: `<Kbd>⌘K</Kbd>
<Kbd>Esc</Kbd>`,
    },
    {
      title: "Sequences",
      render: () => (
        <div className="flex flex-wrap items-center gap-4">
          <KbdGroup>
            <Kbd>G</Kbd>
            <Kbd>O</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
        </div>
      ),
      code: `<KbdGroup><Kbd>G</Kbd><Kbd>O</Kbd></KbdGroup>`,
    },
    {
      title: "In context: menu items",
      render: () => (
        <div className="flex w-64 flex-col rounded-md border border-line bg-surface p-1 shadow-ls-2 text-sm text-fg">
          {[
            ["Go to orders", ["G", "O"]],
            ["Go to inventory", ["G", "I"]],
            ["New work order", ["⌘", "N"]],
            ["Search", ["⌘K"]],
          ].map(([label, keys]) => (
            <div key={label as string} className="flex h-8 items-center justify-between rounded-sm px-2 hover:bg-surface-3">
              <span>{label as string}</span>
              <KbdGroup>
                {(keys as string[]).map((k) => (
                  <Kbd key={k}>{k}</Kbd>
                ))}
              </KbdGroup>
            </div>
          ))}
        </div>
      ),
    },
  ],
  props: [
    { name: "children", type: "ReactNode", description: "The key cap text, e.g. ⌘K, Esc, ⏎." },
    { name: "KbdGroup", type: "component", description: "Lays several Kbd in a row for sequences and chords." },
  ],
};
