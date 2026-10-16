# LineSight Design Kit — design

Date: 2026-10-16. Owner: Claude (full autonomy per Bilal). Status: approved by request ("analyze, figure out the best way, ship it").

## Intent

Every LineSight screen is built by Claude. Today each screen is designed from scratch: three apps (platform,
ERP, catalog) share zero UI code, the ERP forked 41 primitives from the platform and 30 of them have drifted,
there are 72 local modal implementations, 5 stat-card components, ~30 local status pills, and 44 platform pages
each setting their own `<h1>` class string. Carbon (Next.js 15, Tailwind v4) is about to become a fourth app.

The kit makes building a screen an act of **assembly**: slot pre-built patterns into place, pick from each
pattern's pre-defined customisations, and only in the rare case add a variant to the kit (never fork it into the
app). A change to a kit component propagates to every app by running one command.

## Goals / non-goals / anti-goals

Goals
- One source of truth for tokens (colour, radius, shadow, type, motion, sizes) and for components.
- Two layers of components: **primitives** (button, input, dialog…) and **patterns** (the screen-level pieces
  that actually get re-invented: page header, toolbar, data table, detail panel, form sections, list rows,
  empty states, confirm flows, app shell).
- Every component: typed props, `variant`/`size` through `cva`, `className` merged last, `asChild` where
  composition needs it, all states (hover / focus-visible / active / disabled / loading / error / empty).
- Works unchanged in Tailwind v3 (platform, ERP, catalog) and Tailwind v4 (Carbon); React 18 and 19.
- A living catalog that renders every component and variant, hosted in the kit's playground and inside
  Carbon's **Design** section, from the same source.
- A Claude instruction layer (KIT.md + a skill + lint guards) so the kit is *used*, not just available.
- Propagation: `kit pull` in a consumer updates the vendored copy; CI fails if the vendored copy was edited
  locally without being pushed upstream.

Non-goals (v1)
- Dark mode (no app uses it; tokens are structured so it can be added by redefining `--ls-*` under a class).
- Migrating existing screens. Legacy `components/ui` folders are frozen, not rewritten. Migration is per screen.
- Charts (dataviz skill covers it; the kit ships colour tokens only).
- A Figma library.

Anti-goals (the kit fails if…)
- Components so generic they need 30 props. Patterns are opinionated; the escape hatch is `className` + slots.
- Progress bars, eyebrows/kickers, subtitles, hint lines, footers. The kit must make these *hard* to add.
- Nested cards, card-as-page-structure, colored left borders, zero-offset halos, gradient text, emoji icons.

## Architecture

```
LineSight-Technologies/kit            (this repo; source of truth; own CI + visual snapshots)
├── src/
│   ├── tokens/   tokens.css  base.css  theme.v4.css  tailwind.preset.ts   ← values, once
│   ├── lib/      cn.ts, hooks, tone map
│   ├── primitives/<name>/<name>.tsx + .test.tsx + .entry.tsx
│   ├── patterns/<name>/…
│   ├── catalog/  Catalog.tsx (renderer), manifest.ts (metadata), entries.ts (list)
│   └── index.ts  (public surface)
├── playground/   Vite + Tailwind v4 app that renders <Catalog/>  (dev + Playwright snapshots)
├── scripts/      sync.mjs (pull/push/check), gen-kit-md.ts, lint-classes.mjs
├── .claude/skills/design-kit/SKILL.md
└── KIT.md        the contract Claude reads before building any screen (generated catalog table inside)
```

Consumers vendor the kit as **source** at `packages/kit/` (LineSight monorepo root; Carbon root) and alias
`@linesight/kit` → `packages/kit/src`. No npm registry: nobody is logged into npm, and a private registry would
need a token in every Vercel build and every teammate's machine. Source vendoring also means that when Claude
needs a new variant while building a screen, it edits `packages/kit` in place and runs `kit push`, which opens a
PR on the kit repo. `kit check` in each consumer's CI fails if the vendored copy differs from the pinned
upstream commit (`packages/kit/KIT_VERSION`), so local-only edits cannot ship.

Each consumer's Tailwind scans `packages/kit/src/**/*.tsx`. Kit dependencies (Radix, cva, clsx,
tailwind-merge, lucide, TanStack Table, cmdk, sonner) are declared in the kit's `package.json` and must be
present in the consumer; `kit pull` prints the missing ones.

