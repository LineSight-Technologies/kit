import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Field } from "../field/field";
import { Textarea } from "./textarea";

const meta = MANIFEST.find((m) => m.id === "textarea")!;

const longNote =
  "Customer wants the first two coils by Friday. Hold the 0.060 HRPO until the oiler is back up; run the galvanized master on slitter 2 and leave 1,200 lb of skeleton for the recut.";

export const textareaEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Default (grows from 3 to 10 rows)",
      render: () => (
        <div className="w-96">
          <Textarea placeholder="Production notes" />
        </div>
      ),
      code: `<Textarea placeholder="Production notes" />`,
    },
    {
      title: "Row bounds",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Textarea minRows={1} maxRows={3} defaultValue="Single row that can grow to three." />
          <Textarea minRows={2} maxRows={4} defaultValue={longNote} />
        </div>
      ),
      code: `<Textarea minRows={1} maxRows={3} />\n<Textarea minRows={2} maxRows={4} />`,
    },
    {
      title: "Manual resize, invalid, disabled",
      render: () => (
        <div className="flex w-96 flex-col gap-3">
          <Textarea resize placeholder="Drag the corner" />
          <Textarea aria-invalid defaultValue="Too short" />
          <Textarea disabled defaultValue="Locked after the work order is released." />
        </div>
      ),
      code: `<Textarea resize />\n<Textarea aria-invalid />\n<Textarea disabled />`,
    },
    {
      title: "In a Field",
      render: () => (
        <div className="w-96">
          <Field label="Notes to the floor" error="Required when the order is on hold">
            <Textarea minRows={2} />
          </Field>
        </div>
      ),
      code: `<Field label="Notes to the floor" error="Required when the order is on hold">\n  <Textarea minRows={2} />\n</Field>`,
    },
  ],
  props: [
    { name: "minRows", type: "number", default: "3", description: "Height floor in text rows." },
    { name: "maxRows", type: "number", default: "10", description: "Height cap in text rows; scrolls past it." },
    { name: "resize", type: "boolean", default: "false", description: "Allow the manual vertical resize handle." },
  ],
};
