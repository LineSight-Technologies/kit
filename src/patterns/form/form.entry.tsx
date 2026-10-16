import * as React from "react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../../primitives/button/button";
import { Combobox } from "../../primitives/combobox/combobox";
import { Field } from "../../primitives/field/field";
import { Input } from "../../primitives/input/input";
import { SimpleSelect } from "../../primitives/select/select";
import { Sheet, SheetBody, SheetContent, SheetHeader, SheetTrigger } from "../../primitives/sheet/sheet";
import { Switch } from "../../primitives/switch/switch";
import { Textarea } from "../../primitives/textarea/textarea";
import { Form, FormActions, FormRow, FormSection } from "./form";

const meta = MANIFEST.find((m) => m.id === "form")!;

const customers = [
  { value: "northfield", label: "Northfield Metals", meta: "Gary, IN" },
  { value: "harbor", label: "Harbor Steel Supply", meta: "Toledo, OH" },
  { value: "prairie", label: "Prairie Fabrication", meta: "Des Moines, IA" },
  { value: "ridgeline", label: "Ridgeline Roofing", meta: "Boise, ID" },
];
const products = [
  { value: "hdg-g90", label: "HDG G90" },
  { value: "hdg-g60", label: "HDG G60" },
  { value: "cr-1008", label: "CR 1008" },
  { value: "hrpo", label: "HRPO A1011" },
  { value: "az50", label: "Galvalume AZ50" },
];
const grades = [
  { value: "cs-b", label: "CS Type B" },
  { value: "fs", label: "FS" },
  { value: "dds", label: "DDS" },
  { value: "ss-33", label: "SS Grade 33" },
];
const carriers = [
  { value: "our-truck", label: "Our truck" },
  { value: "customer-pickup", label: "Customer pickup" },
  { value: "ltl", label: "LTL carrier" },
];

function NewOrderFields({ invalidWidth = true }: { invalidWidth?: boolean }) {
  const [customer, setCustomer] = React.useState<string | null>("northfield");
  const [rush, setRush] = React.useState(false);
  return (
    <>
      <FormSection title="Customer">
        <FormRow columns={2}>
          <Field label="Customer" required>
            <Combobox options={customers} value={customer} onChange={setCustomer} placeholder="Search customers" />
          </Field>
          <Field label="PO number" required>
            <Input defaultValue="44817" />
          </Field>
        </FormRow>
      </FormSection>

      <FormSection title="Material">
        <FormRow columns={3}>
          <Field label="Product" required>
            <SimpleSelect options={products} defaultValue="hdg-g90" placeholder="Product" />
          </Field>
          <Field label="Gauge" required>
            <Input inputMode="decimal" defaultValue="0.0598" trailing="in" />
          </Field>
          <Field label="Width" required error={invalidWidth ? "Width must be 72.000 in or less on Slitter 2" : undefined}>
            <Input inputMode="decimal" defaultValue="74.500" trailing="in" />
          </Field>
        </FormRow>
        <FormRow columns={2}>
          <Field label="Grade">
            <SimpleSelect options={grades} placeholder="Grade" />
          </Field>
          <Field label="Weight">
            <Input inputMode="numeric" defaultValue="42,000" trailing="lb" />
          </Field>
        </FormRow>
      </FormSection>

      <FormSection title="Delivery">
        <FormRow columns={2}>
          <Field label="Due date" required>
            <Input type="date" defaultValue="2026-03-20" />
          </Field>
          <Field label="Ship via">
            <SimpleSelect options={carriers} defaultValue="our-truck" />
          </Field>
        </FormRow>
        <FormRow>
          <Switch label="Rush order" checked={rush} onCheckedChange={setRush} />
        </FormRow>
        <FormRow>
          <Field label="Notes">
            <Textarea placeholder="Packaging, tagging, dock hours" />
          </Field>
        </FormRow>
      </FormSection>
    </>
  );
}

/** Looks like a right-hand Sheet without portalling, so the catalog can show it inline. */
function SheetFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex max-h-[560px] w-full max-w-[520px] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-ls-3">
      <div className="flex shrink-0 items-center border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold leading-6 text-fg">{title}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-sm">{children}</div>
    </div>
  );
}

