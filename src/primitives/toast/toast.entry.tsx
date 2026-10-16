import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Button } from "../button/button";
import { Toaster, notify } from "./toast";

const meta = MANIFEST.find((m) => m.id === "toast")!;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export const toastEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Kinds",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Toaster />
          <Button variant="outline" onClick={() => notify.success("Coil C-10422 archived")}>
            Success
          </Button>
          <Button variant="outline" onClick={() => notify.error("Schedule generation failed")}>
            Error
          </Button>
          <Button variant="outline" onClick={() => notify.warning("Line 2 is over its daily capacity")}>
            Warning
          </Button>
          <Button variant="outline" onClick={() => notify.info("ERP sync finished: 312 orders")}>
            Info
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const id = notify.loading("Generating schedule…");
              void wait(1800).then(() => notify.success("Schedule ready: 6 coils, 2 knife changes", { id }));
            }}
          >
            Loading → success
          </Button>
        </div>
      ),
      code: `// mount once, in the shell\n<Toaster />\n\nnotify.success("Coil C-10422 archived");\nnotify.error("Schedule generation failed");`,
    },
    {
      title: "With an action",
      render: () => (
        <Button
          variant="outline"
          onClick={() =>
            notify.success("3 orders archived", {
              action: { label: "Undo", onClick: () => notify.info("Restored 3 orders") },
            })
          }
        >
          Archive 3 orders
        </Button>
      ),
      code: `notify.success("3 orders archived", { action: { label: "Undo", onClick: restore } });`,
    },
    {
      title: "Promise",
      render: () => (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() =>
              notify.promise(wait(1500).then(() => 48), {
                loading: "Printing coil tags…",
                success: (n) => `${n} tags sent to Dock B`,
                error: "Printer offline",
              })
            }
          >
            Print 48 tags
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.promise(
                wait(1200).then(() => {
                  throw new Error("offline");
                }),
                { loading: "Printing coil tags…", success: "Sent", error: "Printer at Dock B is offline" },
              )
            }
          >
            Print (fails)
          </Button>
        </div>
      ),
      code: `notify.promise(printTags(ids), {\n  loading: "Printing coil tags…",\n  success: (n) => \`\${n} tags sent\`,\n  error: "Printer offline",\n});`,
    },
  ],
  props: [
    { name: "Toaster", type: "sonner ToasterProps", description: "Mount once. Bottom-right, kit chrome, z-toast. Pass `position` to override." },
    { name: "notify.success / error / info / warning", type: "(message, { action?, id?, duration? })", description: "One line of text plus at most one action." },
    { name: "notify.loading", type: "(message, { id? }) => id", description: "Returns the id; pass it to a later call to replace in place." },
    { name: "notify.promise", type: "(promise, { loading, success, error })", description: "Loading → success or error from one call." },
    { name: "toast", type: "sonner toast", description: "The raw API for anything else (custom JSX, dismiss)." },
  ],
};
