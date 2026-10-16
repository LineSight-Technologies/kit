import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { StatRow, StatTile } from "./stat";

const meta = MANIFEST.find((m) => m.id === "stat")!;

export const statEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Four tiles",
      wide: true,
      render: () => (
        <StatRow>
          <StatTile label="Scrap rate" value="2.09" unit="%" delta={{ value: "−0.42 pt", direction: "down", tone: "success" }} />
          <StatTile label="Tons slit this month" value="1,204" unit="t" delta={{ value: "+6.1%", direction: "up", tone: "success" }} />
          <StatTile label="Open orders" value="128" delta={{ value: "0", direction: "flat", tone: "neutral" }} />
          <StatTile label="Late work orders" value="6" delta={{ value: "+2", direction: "up", tone: "danger" }} />
        </StatRow>
      ),
      code: `<StatRow>
  <StatTile label="Scrap rate" value="2.09" unit="%" delta={{ value: "−0.42 pt", direction: "down", tone: "success" }} />
  <StatTile label="Tons slit this month" value="1,204" unit="t" delta={{ value: "+6.1%", direction: "up", tone: "success" }} />
  <StatTile label="Open orders" value="128" />
  <StatTile label="Late work orders" value="6" delta={{ value: "+2", direction: "up", tone: "danger" }} />
</StatRow>`,
    },
    {
      title: "Loading",
      wide: true,
      render: () => (
        <StatRow columns={4}>
          <StatTile label="Scrap rate" value="" loading />
          <StatTile label="Tons slit" value="" loading />
          <StatTile label="Open orders" value="" loading />
          <StatTile label="Late work orders" value="" loading />
        </StatRow>
      ),
      code: `<StatTile label="Scrap rate" value={data?.scrap} loading={isLoading} />`,
    },
    {
      title: "Interactive tiles",
      render: () => (
        <StatRow>
          <StatTile label="Coils on hold" value="14" href="#stat" />
          <StatTile label="Coils awaiting QC" value="9" onClick={() => {}} delta={{ value: "−3", direction: "down", tone: "success" }} />
        </StatRow>
      ),
      code: `<StatTile label="Coils on hold" value={onHold} href="/inventory?hold=1" />`,
    },
    {
      title: "Three tiles",
      render: () => (
        <StatRow>
          <StatTile label="Slitter 1 uptime" value="96.4" unit="%" />
          <StatTile label="Slitter 2 uptime" value="91.0" unit="%" delta={{ value: "−2.1 pt", direction: "down", tone: "warn" }} />
          <StatTile label="Knife changes today" value="7" />
        </StatRow>
      ),
      code: `<StatRow columns={3}>…</StatRow>`,
    },
  ],
  props: [
    { name: "label", type: "ReactNode", description: "Names the number; sits above it." },
    { name: "value", type: "ReactNode", description: "Pre-formatted number, tabular." },
    { name: "unit", type: "string", description: "After the value: t, lb, %." },
    { name: "delta", type: "{ value: string; direction: 'up' | 'down' | 'flat'; tone: Tone }", description: "Change since last period. The caller picks the tone — up is not always good." },
    { name: "loading", type: "boolean", default: "false", description: "Renders a SkeletonTile of the same frame." },
    { name: "href / onClick", type: "string / handler", description: "Makes the tile a link or a button with a hover surface." },
    { name: "StatRow.columns", type: "2 | 3 | 4", description: "Defaults to the number of tiles. More than four warns in development." },
  ],
};
