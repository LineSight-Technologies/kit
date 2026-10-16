import { Boxes, Plus, Scissors, Search } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../../primitives/button/button";
import { EmptyState, ErrorState } from "./empty-state";

const meta = MANIFEST.find((m) => m.id === "empty-state")!;

const panel = "w-full rounded-lg border border-line bg-surface";

export const emptyStateEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Page (md)",
      wide: true,
      render: () => (
        <div className={panel}>
          <EmptyState icon={<Boxes />} title="No coils in inventory" action={<Button leadingIcon={<Plus />}>Receive coil</Button>} />
        </div>
      ),
      code: `<EmptyState icon={<Boxes />} title="No coils in inventory" action={<Button leadingIcon={<Plus />}>Receive coil</Button>} />`,
    },
    {
      title: "Inside a panel or table body (sm)",
      render: () => (
        <div className="grid w-full gap-4 md:grid-cols-2">
          <div className={panel}>
            <EmptyState size="sm" icon={<Search />} title="No orders match these filters" action={<Button variant="secondary">Clear filters</Button>} />
          </div>
          <div className={panel}>
            <EmptyState size="sm" icon={<Scissors />} title="Nothing scheduled on Slitter 2" />
          </div>
        </div>
      ),
      code: `<EmptyState size="sm" icon={<Search />} title="No orders match these filters" action={<Button variant="secondary">Clear filters</Button>} />`,
    },
    {
      title: "ErrorState with retry",
      wide: true,
      render: () => (
        <div className={panel}>
          <ErrorState title="Could not load the schedule" error={new Error("Request timed out after 30 s")} onRetry={() => {}} />
        </div>
      ),
      code: `<ErrorState title="Could not load the schedule" error={error} onRetry={refetch} />`,
    },
    {
      title: "ErrorState defaults (sm)",
      render: () => (
        <div className="grid w-full gap-4 md:grid-cols-2">
          <div className={panel}>
            <ErrorState size="sm" onRetry={() => {}} />
          </div>
          <div className={panel}>
            <ErrorState size="sm" title="Pattern could not be generated" />
          </div>
        </div>
      ),
      code: `<ErrorState size="sm" onRetry={refetch} />`,
    },
  ],
  props: [
    { name: "icon", type: "ReactNode", description: "One lucide icon, shown in a soft square." },
    { name: "title", type: "ReactNode", description: "Names what is missing. There is no description slot." },
    { name: "action", type: "ReactNode", description: "One Button that teaches the next step." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "sm inside panels and table bodies; md for whole pages." },
    { name: "ErrorState.title", type: "ReactNode", default: "'Something went wrong'", description: "Names the problem." },
    { name: "ErrorState.error", type: "unknown", description: "The caught value; an Error's message renders as the one detail line." },
    { name: "ErrorState.onRetry", type: "() => void", description: "Shows a secondary Try again button." },
  ],
};
