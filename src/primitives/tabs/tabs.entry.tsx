import { Clock, Layers, Package } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta = MANIFEST.find((m) => m.id === "tabs")!;

const panel = "rounded-lg border border-line bg-surface p-4 text-sm text-fg-2";

export const tabsEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Underline (page level) with counts",
      wide: true,
      render: () => (
        <Tabs defaultValue="open" className="w-full">
          <TabsList>
            <TabsTrigger value="open" count={42}>
              Open
            </TabsTrigger>
            <TabsTrigger value="scheduled" count={17}>
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="shipped" count={1204}>
              Shipped
            </TabsTrigger>
            <TabsTrigger value="archived" disabled>
              Archived
            </TabsTrigger>
          </TabsList>
          <TabsContent value="open" className={panel}>
            42 open orders across 9 customers.
          </TabsContent>
          <TabsContent value="scheduled" className={panel}>
            17 orders on this week's schedules.
          </TabsContent>
          <TabsContent value="shipped" className={panel}>
            1,204 shipped this quarter.
          </TabsContent>
        </Tabs>
      ),
      code: `<Tabs defaultValue="open">\n  <TabsList>\n    <TabsTrigger value="open" count={42}>Open</TabsTrigger>\n    <TabsTrigger value="scheduled" count={17}>Scheduled</TabsTrigger>\n  </TabsList>\n  <TabsContent value="open">…</TabsContent>\n</Tabs>`,
    },
    {
      title: "Pill (inside panels) with icons",
      render: () => (
        <Tabs defaultValue="coils">
          <TabsList variant="pill">
            <TabsTrigger value="coils" icon={<Package />}>
              Coils
            </TabsTrigger>
            <TabsTrigger value="patterns" icon={<Layers />}>
              Patterns
            </TabsTrigger>
            <TabsTrigger value="history" icon={<Clock />}>
              History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="coils" className={panel}>
            6 coils assigned to this schedule.
          </TabsContent>
          <TabsContent value="patterns" className={panel}>
            4 cutting patterns, 2 knife changes.
          </TabsContent>
          <TabsContent value="history" className={panel}>
            Regenerated twice today.
          </TabsContent>
        </Tabs>
      ),
      code: `<TabsList variant="pill">\n  <TabsTrigger value="coils" icon={<Package />}>Coils</TabsTrigger>\n</TabsList>`,
    },
    {
      title: "Record page: underline tabs under the header",
      wide: true,
      render: () => (
        <div className="w-full rounded-lg border border-line bg-surface">
          <div className="flex items-center justify-between px-6 pt-5">
            <div className="font-display text-xl font-semibold tracking-ls-display text-fg">Northgate Fabrication</div>
            <span className="inline-flex h-6 items-center rounded-full bg-success-soft px-2 text-xs font-medium text-success">Active</span>
          </div>
          <Tabs defaultValue="orders">
            <TabsList className="px-6 pt-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders" count={12}>
                Orders
              </TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="contacts" count={3}>
                Contacts
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="px-6 pb-6 text-sm text-fg-2">
              Toll processor since 2019. Net 30.
            </TabsContent>
            <TabsContent value="orders" className="px-6 pb-6 text-sm text-fg-2">
              12 open orders, 3 due this week.
            </TabsContent>
            <TabsContent value="pricing" className="px-6 pb-6 text-sm text-fg-2">
              $4.10/cwt slitting, $0.85/cwt packaging.
            </TabsContent>
            <TabsContent value="contacts" className="px-6 pb-6 text-sm text-fg-2">
              Purchasing, receiving, accounts payable.
            </TabsContent>
          </Tabs>
        </div>
      ),
    },
  ],
  props: [
    { name: "TabsList.variant", type: "'underline' | 'pill'", default: "'underline'", description: "Flows to every TabsTrigger through context." },
    { name: "TabsTrigger.count", type: "number", description: "Small tabular number after the label." },
    { name: "TabsTrigger.icon", type: "ReactNode", description: "Leading lucide icon, size-4." },
    { name: "value / onValueChange", type: "string / (value) => void", description: "Controlled mode on `Tabs`; `defaultValue` for uncontrolled." },
  ],
};
