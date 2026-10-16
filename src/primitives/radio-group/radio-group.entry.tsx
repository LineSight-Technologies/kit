import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { RadioCard, RadioCards, RadioGroup, RadioGroupItem } from "./radio-group";

const meta = MANIFEST.find((m) => m.id === "radio-group")!;

const freight = [
  { value: "ltl", title: "LTL freight", meta: "$412" },
  { value: "ftl", title: "Full truckload", meta: "$1,180" },
  { value: "pickup", title: "Customer pickup", meta: "Free" },
  { value: "rail", title: "Rail", meta: "Quote", disabled: true },
];

export const radioGroupEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Vertical (default)",
      render: () => (
        <RadioGroup defaultValue="std" aria-label="Priority">
          <RadioGroupItem value="std" label="Standard" />
          <RadioGroupItem value="rush" label="Rush — ships in 48 h" />
          <RadioGroupItem value="hold" label="Hold for approval" disabled />
        </RadioGroup>
      ),
      code: `<RadioGroup value={priority} onValueChange={setPriority}>\n  <RadioGroupItem value="std" label="Standard" />\n  <RadioGroupItem value="rush" label="Rush" />\n</RadioGroup>`,
    },
    {
      title: "Horizontal",
      render: () => (
        <RadioGroup defaultValue="in" orientation="horizontal" aria-label="Units">
          <RadioGroupItem value="in" label="Inches" />
          <RadioGroupItem value="mm" label="Millimetres" />
        </RadioGroup>
      ),
      code: `<RadioGroup orientation="horizontal">…</RadioGroup>`,
    },
    {
      title: "RadioCards from options",
      render: () => (
        <div className="w-80">
          <RadioCards options={freight} defaultValue="ftl" aria-label="Shipping" />
        </div>
      ),
      code: `<RadioCards options={[{ value: "ltl", title: "LTL freight", meta: "$412" }, …]} value={ship} onValueChange={setShip} />`,
    },
    {
      title: "RadioCards, two columns, composed children",
      render: () => (
        <div className="w-[28rem]">
          <RadioCards columns={2} defaultValue="s1" aria-label="Slitter">
            <RadioCard value="s1" title="Slitter 1" meta="72 in · 0.250 max" />
            <RadioCard value="s2" title="Slitter 2" meta="60 in · 0.135 max" />
            <RadioCard value="s3" title="Slitter 3" meta="48 in · 0.060 max" />
            <RadioCard value="s4" title="Slitter 4" meta="Down" disabled />
          </RadioCards>
        </div>
      ),
      code: `<RadioCards columns={2}>\n  <RadioCard value="s1" title="Slitter 1" meta="72 in · 0.250 max" />\n</RadioCards>`,
    },
    {
      title: "In a Field",
      render: () => (
        <div className="w-80">
          <Field label="Shipping" required error="Choose how this order ships">
            <RadioCards options={freight.slice(0, 3)} />
          </Field>
        </div>
      ),
      code: `<Field label="Shipping" required error={error}>\n  <RadioCards options={freight} value={ship} onValueChange={setShip} />\n</Field>`,
    },
  ],
  props: [
    { name: "value / onValueChange", type: "string / (v: string) => void", description: "Controlled selection (RadioGroup and RadioCards)." },
    { name: "orientation", type: "'vertical' | 'horizontal'", default: "'vertical'", description: "RadioGroup layout and arrow-key axis." },
    { name: "label", type: "ReactNode", description: "RadioGroupItem: clickable label." },
    { name: "options", type: "{ value; title; meta?; disabled? }[]", description: "RadioCards: one card per option. Or pass RadioCard children." },
    { name: "columns", type: "1 | 2 | 3", default: "1", description: "RadioCards grid columns." },
  ],
};
