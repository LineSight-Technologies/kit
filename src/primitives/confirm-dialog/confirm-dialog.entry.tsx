import * as React from "react";
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { ConfirmDialog, useConfirm } from "./confirm-dialog";

const meta = MANIFEST.find((m) => m.id === "confirm-dialog")!;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function DeleteCoil() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Delete coil
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete coil C-10422?"
        body="The coil and its receiving history are removed from inventory."
        confirmLabel="Delete"
        onConfirm={() => wait(900)}
      />
    </>
  );
}

function ArchiveOrders() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Archive 3 orders
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Archive 3 orders?"
        body="Archived orders leave the schedule and can be restored from the archive."
        confirmLabel="Archive"
        tone="accent"
        onConfirm={() => wait(600)}
      />
    </>
  );
}

function FailingAction() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Cancel work order (fails)
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel work order WO-2291?"
        body="The coil is released back to inventory."
        confirmLabel="Cancel work order"
        cancelLabel="Keep it"
        onConfirm={async () => {
          await wait(700);
          throw new Error("WO-2291 is running on Line 2 right now. Stop the run first.");
        }}
      />
    </>
  );
}

function DeleteSlitter() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Delete slitter
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete slitter Line 2?"
        body="Every schedule built for this line is deleted with it. This cannot be undone."
        confirmLabel="Delete slitter"
        typeToConfirm="Line 2"
        onConfirm={() => wait(800)}
      />
    </>
  );
}

function Imperative() {
  const [confirm, confirmDialog] = useConfirm();
  const [result, setResult] = React.useState<string>("");
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="secondary"
        onClick={async () => {
          const ok = await confirm({ title: "Send 12 coil tags to the printer?", body: "Printer: Dock B.", confirmLabel: "Print", tone: "accent" });
          setResult(ok ? "Sent to Dock B" : "Not sent");
        }}
      >
        Print tags
      </Button>
      {result ? <span className="text-sm text-fg-2">{result}</span> : null}
      {confirmDialog}
    </div>
  );
}

export const confirmDialogEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Danger (default) and accent tones",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <DeleteCoil />
          <ArchiveOrders />
        </div>
      ),
      code: `<ConfirmDialog\n  open={open}\n  onOpenChange={setOpen}\n  title="Delete coil C-10422?"\n  body="The coil and its receiving history are removed from inventory."\n  confirmLabel="Delete"\n  onConfirm={() => api.deleteCoil(id)}\n/>`,
    },
    { title: "Async failure stays open with the error", render: () => <FailingAction /> },
    { title: "Type to confirm", render: () => <DeleteSlitter />, code: `<ConfirmDialog … typeToConfirm="Line 2" />` },
    {
      title: "useConfirm() for imperative flows",
      render: () => <Imperative />,
      code: `const [confirm, confirmDialog] = useConfirm();\n// …\nif (await confirm({ title: "Send 12 coil tags?", confirmLabel: "Print", tone: "accent" })) print();\n// render once:\n{confirmDialog}`,
    },
  ],
  props: [
    { name: "title", type: "ReactNode", description: "Names the thing: \"Delete coil C-10422?\"" },
    { name: "body", type: "ReactNode", description: "One sentence naming the consequence." },
    { name: "confirmLabel", type: "string", default: "'Confirm'", description: "A verb." },
    { name: "cancelLabel", type: "string", default: "'Cancel'", description: "" },
    { name: "tone", type: "'danger' | 'accent'", default: "'danger'", description: "Danger uses the danger button; accent uses primary." },
    { name: "onConfirm", type: "() => void | Promise<void>", description: "Loading while pending; closes on resolve; stays open and shows the error on reject." },
    { name: "typeToConfirm", type: "string", description: "Confirm is disabled until this exact text is typed." },
  ],
};
