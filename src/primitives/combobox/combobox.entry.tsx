"use client";

import { useCallback, useState } from "react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { Input } from "../input/input";
import { SimpleSelect } from "../select/select";
import { Switch } from "../switch/switch";
import { Combobox, type ComboboxOption } from "./combobox";

const meta = MANIFEST.find((m) => m.id === "combobox")!;

const customers: ComboboxOption[] = [
  { value: "c1", label: "Apex Metals", meta: "Houston, TX", keywords: ["apx"] },
  { value: "c2", label: "Blue Ridge Steel", meta: "Roanoke, VA" },
  { value: "c3", label: "Cascade Coil", meta: "Portland, OR" },
  { value: "c4", label: "Delta Tube & Pipe", meta: "Memphis, TN" },
  { value: "c5", label: "Evergreen Fabrication", meta: "Spokane, WA" },
  { value: "c6", label: "Frontier Stamping", meta: "Tulsa, OK", disabled: true },
];

const productTypes = [
  { value: "hrpo", label: "HRPO" },
  { value: "cr", label: "Cold rolled" },
  { value: "hdg", label: "Galvanized" },
];

function Single(props: { size?: "sm" | "md" | "lg"; clearable?: boolean; disabled?: boolean; invalid?: boolean }) {
  const [value, setValue] = useState<string | null>(props.disabled || props.invalid ? "c2" : null);
  return (
    <Combobox
      options={customers}
      value={value}
      onChange={setValue}
      placeholder="Select a customer"
      searchPlaceholder="Search customers"
      size={props.size}
      clearable={props.clearable}
      disabled={props.disabled}
      aria-invalid={props.invalid || undefined}
      aria-label="Customer"
    />
  );
}

function Multi() {
  const [value, setValue] = useState<string[]>(["c1", "c3", "c4", "c5"]);
  return (
    <Combobox
      multiple
      options={customers}
      value={value}
      onChange={setValue}
      placeholder="Add customers"
      clearable
      aria-label="Customers"
    />
  );
}

function Creatable() {
  const [options, setOptions] = useState(customers);
  const [value, setValue] = useState<string | null>(null);
  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      placeholder="Pick or create a customer"
      onCreate={(name) => {
        const created = { value: `new-${options.length}`, label: name };
        setOptions((o) => [...o, created]);
        setValue(created.value);
      }}
      aria-label="Customer"
    />
  );
}

function Async() {
  const [value, setValue] = useState<string | null>(null);
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const onSearch = useCallback((q: string) => {
    setLoading(true);
    const t = setTimeout(() => {
      setOptions(customers.filter((c) => c.label.toLowerCase().includes(q.toLowerCase())));
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);
  return (
    <Combobox
      options={options}
      value={value}
      onChange={setValue}
      onSearch={onSearch}
      loading={loading}
      placeholder="Search the ERP"
      aria-label="Customer"
    />
  );
}

function NewOrder() {
  const [customer, setCustomer] = useState<string | null>(null);
  const [type, setType] = useState<string>();
  const [rush, setRush] = useState(false);
  return (
    <div className="grid w-[36rem] grid-cols-2 gap-4">
      <div className="col-span-2">
        <Field label="Customer" required error={customer ? undefined : "Choose a customer"}>
          <Combobox options={customers} value={customer} onChange={setCustomer} placeholder="Search customers" clearable />
        </Field>
      </div>
      <Field label="Gauge" required>
        <Input type="number" trailing="in" placeholder="0.060" />
      </Field>
      <Field label="Product type" required>
        <SimpleSelect options={productTypes} value={type} onValueChange={setType} placeholder="Choose" />
      </Field>
      <Field label="Rush" orientation="horizontal">
        <Switch checked={rush} onCheckedChange={setRush} />
      </Field>
    </div>
  );
}

export const comboboxEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Single, sizes",
      render: () => (
        <div className="flex w-72 flex-col gap-3">
          <Single size="sm" />
          <Single />
          <Single size="lg" />
        </div>
      ),
      code: `<Combobox options={customers} value={value} onChange={setValue} placeholder="Select a customer" />`,
    },
    {
      title: "Clearable, invalid, disabled",
      render: () => (
        <div className="flex w-72 flex-col gap-3">
          <Single clearable />
          <Single invalid />
          <Single disabled />
        </div>
      ),
      code: `<Combobox clearable … />\n<Combobox aria-invalid … />\n<Combobox disabled … />`,
    },
    {
      title: "Multiple with chips and overflow",
      render: () => (
        <div className="w-80">
          <Multi />
        </div>
      ),
      code: `<Combobox multiple options={customers} value={ids} onChange={setIds} clearable />`,
    },
    {
      title: "Create new",
      render: () => (
        <div className="w-72">
          <Creatable />
        </div>
      ),
      code: `<Combobox options={options} value={value} onChange={setValue} onCreate={(name) => createCustomer(name)} />`,
    },
    {
      title: "Async search with loading",
      render: () => (
        <div className="w-72">
          <Async />
        </div>
      ),
      code: `<Combobox options={results} loading={isFetching} onSearch={(q) => setQuery(q)} … />`,
    },
    { title: "New order form fragment", render: () => <NewOrder />, wide: true },
  ],
  props: [
    { name: "options", type: "{ value; label; meta?; keywords?; disabled? }[]", description: "Items. `keywords` adds search terms; `meta` shows right-aligned." },
    { name: "value / onChange", type: "string | null / (v: string | null) => void", description: "Single mode." },
    { name: "multiple + value / onChange", type: "true + string[] / (v: string[]) => void", description: "Multi mode: chips in the trigger, list stays open, Backspace removes the last chip." },
    { name: "onSearch", type: "(query: string) => void", description: "Async loading. Debounced 200 ms; called with \"\" when the list opens. Disables local filtering." },
    { name: "onCreate", type: "(query: string) => void", description: "Shows a Create “query” row when nothing matches the typed label." },
    { name: "loading", type: "boolean", description: "Spinner in place of the list." },
    { name: "clearable", type: "boolean", default: "false", description: "Clear button when something is selected." },
    { name: "placeholder / searchPlaceholder / emptyText", type: "string", default: "'Select…' / 'Search…' / 'No matches'", description: "Copy." },
    { name: "size", type: "'sm' | 'md' | 'lg'", default: "'md'", description: "Trigger height." },
    { name: "maxChips", type: "number", default: "3", description: "Chips shown before collapsing into +N." },
  ],
};
