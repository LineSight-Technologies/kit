import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Input } from "../input/input";
import { SimpleSelect } from "../select/select";
import { Switch } from "../switch/switch";
import { Textarea } from "../textarea/textarea";
import { Field, FieldError, Label } from "./field";

const meta = MANIFEST.find((m) => m.id === "field")!;

const types = [
  { value: "hrpo", label: "HRPO" },
  { value: "cr", label: "Cold rolled" },
  { value: "hdg", label: "Galvanized" },
];

export const fieldEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Label",
      render: () => (
        <div className="flex flex-col gap-2">
          <Label>Customer</Label>
          <Label required>Width</Label>
          <Label optional>PO number</Label>
        </div>
      ),
      code: `<Label required>Width</Label>`,
    },
    {
      title: "Vertical (default)",
      render: () => (
        <div className="flex w-80 flex-col gap-4">
          <Field label="Customer PO">
            <Input placeholder="PO-20441" />
          </Field>
          <Field label="Width" required>
            <Input type="number" trailing="in" placeholder="48.000" />
          </Field>
          <Field label="Gauge" required error="Must be between 0.010 and 0.250">
            <Input type="number" trailing="in" defaultValue="0.500" />
          </Field>
        </div>
      ),
      code: `<Field label="Gauge" required error={errors.gauge?.message}>\n  <Input type="number" trailing="in" {...register("gauge")} />\n</Field>`,
    },
    {
      title: "Horizontal (dense settings)",
      render: () => (
        <div className="flex w-[32rem] flex-col gap-3">
          <Field label="Default product" orientation="horizontal">
            <SimpleSelect options={types} defaultValue="hrpo" />
          </Field>
          <Field label="Max coil weight" orientation="horizontal" error="Exceeds crane capacity">
            <Input type="number" trailing="lbs" defaultValue="62000" />
          </Field>
          <Field label="Auto-schedule" orientation="horizontal">
            <Switch defaultChecked />
          </Field>
        </div>
      ),
      code: `<Field label="Max coil weight" orientation="horizontal" error={error}>\n  <Input type="number" trailing="lbs" />\n</Field>`,
    },
    {
      title: "Bare DOM control and standalone FieldError",
      render: () => (
        <div className="flex w-80 flex-col gap-4">
          <Field label="Native input" error="Cloned id and aria onto a plain <input>">
            <input className="h-control rounded-md border border-line bg-surface px-3 text-sm" />
          </Field>
          <FieldError>Standalone error text</FieldError>
        </div>
      ),
      code: `<FieldError>{formError}</FieldError>`,
    },
    {
      title: "New order fragment",
      render: () => (
        <div className="grid w-[36rem] grid-cols-2 gap-4">
          <Field label="Customer" required>
            <Input placeholder="Search customers" />
          </Field>
          <Field label="Product type" required>
            <SimpleSelect options={types} placeholder="Choose" />
          </Field>
          <Field label="Width" required>
            <Input type="number" trailing="in" />
          </Field>
          <Field label="Gauge" required>
            <Input type="number" trailing="in" />
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <Textarea minRows={2} />
            </Field>
          </div>
        </div>
      ),
    },
  ],
  props: [
    { name: "label", type: "ReactNode", description: "Rendered with Label and wired to the control via htmlFor / aria-labelledby." },
    { name: "htmlFor", type: "string", description: "Control id. Generated with useId when absent." },
    { name: "error", type: "string", description: "Validation text under the control; sets aria-invalid and aria-describedby. The only text allowed there." },
    { name: "required", type: "boolean", description: "Accent asterisk on the label and `required` on the control." },
    { name: "orientation", type: "'vertical' | 'horizontal'", default: "'vertical'", description: "Horizontal puts the label in a 10rem column." },
    { name: "useFieldContext()", type: "FieldContextValue | null", description: "For custom controls: id, labelId, errorId, invalid, required." },
  ],
};
