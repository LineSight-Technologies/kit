import { Wrench } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { StatusBadge } from "../../primitives/badge/badge";
import { Button } from "../../primitives/button/button";
import { DetailPanel, PropertyList, Timeline, type PropertyItem, type TimelineEntry } from "./detail-panel";

const meta = MANIFEST.find((m) => m.id === "detail-panel")!;

/** Pinned so relative times in the catalog never drift. */
const NOW = "2026-03-10T14:00:00";

const facts: PropertyItem[] = [
  { label: "Work order", value: "WO-20931", copyable: true },
  { label: "Status", value: <StatusBadge status="in_progress" /> },
  { label: "Customer", value: "Northfield Metals" },
  { label: "Line", value: "Slitter 2" },
  { label: "Master coil", value: "C-10422", copyable: true },
  { label: "Product", value: "HDG G90" },
  { label: "Gauge", value: "0.0598 in" },
  { label: "Master width", value: "48.000 in" },
  { label: "Cuts", value: "4 × 11.750 in, 0.375 in scrap" },
  { label: "Scheduled", value: "Mar 10, 2026, 6:00 AM" },
  { label: "Due", value: "Mar 12, 2026" },
  { label: "Heat number", value: null },
];

const activity: TimelineEntry[] = [
  { id: "1", at: "2026-03-06T09:12:00", title: "Order received", body: "PO 44817 via the customer portal.", tone: "info" },
  { id: "2", at: "2026-03-07T15:40:00", title: "Master coil C-10422 allocated", actor: { name: "Dana Whitfield" } },
  { id: "3", at: "2026-03-08T08:05:00", title: "Scheduled on Slitter 2", actor: { name: "Marcus Reyes" } },
  { id: "4", at: "2026-03-09T16:20:00", title: "Knife change requested", body: "Arbor set-up changes from 4 to 5 cuts.", tone: "warn", icon: <Wrench /> },
  { id: "5", at: "2026-03-10T06:02:00", title: "Slitting started", tone: "accent", actor: { name: "Priya Natarajan" } },
  { id: "6", at: "2026-03-10T13:30:00", title: "Quality hold lifted", body: "Edge burr within 0.003 in.", tone: "success", actor: { name: "Dana Whitfield" } },
];

export const detailPanelEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Work order record: facts in three columns, then what happened",
      wide: true,
      render: () => (
        <DetailPanel className="max-w-3xl">
          <PropertyList columns={3} items={facts} />
          <Timeline items={activity} now={NOW} />
        </DetailPanel>
      ),
      code: `<DetailPanel>
  <PropertyList
    columns={3}
    items={[
      { label: "Work order", value: wo.number, copyable: true },
      { label: "Status", value: <StatusBadge status={wo.status} /> },
      { label: "Heat number", value: wo.heatNumber },   // null renders an en dash
    ]}
  />
  <Timeline items={wo.events.map((e) => ({ id: e.id, at: e.at, title: e.title, tone: e.tone, actor: e.by }))} />
</DetailPanel>`,
    },
    {
      title: "PropertyList: two columns, a wide value, compact size",
      render: () => (
        <PropertyList
          columns={2}
          size="compact"
          className="max-w-md"
          items={[
            { label: "Customer", value: "Northfield Metals" },
            { label: "Terms", value: "Net 30" },
            { label: "Ship to", value: "Dock 3, 1180 Mill Rd, Gary, IN 46402", span: 2 },
            { label: "Contact", value: <Button variant="link" className="h-auto text-sm">Dana Whitfield</Button> },
            { label: "Fax", value: "" },
          ]}
        />
      ),
      code: `<PropertyList columns={2} size="compact" items={[{ label: "Ship to", value: address, span: 2 }, …]} />`,
    },
    {
      title: "Timeline: oldest first",
      render: () => <Timeline items={activity.slice(0, 3)} order="asc" now={NOW} className="max-w-md" />,
      code: `<Timeline items={events} order="asc" />`,
    },
    {
      title: "Timeline: loading and empty",
      render: () => (
        <div className="grid max-w-2xl grid-cols-2 gap-8">
          <Timeline loading />
          <Timeline items={[]} />
        </div>
      ),
      code: `<Timeline loading />\n<Timeline items={[]} />`,
    },
  ],
  props: [
    { name: "DetailPanel", type: "children", description: "Vertical stack, gap-6. The one name for a record body." },
    { name: "PropertyList.items", type: "{ label, value, span?: 1 | 2, copyable?, copyValue? }[]", description: "Or pass Property children." },
    { name: "PropertyList.columns", type: "1 | 2 | 3", default: "2", description: "Columns at lg; two at sm; one below." },
    { name: "PropertyList.size", type: "'default' | 'compact'", default: "'default'", description: "Row gap 4 or 2." },
    { name: "Property.copyable", type: "boolean", default: "false", description: "Copy control on hover; copies copyValue or the text value." },
    { name: "Timeline.items", type: "{ id, at, title, body?, tone?, icon?, actor? }[]", description: "Dots take the tone; an actor renders an Avatar; an icon replaces the dot." },
    { name: "Timeline.order", type: "'desc' | 'asc'", default: "'desc'", description: "Newest first by default." },
    { name: "Timeline.loading / empty / now", type: "boolean / ReactNode / Date | string", description: "Placeholders, empty fallback, and a pinned reference time for relative labels." },
  ],
};