## Tokens

Canonical values are the platform's (Zyner brand, 2026). ERP's warm-shifted variants are not adopted; ERP may
override `--ls-*` in its own CSS if it must keep them, but the goal is convergence.

Primitives: `ink` 1–6, `paper` 1–6, `flame` 1–6, `ember` / `ember-deep`, status `success #3F7A4B`,
`warn #C77A1A`, `danger #B3311F`, `info #2F5B7A` plus a `-soft` tint for each (badge/alert backgrounds).

Semantic (what components use; apps may use too):

| Token | Value | Use |
|---|---|---|
| `surface` / `surface-2` / `surface-3` | paper / paper-2 / paper-3 | page / sidebar+panels / inset+hover |
| `line` / `line-strong` | paper-4 / paper-5 | borders / emphasised borders |
| `fg` / `fg-2` / `fg-3` | ink / ink-3 / ink-4 | text / secondary / placeholder+meta (4.7:1 on paper) |
| `fg-disabled` | ink-6 | disabled only (fails 4.5:1 by design) |
| `accent` / `accent-fg` / `accent-soft` | flame / paper / flame-6 | primary actions, selection, focus |
| `success|warn|danger|info` + `-soft` | above | status only, never decoration |

Radius `sm 4 / md 6 / lg 10 / xl 16 / full`. Shadows `ls-1/2/3` (offset + blur, never halos) and `ls-flame`.
Motion: `ease-ls-out cubic-bezier(.22,1,.36,1)`, `ease-ls-inout`; durations 150 / 200 / 320 ms; keyframes
`ls-fade-in`, `ls-scale-in`, `ls-slide-in-right/left/up`, `ls-shimmer`. Type: fixed rem scale, ratio ~1.2,
Inter Tight for all UI, Lexend only for page titles. Control heights `sm 32 / md 36 / lg 40`. Sidebar 260 / rail
64. Z-index `sticky 10 / dropdown 40 / sheet 50 / dialog 60 / toast 70 / tooltip 80`. Browser surfaces themed:
selection, caret, focus ring, scrollbar, tabular numerals.

Delivered three ways from one `tokens.css`: Tailwind v3 preset (`tailwind.preset.ts`, keeps every existing
platform class name: `bg-paper-2`, `text-ink-3`, `shadow-ls-1`, `ease-ls-out`, shadcn hsl vars), Tailwind v4
theme (`theme.v4.css`, `@theme inline` mapping the same names), and `base.css` (fonts, resets, browser surfaces).

## Tailwind v3 ↔ v4 compatibility subset

Kit components may only use classes that compile identically under both. `scripts/lint-classes.mjs` fails on:
bare-scale shadows (`shadow`, `shadow-sm|md|lg|xl|2xl`) → use `shadow-ls-*`; bare `rounded`, `rounded-2xl|3xl`
→ use `rounded-sm|md|lg|xl|full` (themed in both); `space-x|y-*`, `divide-*` → `gap` + explicit borders;
`bg-opacity|text-opacity|border-opacity`; `flex-shrink|flex-grow`; bare `ring` (width differs) → `ring-1|2`
with explicit colour; `blur-sm`, `drop-shadow-*`, `inset-shadow-*`, `text-shadow-*`, `container`; the
important modifier `!`; `*:` / `**:` variants and stacked `first|last|odd|even:` variants; `theme(`;
`-[--var]` shorthand → `[var(--x)]`; `animate-in|out` (plugin) → `animate-ls-*`; stock hues
(`gray|slate|zinc|neutral|stone|red|green|blue|amber|emerald|...-N`) → semantic tokens;
raw hex in class names.

## Component catalog (v1)

Primitives: Button, IconButton, Input, Textarea, Label, Field, Checkbox, Switch, RadioGroup, Select, Combobox,
Badge, StatusBadge, Avatar, Tooltip, Popover, DropdownMenu, Dialog, Sheet, ConfirmDialog, Tabs, Separator,
Skeleton, Spinner, Kbd, Toast (sonner `Toaster` + `toast`), CommandMenu, Table (styled primitive), Pagination.

