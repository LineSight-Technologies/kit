import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { Switch } from "./switch";

const meta = MANIFEST.find((m) => m.id === "switch")!;

export const switchEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "States",
      render: () => (
        <div className="flex flex-wrap items-center gap-6">
          <Switch label="Off" />
          <Switch label="On" defaultChecked />
          <Switch label="Disabled" disabled />
          <Switch label="Disabled on" disabled defaultChecked />
        </div>
      ),
      code: `<Switch label="Rush order" checked={rush} onCheckedChange={setRush} />`,
    },
    {
      title: "Sizes",
      render: () => (
        <div className="flex items-center gap-6">
          <Switch size="sm" label="Small" defaultChecked />
          <Switch size="md" label="Medium" defaultChecked />
        </div>
      ),
      code: `<Switch size="sm" label="Small" />`,
    },
    {
      title: "Label position",
      render: () => (
        <div className="flex flex-col gap-3">
          <Switch label="Label on the right (default)" />
          <Switch label="Label on the left" labelPosition="left" />
        </div>
      ),
      code: `<Switch label="Auto-schedule" labelPosition="left" />`,
    },
    {
      title: "Settings row",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Field label="Auto-schedule new orders" orientation="horizontal">
            <Switch defaultChecked />
          </Field>
          <Field label="Allow partial coils" orientation="horizontal">
            <Switch />
          </Field>
        </div>
      ),
      code: `<Field label="Auto-schedule new orders" orientation="horizontal">\n  <Switch checked={on} onCheckedChange={setOn} />\n</Field>`,
    },
  ],
  props: [
    { name: "label", type: "ReactNode", description: "Clickable label; an id is generated so it toggles the switch." },
    { name: "labelPosition", type: "'left' | 'right'", default: "'right'", description: "Which side the label sits on." },
    { name: "size", type: "'sm' | 'md'", default: "'md'", description: "16×28 or 20×36 track." },
    { name: "checked / onCheckedChange", type: "boolean / (c: boolean) => void", description: "Controlled state (Radix)." },
  ],
};
