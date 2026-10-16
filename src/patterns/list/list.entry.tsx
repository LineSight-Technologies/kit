import { Building2, FileText, Pencil, Settings, Trash2, Users } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Avatar } from "../../primitives/avatar/avatar";
import { Badge, StatusBadge } from "../../primitives/badge/badge";
import { Checkbox } from "../../primitives/checkbox/checkbox";
import { ActionMenu } from "../../primitives/dropdown-menu/dropdown-menu";
import { List, ListRow } from "./list";

const meta = MANIFEST.find((m) => m.id === "list")!;

const recents = [
  { id: "SO-8810", customer: "Northfield Metals", status: "in_progress", when: "12 min ago" },
  { id: "SO-8812", customer: "Harbor Steel Supply", status: "scheduled", when: "1 h ago" },
  { id: "SO-8807", customer: "Prairie Fabrication", status: "shipped", when: "Yesterday" },
  { id: "SO-8799", customer: "Ridgeline Roofing", status: "on_hold", when: "Mon" },
];

const rowActions = [
  { label: "Edit", icon: <Pencil />, onSelect: () => {} },
  { separator: true as const },
  { label: "Delete", icon: <Trash2 />, destructive: true, onSelect: () => {} },
];

export const listEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Recent orders: avatar, title, meta, status and time, link rows",
      render: () => (
        <List className="max-w-xl">
          {recents.map((o) => (
            <ListRow
              key={o.id}
              href={`#${o.id}`}
              leading={<Avatar name={o.customer} shape="square" size="sm" />}
              title={o.id}
              meta={o.customer}
              trailing={
                <>
                  <StatusBadge status={o.status} size="sm" />
                  <span className="tabular-nums">{o.when}</span>
                </>
              }
            />
          ))}
        </List>
      ),
      code: `<List>
  {orders.map((o) => (
    <ListRow
      key={o.id}
      href={\`/orders/\${o.id}\`}
      leading={<Avatar name={o.customer} shape="square" size="sm" />}
      title={o.id}
      meta={o.customer}
      trailing={<StatusBadge status={o.status} size="sm" />}
    />
  ))}
</List>`,
    },
    {
      title: "Link rows with a chevron, one selected, one with an action menu",
      render: () => (
        <List className="max-w-md">
          <ListRow href="#customers" leading={<Users />} title="Customers" meta="42" />
          <ListRow href="#plants" leading={<Building2 />} title="Plants" meta="3" selected />
          <ListRow href="#documents" leading={<FileText />} title="Documents" meta="118" />
          <ListRow onClick={() => {}} leading={<Settings />} title="Line settings" trailing={<ActionMenu items={rowActions} />} />
        </List>
      ),
      code: `<ListRow href="/customers" leading={<Users />} title="Customers" meta="42" />
<ListRow href="/plants" leading={<Building2 />} title="Plants" selected />
<ListRow onClick={open} title="Line settings" trailing={<ActionMenu items={…} />} />`,
    },
    {
      title: "Checkbox rows, not divided",
      render: () => (
        <List divided={false} className="max-w-md">
          <ListRow leading={<Checkbox defaultChecked aria-label="Select C-10422" />} title="C-10422" meta="HDG G90 · 48.000 in" trailing={<Badge>42,180 lb</Badge>} />
          <ListRow leading={<Checkbox aria-label="Select C-10431" />} title="C-10431" meta="CR 1008 · 36.000 in" trailing={<Badge>21,450 lb</Badge>} />
          <ListRow leading={<Checkbox aria-label="Select C-10441" />} title="C-10441" meta="CR 1008 · 24.000 in" trailing={<Badge>12,300 lb</Badge>} />
        </List>
      ),
      code: `<List divided={false}>
  <ListRow leading={<Checkbox aria-label="Select C-10422" />} title="C-10422" meta="HDG G90 · 48.000 in" />
</List>`,
    },
    {
      title: "Loading and empty",
      render: () => (
        <div className="grid max-w-3xl grid-cols-2 gap-8">
          <List loading />
          <List />
        </div>
      ),
      code: `<List loading />\n<List empty={<EmptyState title="No recent orders" />} />`,
    },
  ],
  props: [
    { name: "List.divided", type: "boolean", default: "true", description: "Hairlines between rows." },
    { name: "List.loading / empty", type: "boolean / ReactNode", description: "Five placeholder rows; fallback when there are no rows." },
    { name: "ListRow.leading / title / meta / trailing", type: "ReactNode", description: "Avatar or icon · main text · secondary text (beside on wide, below on narrow) · badge, time or ActionMenu." },
    { name: "ListRow.href / onClick", type: "string / () => void", description: "Link or button row with hover and inset focus. A link with no trailing content shows a chevron." },
    { name: "ListRow.selected", type: "boolean", default: "false", description: "Accent-soft tint and aria-current." },
    { name: "ListRow.asChild", type: "boolean", default: "false", description: "Use the child (a router Link) as the row surface." },
  ],
};
