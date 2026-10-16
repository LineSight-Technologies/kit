import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  SimpleSelect,
} from "./select";

const meta = MANIFEST.find((m) => m.id === "select")!;

const productTypes = [
  { value: "hrpo", label: "HRPO" },
  { value: "cr", label: "Cold rolled" },
  { value: "hdg", label: "Galvanized" },
  { value: "galvalume", label: "Galvalume" },
  { value: "stainless", label: "Stainless", disabled: true },
];

export const selectEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "SimpleSelect sizes",
      render: () => (
        <div className="flex w-64 flex-col gap-3">
          <SimpleSelect size="sm" options={productTypes} placeholder="Product type" />
          <SimpleSelect options={productTypes} placeholder="Product type" />
          <SimpleSelect size="lg" options={productTypes} placeholder="Product type" />
        </div>
      ),
      code: `<SimpleSelect options={productTypes} value={value} onValueChange={setValue} placeholder="Product type" />`,
    },
    {
      title: "Selected, invalid, disabled",
      render: () => (
        <div className="flex w-64 flex-col gap-3">
          <SimpleSelect options={productTypes} defaultValue="hdg" />
          <SimpleSelect options={productTypes} placeholder="Product type" aria-invalid />
          <SimpleSelect options={productTypes} defaultValue="cr" disabled />
        </div>
      ),
      code: `<SimpleSelect options={productTypes} defaultValue="hdg" />\n<SimpleSelect options={productTypes} aria-invalid />\n<SimpleSelect options={productTypes} disabled />`,
    },
    {
      title: "Composed: groups, labels, separators",
      render: () => (
        <div className="w-64">
          <Select>
            <SelectTrigger aria-label="Slitter">
              <SelectValue placeholder="Assign a slitter" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Heavy gauge</SelectLabel>
                <SelectItem value="s1">Slitter 1 — 72 in</SelectItem>
                <SelectItem value="s2">Slitter 2 — 60 in</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Light gauge</SelectLabel>
                <SelectItem value="s3">Slitter 3 — 48 in</SelectItem>
                <SelectItem value="s4" disabled>
                  Slitter 4 — down for knives
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      ),
      code: `<Select>\n  <SelectTrigger><SelectValue placeholder="Assign a slitter" /></SelectTrigger>\n  <SelectContent>\n    <SelectGroup>\n      <SelectLabel>Heavy gauge</SelectLabel>\n      <SelectItem value="s1">Slitter 1 — 72 in</SelectItem>\n    </SelectGroup>\n    <SelectSeparator />\n  </SelectContent>\n</Select>`,
    },
    {
      title: "In a Field",
      render: () => (
        <div className="w-72">
          <Field label="Product type" required error="Pick a product type">
            <SimpleSelect options={productTypes} placeholder="Product type" />
          </Field>
        </div>
      ),
      code: `<Field label="Product type" required error={errors.type?.message}>\n  <SimpleSelect options={productTypes} value={value} onValueChange={setValue} />\n</Field>`,
    },
  ],
  props: [
    { name: "options", type: "{ value; label; disabled? }[]", description: "SimpleSelect only. One item per option." },
    { name: "value / onValueChange", type: "string / (v: string) => void", description: "Controlled value; `defaultValue` for uncontrolled." },
    { name: "placeholder", type: "string", description: "Shown in the trigger until a value is chosen." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Trigger height (SelectTrigger and SimpleSelect)." },
    { name: "disabled", type: "boolean", description: "Disables the whole select." },
  ],
};
