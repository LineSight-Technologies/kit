import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { TONES } from "../../lib/tone";
import { Badge, StatusBadge } from "./badge";

const meta = MANIFEST.find((m) => m.id === "badge")!;

const labels = { neutral: "Neutral", accent: "Accent", success: "Success", warn: "Warn", danger: "Danger", info: "Info" } as const;

export const badgeEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Tones × variants",
      render: () => (
        <div className="flex flex-col gap-3">
          {(["soft", "solid", "outline"] as const).map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-2">
              {TONES.map((tone) => (
                <Badge key={tone} variant={variant} tone={tone}>
                  {labels[tone]}
                </Badge>
              ))}
            </div>
          ))}
        </div>
      ),
      code: `<Badge tone="success">Shipped</Badge>
<Badge variant="solid" tone="accent">12</Badge>
<Badge variant="outline" tone="info">HDG</Badge>`,
    },
    {
      title: "Sizes & dot",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" tone="info">
            Small
          </Badge>
          <Badge size="md" tone="info">
            Medium
          </Badge>
          <Badge size="sm" tone="success" dot>
            Online
          </Badge>
          <Badge size="md" tone="warn" dot>
            Waiting on coil
          </Badge>
          <Badge variant="outline" tone="neutral" dot>
            Not synced
          </Badge>
        </div>
      ),
      code: `<Badge size="sm" tone="info">Small</Badge>
<Badge tone="warn" dot>Waiting on coil</Badge>`,
    },
    {
      title: "StatusBadge: one map for every status string",
      render: () => (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {["open", "scheduled", "in_progress", "running", "completed", "shipped"].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["pending", "draft", "on_hold", "review", "failed", "cancelled", "overdue"].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["archived", "inactive", "closed", "awaiting_qc", "Re-Slit Requested"].map((s) => (
              <StatusBadge key={s} status={s} />
            ))}
          </div>
        </div>
      ),
      code: `<StatusBadge status={order.status} />
// Unknown statuses fall back to neutral + title case.
// Teach the map once, at app start:
registerStatus({ awaiting_qc: { tone: "warn", label: "Awaiting QC" } });`,
    },
    {
      title: "StatusBadge variants, sizes, asChild",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status="in_progress" variant="solid" />
          <StatusBadge status="completed" variant="outline" />
          <StatusBadge status="pending" size="sm" />
          <StatusBadge status="failed" dot={false} />
          <Badge asChild tone="info">
            <a href="#orders-open">Open · 14</a>
          </Badge>
        </div>
      ),
      code: `<StatusBadge status="in_progress" variant="solid" />
<StatusBadge status="pending" size="sm" />
<Badge asChild tone="info"><Link to="/orders?status=open">Open · 14</Link></Badge>`,
    },
    {
      title: "In context: order header",
      render: () => (
        <div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-ls-1">
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-fg">SO-20931 · Midland Stamping</span>
              <StatusBadge status="in_progress" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-fg-3">
              <Badge size="sm" variant="outline">
                HDG
              </Badge>
              <Badge size="sm" variant="outline">
                0.048 in
              </Badge>
              <Badge size="sm" variant="outline">
                G90
              </Badge>
              <span>· due 24 Oct</span>
            </div>
          </div>
          <Badge tone="danger" size="sm" dot>
            2 days late
          </Badge>
        </div>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "tone", type: "'neutral' | 'accent' | 'success' | 'warn' | 'danger' | 'info'", default: "'neutral'", description: "Status colour from src/lib/tone.ts." },
    { name: "variant", type: "'soft' | 'solid' | 'outline'", default: "'soft'", description: "Soft is the default pill. Solid for counts on dark surfaces. Outline for attributes (grade, gauge)." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "20 / 24px tall." },
    { name: "dot", type: "boolean", default: "false (StatusBadge: true)", description: "Leading dot in the text colour." },
    { name: "asChild", type: "boolean", default: "false", description: "Style the child element (a link) instead of a span. Dot is not rendered." },
    { name: "status", type: "string", description: "StatusBadge only. Raw status; normalised (lowercase, spaces and dashes to underscores) and looked up." },
    { name: "registerStatus(map)", type: "(map: Record<string, { tone, label? }>) => void", description: "Add app-specific statuses to the shared map. Call once at startup." },
  ],
};
