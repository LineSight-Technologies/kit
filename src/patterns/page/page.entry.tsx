import { Copy, Pencil, Printer, Trash2 } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../../primitives/button/button";
import { ActionMenu } from "../../primitives/dropdown-menu/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "../../primitives/tabs/tabs";
import { Page, PageGrid, PageHeader, PageSection } from "./page";

const meta = MANIFEST.find((m) => m.id === "page")!;

const frame = "w-full overflow-hidden rounded-lg border border-line bg-surface";

const cuts = [
  ["1", "12.000 in", "2 × 6.000", "Harbor Steel Fabrication"],
  ["2", "8.500 in", "1 × 8.500", "Harbor Steel Fabrication"],
  ["3", "8.500 in", "1 × 8.500", "Northline Duct Co."],
  ["4", "16.250 in", "1 × 16.250", "Northline Duct Co."],
  ["5", "2.250 in", "scrap", "—"],
];

const coil: [string, string][] = [
  ["Coil", "C-10422"],
  ["Width", "48.000 in"],
  ["Gauge", "0.0598 in"],
  ["Weight", "42,180 lb"],
  ["Product", "HDG G90"],
  ["Mill", "Lakeshore Works"],
];

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <dt className="text-xs text-fg-3">{k}</dt>
          <dd className="tabular-nums text-fg">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function CutList() {
  return (
    <div className="flex flex-col text-sm">
      {cuts.map(([n, width, pieces, customer]) => (
        <div key={n} className="grid grid-cols-[2rem_7rem_7rem_1fr] items-center gap-3 border-b border-line py-2 last:border-b-0">
          <span className="tabular-nums text-fg-3">{n}</span>
          <span className="tabular-nums text-fg">{width}</span>
          <span className="tabular-nums text-fg-2">{pieces}</span>
          <span className="truncate text-fg-2">{customer}</span>
        </div>
      ))}
    </div>
  );
}

function RecordPage() {
  return (
    <div className={frame}>
      <Page>
        <PageHeader
          back={{ href: "#page", label: "Back to work orders" }}
          title="Work order WO-20418"
          status="In progress"
          actions={
            <>
              <Button variant="secondary" leadingIcon={<Printer />}>
                Print traveler
              </Button>
              <Button>Release to line</Button>
              <ActionMenu
                items={[
                  { label: "Edit", icon: <Pencil />, onSelect: () => {} },
                  { label: "Duplicate", icon: <Copy />, onSelect: () => {} },
                  { separator: true },
                  { label: "Cancel work order", icon: <Trash2 />, destructive: true, onSelect: () => {} },
                ]}
              />
            </>
          }
          tabs={
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cuts" count={5}>
                  Cuts
                </TabsTrigger>
                <TabsTrigger value="activity" count={14}>
                  Activity
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <PageSection
          title="Pattern"
          actions={
            <Button variant="ghost" size="sm" leadingIcon={<Pencil />}>
              Edit pattern
            </Button>
          }
        >
          <CutList />
        </PageSection>
        <PageSection title="Source coil">
          <Facts rows={coil} />
        </PageSection>
      </Page>
    </div>
  );
}

function StickyDemo() {
  return (
    <div className={`${frame} h-[320px] overflow-y-auto`}>
      <Page>
        <PageHeader sticky title="Inventory" actions={<Button variant="secondary">Export</Button>} />
        <PageSection title="Bay 4">
          <div className="flex flex-col gap-2 text-sm text-fg-2">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} className="tabular-nums">
                C-{10400 + i} · 48.000 in · 0.0598 in · {(41000 + i * 137).toLocaleString("en-US")} lb
              </span>
            ))}
          </div>
        </PageSection>
      </Page>
    </div>
  );
}

