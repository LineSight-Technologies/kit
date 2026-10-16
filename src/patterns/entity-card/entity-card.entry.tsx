import { Image as ImageIcon, Mail, Pencil, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Avatar } from "../../primitives/avatar/avatar";
import { Badge, StatusBadge } from "../../primitives/badge/badge";
import { ActionMenu } from "../../primitives/dropdown-menu/dropdown-menu";
import { PropertyList } from "../detail-panel/detail-panel";
import { EntityCard, EntityGrid } from "./entity-card";

const meta = MANIFEST.find((m) => m.id === "entity-card")!;

const customers = [
  { name: "Northfield Metals", city: "Gary, IN", status: "active", orders: 12, tag: "Toll" },
  { name: "Harbor Steel Supply", city: "Toledo, OH", status: "active", orders: 7, tag: "Distributor" },
  { name: "Prairie Fabrication", city: "Des Moines, IA", status: "on_hold", orders: 2, tag: "OEM" },
  { name: "Ridgeline Roofing", city: "Boise, ID", status: "inactive", orders: 0, tag: "OEM" },
];

const actions = (name: string) => [
  { label: "Edit", icon: <Pencil />, onSelect: () => console.log("edit", name) },
  { label: "Email contact", icon: <Mail />, onSelect: () => console.log("email", name) },
  { separator: true as const },
  { label: "Archive", icon: <Trash2 />, destructive: true, onSelect: () => console.log("archive", name) },
];

const people = [
  { name: "Dana Whitfield", role: "Plant manager", line: "Slitter 2" },
  { name: "Marcus Reyes", role: "Scheduler", line: "All lines" },
  { name: "Priya Natarajan", role: "Line lead", line: "Slitter 1" },
];

export const entityCardEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Customer grid: square avatar, meta, badges, hover actions, one selected",
      wide: true,
      render: () => (
        <EntityGrid>
          {customers.map((c, i) => (
            <EntityCard
              key={c.name}
              href={`#${c.name}`}
              selected={i === 1}
              media={<Avatar name={c.name} shape="square" size="lg" />}
              title={c.name}
              meta={c.city}
              badges={
                <>
                  <StatusBadge status={c.status} size="sm" />
                  <Badge size="sm" variant="outline">
                    {c.tag}
                  </Badge>
                </>
              }
              actions={<ActionMenu items={actions(c.name)} />}
            />
          ))}
        </EntityGrid>
      ),
      code: `<EntityGrid>
  {customers.map((c) => (
    <EntityCard
      key={c.id}
      href={\`/customers/\${c.id}\`}
      media={<Avatar name={c.name} shape="square" size="lg" />}
      title={c.name}
      meta={c.city}
      badges={<StatusBadge status={c.status} size="sm" />}
      actions={<ActionMenu items={…} />}
    />
  ))}
</EntityGrid>`,
    },
    {
      title: "People with a compact PropertyList",
      wide: true,
      render: () => (
        <EntityGrid className="lg:grid-cols-3 xl:grid-cols-3">
          {people.map((p) => (
            <EntityCard key={p.name} onClick={() => console.log(p.name)} media={<Avatar name={p.name} size="lg" />} title={p.name} meta={p.role}>
              <PropertyList
                columns={2}
                size="compact"
                items={[
                  { label: "Line", value: p.line },
                  { label: "Shift", value: "Days" },
                ]}
              />
            </EntityCard>
          ))}
        </EntityGrid>
      ),
      code: `<EntityCard onClick={open} media={<Avatar name={p.name} size="lg" />} title={p.name} meta={p.role}>
  <PropertyList columns={2} size="compact" items={[{ label: "Line", value: p.line }]} />
</EntityCard>`,
    },
    {
      title: "Cover image slot (4:3), static",
      render: () => (
        <EntityGrid className="max-w-2xl sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
          {["Slitter 1", "Slitter 2"].map((line) => (
            <EntityCard
              key={line}
              mediaVariant="cover"
              media={
                <div className="flex size-full items-center justify-center text-fg-3">
                  <ImageIcon className="size-5" />
                </div>
              }
              title={line}
              meta="72 in max width · 0.135 in max gauge"
              badges={<StatusBadge status="running" size="sm" />}
            />
          ))}
        </EntityGrid>
      ),
      code: `<EntityCard mediaVariant="cover" media={<img src={line.photo} alt="" />} title={line.name} meta={line.limits} />`,
    },
  ],
  props: [
    { name: "media / mediaVariant", type: "ReactNode / 'inline' | 'cover'", default: "– / 'inline'", description: "An Avatar beside the title, or an image slot on top at 4:3." },
    { name: "title / meta / badges", type: "ReactNode", description: "Title (h3), one meta line, a badges row." },
    { name: "actions", type: "ReactNode", description: "Top-right, visible on hover and focus-within. Pass an ActionMenu." },
    { name: "href / onClick", type: "string / () => void", description: "The whole card becomes a link or button; actions stay separate controls." },
    { name: "selected", type: "boolean", default: "false", description: "Accent border and aria-current." },
    { name: "children", type: "ReactNode", description: "Below the header, e.g. a compact PropertyList." },
    { name: "EntityGrid", type: "children", description: "1 / 2 / 3 / 4 columns by breakpoint, gap-4." },
  ],
};
