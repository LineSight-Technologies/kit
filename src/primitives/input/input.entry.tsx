import { Mail, Search } from "lucide-react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { Input } from "./input";

const meta = MANIFEST.find((m) => m.id === "input")!;

export const inputEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Sizes",
      render: () => (
        <div className="flex w-72 flex-col gap-3">
          <Input size="sm" placeholder="Coil ID (sm)" />
          <Input size="md" placeholder="Coil ID (md)" />
          <Input size="lg" placeholder="Coil ID (lg)" />
        </div>
      ),
      code: `<Input size="sm" placeholder="Coil ID" />\n<Input placeholder="Coil ID" />\n<Input size="lg" placeholder="Coil ID" />`,
    },
    {
      title: "Leading and trailing slots",
      render: () => (
        <div className="flex w-72 flex-col gap-3">
          <Input leading={<Search />} placeholder="Search orders" />
          <Input type="number" trailing="in" placeholder="48.000" />
          <Input type="number" leading="$" trailing="/cwt" placeholder="0.00" />
          <Input type="email" leading={<Mail />} placeholder="buyer@example.com" />
        </div>
      ),
      code: `<Input leading={<Search />} placeholder="Search orders" />\n<Input type="number" trailing="in" placeholder="48.000" />\n<Input type="number" leading="$" trailing="/cwt" />`,
    },
    {
      title: "Invalid and disabled",
      render: () => (
        <div className="flex w-72 flex-col gap-3">
          <Input aria-invalid defaultValue="72.5" trailing="in" />
          <Input disabled placeholder="Disabled" />
          <Input disabled defaultValue="HRPO" trailing="type" />
        </div>
      ),
      code: `<Input aria-invalid defaultValue="72.5" trailing="in" />\n<Input disabled placeholder="Disabled" />`,
    },
    {
      title: "In a Field",
      render: () => (
        <div className="flex w-80 flex-col gap-4">
          <Field label="Width" required>
            <Input type="number" trailing="in" placeholder="48.000" />
          </Field>
          <Field label="Gauge" error="Must be between 0.010 and 0.250">
            <Input type="number" trailing="in" defaultValue="0.500" />
          </Field>
        </div>
      ),
      code: `<Field label="Gauge" error="Must be between 0.010 and 0.250">\n  <Input type="number" trailing="in" />\n</Field>`,
    },
  ],
  props: [
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Control height: 32 / 36 / 40px." },
    { name: "leading", type: "ReactNode", description: "Icon or short text addon inside the border, before the text." },
    { name: "trailing", type: "ReactNode", description: "Icon or short text addon inside the border, after the text (\"in\", \"lbs\")." },
    { name: "type", type: "string", default: "'text'", description: "Native type. `number` sets inputMode=decimal and tabular numerals." },
    { name: "aria-invalid", type: "boolean", description: "Danger border and focus colour. Set automatically inside a Field with an error." },
  ],
};