export const pageEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Record page",
      wide: true,
      render: () => <RecordPage />,
      code: `<Page>
  <PageHeader
    back={{ href: "/work-orders", label: "Back to work orders" }}
    title="Work order WO-20418"
    status={workOrder.status}
    actions={<><Button variant="secondary">Print traveler</Button><Button>Release to line</Button><ActionMenu items={…} /></>}
    tabs={<Tabs value={tab} onValueChange={setTab}><TabsList>…</TabsList></Tabs>}
  />
  <PageSection title="Pattern" actions={<Button variant="ghost" size="sm">Edit pattern</Button>}>…</PageSection>
  <PageSection title="Source coil">…</PageSection>
</Page>`,
    },
    {
      title: "List page, full width",
      wide: true,
      render: () => (
        <div className={frame}>
          <Page width="full">
            <PageHeader title="Coils" badges={<span className="text-sm tabular-nums text-fg-3">2,431</span>} actions={<Button>Receive coil</Button>} />
            <PageSection>
              <div className="h-24 rounded-md bg-surface-2" />
            </PageSection>
          </Page>
        </div>
      ),
      code: `<Page width="full">
  <PageHeader title="Coils" actions={<Button>Receive coil</Button>} />
  <Toolbar … />
  <DataTable … />
</Page>`,
    },
    {
      title: "Sections: plain, side by side, and the rare card",
      wide: true,
      render: () => (
        <div className={frame}>
          <Page>
            <PageHeader title="Slitter 2" status="Running" />
            <PageSection title="Today">
              <p className="text-sm text-fg-2">Three work orders released, one on hold for a knife change.</p>
            </PageSection>
            <PageGrid>
              <PageSection title="Knife setup">
                <Facts rows={[["Arbor", "4.000 in"], ["Knives", "12"], ["Spacers", "ok"]]} />
              </PageSection>
              <PageSection title="Crew">
                <Facts rows={[["Lead", "M. Reyes"], ["Shift", "Day"], ["Helpers", "2"]]} />
              </PageSection>
            </PageGrid>
            <PageSection title="Note from the floor" variant="card">
              <p className="text-sm text-fg-2">Recoiler tension drifted on the last two coils; checked and reset before WO-20418.</p>
            </PageSection>
          </Page>
        </div>
      ),
      code: `<PageSection title="Today">…</PageSection>
<PageGrid columns={2}>
  <PageSection title="Knife setup">…</PageSection>
  <PageSection title="Crew">…</PageSection>
</PageGrid>
<PageSection title="Note from the floor" variant="card">…</PageSection>`,
    },
    {
      title: "Sticky header",
      render: () => <StickyDemo />,
      code: `<PageHeader sticky title="Inventory" actions={…} />`,
    },
  ],
  props: [
    { name: "Page.width", type: "'default' | 'full'", default: "'default'", description: "default centres at max-w-page; full runs edge to edge for tables." },
    { name: "PageHeader.title", type: "ReactNode", description: "The h1 — the only display-font element on a screen." },
    { name: "PageHeader.status", type: "string", description: "Record status, rendered as a StatusBadge next to the title." },
    { name: "PageHeader.badges / actions", type: "ReactNode", description: "Extra badges after the status; actions right-aligned, wrapping under on narrow screens." },
    { name: "PageHeader.back", type: "{ href?, onClick?, label }", description: "Ghost ArrowLeft before the title." },
    { name: "PageHeader.tabs", type: "ReactNode", description: "A Tabs list (underline) under the title row." },
    { name: "PageHeader.sticky", type: "boolean", default: "false", description: "Sticks to the top of the scroll area and shows a hairline once content scrolls under it." },
    { name: "PageSection.title / actions", type: "ReactNode", description: "h2 and right-aligned controls. Plain sections are separated by a hairline, not boxed." },
    { name: "PageSection.variant", type: "'plain' | 'card'", default: "'plain'", description: "card is the rare raised case; never nest one in another." },
    { name: "PageGrid.columns", type: "2 | 3", default: "2", description: "Sections side by side from md (and xl for three)." },
  ],
};