Patterns: AppShell (+ Sidebar, SidebarNav, SidebarItem, SidebarGroup, Topbar slot), Page, PageHeader,
PageSection, Toolbar (+ SearchInput, FilterChip, FilterMenu, ViewToggle), DataTable (TanStack: sorting,
selection, row actions, sticky header, density, column visibility, empty/loading/error, pagination),
DetailPanel (+ PropertyList, Timeline), FormSection / FormRow / FormActions, StatTile / StatRow, ListRow / List,
EntityCard, EmptyState, ErrorState.

## Conventions every component follows

- File `src/<layer>/<kebab>/<kebab>.tsx`; named exports in PascalCase; `displayName` set.
- Variants via `cva`; export the `xxxVariants` function and `XxxProps` type (`VariantProps` + element props).
- `className` is always merged last via `cn()`. Style overrides never need `!important`.
- `asChild` (Radix Slot) on Button, badges, list rows, sidebar items.
- Forward refs (React 18 needs `forwardRef`; keep it for both).
- States: hover, `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-surface`, active, disabled
  (`disabled:opacity-50 disabled:pointer-events-none`), loading (Spinner replaces leading icon, width kept),
  error (`aria-invalid` → danger border + ring).
- Icons: lucide only, `size-4` in controls, `size-5` in empty states, stroke 1.75 never changed per icon.
- Text: no eyebrow, subtitle, helper, footer or count props. A pattern exposes `title`, `actions`, `children`.
- Overlays portal to body; z-index from tokens.
- Each component has a `.entry.tsx` (catalog) and a `.test.tsx` (RTL: renders, variants apply, a11y role,
  keyboard where relevant). Visual snapshot per entry via the playground.

## Decision table (goes into KIT.md)

| You need | Use |
|---|---|
| A list of records | `Page` + `PageHeader` + `Toolbar` + `DataTable` |
| One record | `Page` + `PageHeader` (status badge + actions) + `DetailPanel` with `PropertyList` / `Timeline` |
| Peek at a record without leaving | `Sheet` wrapping `DetailPanel` |
| Create or edit | `Sheet` (or `Page` for long forms) + `FormSection` / `FormRow` / `Field` + `FormActions` |
| Confirm a destructive action | `ConfirmDialog` (never a bare `Dialog`) |
| A few numbers at the top | `StatRow` of `StatTile` (max 4; no sparklines) |
| A compact list (recents, results) | `List` of `ListRow` |
| A grid of entities | `EntityCard` (only when the image/avatar matters; otherwise `DataTable`) |
| Nothing to show | `EmptyState` (one action) / `ErrorState` (retry) |
| Keyboard-first navigation | `CommandMenu` (⌘K) |

## Claude instruction layer

1. `KIT.md` at the kit root and vendored into each consumer: rules, decision table, conventions, extension
   workflow, generated catalog table.
2. `.claude/skills/design-kit/SKILL.md`, vendored into each consumer's `.claude/skills/`: triggers on any UI
   work; says read KIT.md → compose from the catalog → extend the kit (variant first, new component last) →
   `kit push`.
3. Consumer lint (ESLint `no-restricted-syntax` / `no-restricted-imports`): raw `<table>`, `fixed inset-0`
   overlays, hex in `className`, stock hue classes, imports from the frozen legacy `components/ui` in new
   files. Error in Carbon (greenfield), warn in LineSight.
4. Each consumer's CLAUDE.md gets a short "UI work" section pointing at `packages/kit/KIT.md`.

## Rollout

1. Kit repo: tokens → primitives → patterns → catalog → KIT.md/skill/scripts → CI (typecheck, lint, unit,
   visual) → push to `LineSight-Technologies/kit`.
2. LineSight PR (branch off `dev`): vendor `packages/kit`, platform + ERP + catalog alias + Tailwind content,
   platform `tailwind.config.ts` consumes the preset (byte-identical token output), ESLint warnings, `kit check`
   in CI, CLAUDE.md section. No screen rewritten. PR opened, not merged.
3. Carbon: vendor, `theme.v4.css` import, `/design` route rendering `<Catalog/>`, shell swapped to `AppShell`,
   `Pill`/`Section`/`Empty` in `ui.tsx` replaced by kit components. Done after the Phase 0 agent commits.

Estimated run time: ~7–8 h of Claude time with subagents.
