import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
import { Avatar, AvatarStack } from "./avatar";

const meta = MANIFEST.find((m) => m.id === "avatar")!;

const crew = ["Dana Whitfield", "Marcus Oyelaran", "Priya Natarajan", "Tom Okafor", "Lena Vogt", "Sam Reyes"];

export const avatarEntry: KitEntry = {
  ...meta,
  examples: [
    {
      title: "Sizes",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name="Dana Whitfield" size="xs" />
          <Avatar name="Dana Whitfield" size="sm" />
          <Avatar name="Dana Whitfield" size="md" />
          <Avatar name="Dana Whitfield" size="lg" />
        </div>
      ),
      code: `<Avatar name="Dana Whitfield" size="xs" />
<Avatar name="Dana Whitfield" size="sm" />
<Avatar name="Dana Whitfield" />
<Avatar name="Dana Whitfield" size="lg" />`,
    },
    {
      title: "Deterministic tone from the name",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          {crew.map((n) => (
            <Avatar key={n} name={n} />
          ))}
        </div>
      ),
      code: `{owners.map((o) => <Avatar key={o.id} name={o.name} />)}`,
    },
    {
      title: "Shapes, image, no name",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Avatar name="Midland Stamping" shape="square" />
          <Avatar name="Great Lakes Coil" shape="square" size="lg" />
          <Avatar shape="square" />
          <Avatar />
          <Avatar
            name="Dana Whitfield"
            src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23df6428'/%3E%3C/svg%3E"
          />
        </div>
      ),
      code: `<Avatar name="Midland Stamping" shape="square" />
<Avatar name={user.name} src={user.avatarUrl} />
<Avatar />  // no name: person icon`,
    },
    {
      title: "AvatarStack",
      render: () => (
        <div className="flex flex-col items-start gap-3">
          <AvatarStack>
            {crew.slice(0, 3).map((n) => (
              <Avatar key={n} name={n} />
            ))}
          </AvatarStack>
          <AvatarStack max={3} size="sm">
            {crew.map((n) => (
              <Avatar key={n} name={n} />
            ))}
          </AvatarStack>
          <AvatarStack max={4} size="lg">
            {crew.map((n) => (
              <Avatar key={n} name={n} />
            ))}
          </AvatarStack>
        </div>
      ),
      code: `<AvatarStack max={3} size="sm">
  {assignees.map((a) => <Avatar key={a.id} name={a.name} />)}
</AvatarStack>`,
    },
    {
      title: "In context: schedule owner row",
      render: () => (
        <div className="flex w-full max-w-xl items-center gap-3 rounded-lg border border-line bg-surface p-4 shadow-ls-1">
          <Avatar name="Great Lakes Coil" shape="square" size="lg" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span className="text-sm font-medium text-fg">Line 2 · Week 43 schedule</span>
            <span className="text-xs text-fg-3">38 work orders · 1,412 t · owner Dana Whitfield</span>
          </div>
          <AvatarStack max={3} size="sm">
            {crew.slice(0, 5).map((n) => (
              <Avatar key={n} name={n} />
            ))}
          </AvatarStack>
        </div>
      ),
      wide: true,
    },
  ],
  props: [
    { name: "name", type: "string", description: "Drives the initials and the colour. Also the default alt." },
    { name: "src", type: "string", description: "Image URL. Initials show if it fails or while it loads (after delayMs)." },
    { name: "size", type: "'xs' | 'sm' | 'md' | 'lg'", default: "'md'", description: "20 / 24 / 32 / 40px." },
    { name: "shape", type: "'circle' | 'square'", default: "'circle'", description: "Circle for people, square for companies and sites." },
    { name: "delayMs", type: "number", default: "300 with src", description: "How long to wait before showing initials while an image loads." },
    { name: "max", type: "number", default: "4", description: "AvatarStack only. Avatars beyond this collapse into a +N chip." },
  ],
};