function NewOrderDemo() {
  return (
    <SheetFrame title="New order">
      <Form onSubmit={() => new Promise((r) => setTimeout(r, 1200))}>
        <NewOrderFields />
        <FormActions sticky submitLabel="Create order" onCancel={() => console.log("cancel")} />
      </Form>
    </SheetFrame>
  );
}

function InSheetDemo() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>New order</Button>
      </SheetTrigger>
      <SheetContent size="md">
        <SheetHeader title="New order" />
        <SheetBody>
          <Form onSubmit={() => new Promise<void>((r) => setTimeout(() => { r(); setOpen(false); }, 900))}>
            <NewOrderFields invalidWidth={false} />
            <FormActions sticky submitLabel="Create order" onCancel={() => setOpen(false)} />
          </Form>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export const formEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "New order: three sections, mixed rows, sticky actions, one invalid field",
      wide: true,
      render: () => <NewOrderDemo />,
      code: `<Form onSubmit={handleSubmit(create)}>
  <FormSection title="Customer">
    <FormRow columns={2}>
      <Field label="Customer" required><Combobox … /></Field>
      <Field label="PO number" required><Input … /></Field>
    </FormRow>
  </FormSection>
  <FormSection title="Material">
    <FormRow columns={3}>
      <Field label="Product" required><SimpleSelect … /></Field>
      <Field label="Gauge" required><Input trailing="in" /></Field>
      <Field label="Width" required error={errors.width?.message}><Input trailing="in" /></Field>
    </FormRow>
  </FormSection>
  <FormActions sticky submitLabel="Create order" onCancel={close} />
</Form>`,
    },
    {
      title: "The same form inside a Sheet",
      render: () => <InSheetDemo />,
      code: `<Sheet>
  <SheetContent size="md">
    <SheetHeader title="New order" />
    <SheetBody>
      <Form onSubmit={…}>
        …sections…
        <FormActions sticky submitLabel="Create order" onCancel={close} />
      </Form>
    </SheetBody>
  </SheetContent>
</Sheet>`,
    },
    {
      title: "FormActions: plain, with extra, destructive, busy",
      render: () => (
        <div className="flex max-w-md flex-col gap-6">
          <FormActions submitLabel="Save changes" onCancel={() => {}} />
          <FormActions submitLabel="Save changes" onCancel={() => {}} extra={<Switch size="sm" label="Notify customer" />} />
          <FormActions submitLabel="Cancel order" destructive onCancel={() => {}} />
          <FormActions submitLabel="Create order" onCancel={() => {}} loading />
        </div>
      ),
      code: `<FormActions submitLabel="Save changes" onCancel={close} />
<FormActions submitLabel="Cancel order" destructive onCancel={close} />`,
    },
  ],
  props: [
    { name: "Form.onSubmit", type: "(e) => void | Promise<unknown>", description: "Default is prevented. Return a promise and the form is busy until it settles." },
    { name: "Form.busy", type: "boolean", description: "Force the busy state from outside (a mutation hook)." },
    { name: "useFormBusy()", type: "boolean", description: "Read the busy flag in any descendant." },
    { name: "FormSection.title", type: "ReactNode", description: "h2, text-sm semibold. Sections are separated by a hairline." },
    { name: "FormRow.columns", type: "1 | 2 | 3", default: "1", description: "Fields per row from sm up; one column below." },
    { name: "FormActions.submitLabel", type: "ReactNode", description: "Names the action. The primary submits the enclosing Form." },
    { name: "FormActions.onCancel / cancelLabel", type: "() => void / ReactNode", default: "– / 'Cancel'", description: "Renders the secondary button before the primary." },
    { name: "FormActions.destructive", type: "boolean", default: "false", description: "Danger-toned primary." },
    { name: "FormActions.extra", type: "ReactNode", description: "Left-aligned slot." },
    { name: "FormActions.sticky", type: "boolean", default: "false", description: "Pins to the bottom of a Sheet or Page body on its own surface." },
    { name: "FormActions.loading / disabled", type: "boolean", description: "Override the Form's busy flag; disable the primary while invalid." },
  ],
};
