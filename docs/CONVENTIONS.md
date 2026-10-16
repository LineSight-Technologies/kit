# Component conventions (binding for every file under `src/`)

Read `docs/superpowers/specs/2026-10-16-design-kit-design.md` first for the why. This file is the how.

## Files

```
src/<layer>/<id>/<id>.tsx          component(s); named PascalCase exports; displayName set
src/<layer>/<id>/<id>.test.tsx     Vitest + Testing Library
src/<layer>/<id>/<id>.entry.tsx    catalog entry (examples + props)
```
`<layer>` is `primitives` or `patterns`; `<id>` is the manifest id (`src/catalog/manifest.ts`). One folder may
export several related components (e.g. `badge/` exports `Badge`, `StatusBadge`, `registerStatus`).

Do **not** edit `src/index.ts` or `src/catalog/entries.ts` directly (several agents work in parallel). Each
batch owns one barrel, named in its brief, e.g. `src/primitives/_batch-a.ts` and `src/catalog/entries.batch-a.ts`:

```ts
// src/primitives/_batch-a.ts
export * from "./button/button";
// src/catalog/entries.batch-a.ts
import { buttonEntry } from "../primitives/button/button.entry";
export const entries = [buttonEntry];
```

## Styling

- Tailwind classes only, from the compatible subset — run `node scripts/lint-classes.mjs` and keep it clean.
  Colours: `bg-surface|surface-2|surface-3|surface-inverse`, `border-line|line-strong`, `text-fg|fg-2|fg-3|fg-disabled|fg-inverse`,
  `bg-accent|accent-hover|accent-soft text-accent-fg`, tones via `src/lib/tone.ts`. Radius `rounded-sm|md|lg|xl|full`.
  Shadows `shadow-ls-1|2|3`. Motion `animate-ls-*`, `duration-1|2|3`, `ease-ls-out|inout`. Heights `h-control-sm|control|control-lg`.
  Z `z-dropdown|sheet|dialog|toast|tooltip`. Never stock hues, never hex, never `white`/`black`.
- Focus: `outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface`.
- Disabled: `disabled:pointer-events-none disabled:opacity-50` (or `data-[disabled]:` for Radix).
- Invalid: `aria-invalid:border-danger aria-invalid:focus-visible:ring-danger`.
- Transitions: `transition-colors duration-1` on interactive surfaces; entrances `animate-ls-scale-in` /
  `animate-ls-slide-in-right`; exits with the matching `-out`. Radix: `data-[state=open]:animate-ls-scale-in data-[state=closed]:animate-ls-scale-out`.
- `className` is merged **last** with `cn()` from `src/lib/cn.ts`. Export `xxxVariants` (cva) and `XxxProps`.
- Icons: `lucide-react`, `size-4` in controls, `size-5` in empty states, `strokeWidth` left at default.
- Type: UI text is `text-sm`; small meta `text-xs text-fg-3`; page titles are the only `font-display`.
- No eyebrows, subtitles, helper text, footers, hint lines, counts-as-decoration, progress bars. A component
  exposes `title`, `actions`, `children` — not `subtitle`, `description` (exception: `Field` has `error` only,
  `ConfirmDialog` has `body`), not `hint`.
- Cards are containers of last resort: `rounded-lg border border-line bg-surface shadow-ls-1`. Never nested.

## API

- `forwardRef` on every component that renders a DOM element (React 18 consumers).
- `asChild` via `@radix-ui/react-slot` on Button, Badge, ListRow, SidebarItem, EntityCard.
- Variants: `variant` and `size` props through `cva`; defaults in `defaultVariants`.
- Compound components for structured things: `Dialog`, `Dialog.Header`, … is **not** used; export flat names
  (`DialogHeader`) like shadcn so autocomplete and grep work.
- Controlled + uncontrolled where Radix offers both. Forms are controlled by the app (React Hook Form); kit
  components accept `value/onChange`, `name`, `id`, `aria-*` and forward the rest.
- Status strings map to tones through `registerStatus()` in `badge/`; patterns call `StatusBadge status="…"`.
- Patterns expose slots as props typed `ReactNode` (`actions`, `leading`, `trailing`, `footer`), never render-prop soup.
- Every component works in Next.js app router: files that use hooks/state start with `"use client";`.

## Tests (`<id>.test.tsx`)

- Renders with defaults; each variant applies its distinguishing class; `className` wins; ref forwards.
- Accessibility: role/name present; keyboard where relevant (Enter/Space/Escape/arrows).
- States: disabled, loading, invalid, empty where applicable.
- Run `npx vitest run src/<layer>/<id>` before handing back. All green.

## Entry (`<id>.entry.tsx`)

```tsx
import { MANIFEST } from "../../catalog/manifest";
import type { KitEntry } from "../../catalog/types";
const meta = MANIFEST.find((m) => m.id === "button")!;
export const buttonEntry: KitEntry = {
  ...meta,
  examples: [
    { title: "Variants", render: () => <div className="flex flex-wrap gap-2">…</div>, code: `<Button>Save</Button>` },
    { title: "Sizes", … }, { title: "Loading & disabled", … }, { title: "With icons", … },
  ],
  props: [{ name: "variant", type: "'primary' | …", default: "'primary'", description: "…" }],
};
```
Examples show every variant, every size, every state, and one realistic composition. Realistic copy from the
steel domain (coils, orders, slitters, customers, work orders) — no lorem ipsum, no real company names.

## Hand-back

Report: files created, components + variants, anything you deviated from in this doc and why, test count,
and the exact commands you ran with their last line of output. Do not commit; the orchestrator commits.
