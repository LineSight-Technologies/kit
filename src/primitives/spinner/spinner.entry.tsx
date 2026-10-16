import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Spinner } from "./spinner";

const meta = MANIFEST.find((m) => m.id === "spinner")!;

export const spinnerEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Sizes",
      render: () => (
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      ),
      code: `<Spinner size="sm" />
<Spinner />
<Spinner size="lg" />`,
    },
    {
      title: "Takes the surrounding colour",
      render: () => (
        <div className="flex items-center gap-4">
          <span className="text-fg-3">
            <Spinner />
          </span>
          <span className="text-accent">
            <Spinner />
          </span>
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-surface-inverse text-fg-inverse">
            <Spinner />
          </span>
        </div>
      ),
      code: `<span className="text-accent"><Spinner /></span>`,
    },
    {
      title: "Inline with text",
      render: () => (
        <div className="flex flex-col gap-2 text-sm text-fg-2">
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" label="Optimising" /> Optimising 38 work orders…
          </span>
          <span className="inline-flex items-center gap-2">
            <Spinner size="sm" label="Syncing" /> Pulling inventory from ERP
          </span>
        </div>
      ),
      code: `<span className="inline-flex items-center gap-2 text-sm text-fg-2">
  <Spinner size="sm" label="Optimising" /> Optimising 38 work orders…
</span>`,
    },
  ],
  props: [
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "14 / 16 / 24px." },
    { name: "label", type: "string", default: "'Loading'", description: "Screen-reader text (role=status). Never shown visually." },
  ],
};
