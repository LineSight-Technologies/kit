# LineSight Kit — the contract

Read this before building or changing any screen in a LineSight app (platform, ERP, catalog, Carbon).
The kit is the design. A screen is assembled from it, not designed next to it.

Import from `@linesight/kit` (vendored at `packages/kit/`). Live catalog: `npm run dev` inside `packages/kit`,
or Carbon → Design.

## Before you build a screen

1. Name what the screen is in the decision table below. Every LineSight screen is one of those rows.
2. Open the catalog entries for the components in that row and copy their composition example.
3. Fill it with the real data. Change only props, `className`, and slot content.
4. If a prop or variant you need does not exist, **extend the kit** (see below). Never fork a component into
   the app, never hand-roll a table, card, modal, header or badge, never add a one-off colour.
5. Run the app's lint. It warns on raw `<table>`, hand-rolled overlays, hex colours and stock hues.

## Decision table

| You need | Use |
|---|---|
| A list of records | `Page` + `PageHeader` + `Toolbar` + `DataTable` |
| One record | `Page` + `PageHeader` (with `status` and `actions`) + `DetailPanel` holding `PropertyList` and `Timeline` |
| Peek at a record without leaving the list | `Sheet` wrapping `DetailPanel` |
| Create or edit | `Sheet` (long forms: `Page`) + `FormSection` / `FormRow` / `Field` + `FormActions` |
| Confirm something destructive or irreversible | `ConfirmDialog` (or `useConfirm()`), never a bare `Dialog` |
| A few numbers at the top | `StatRow` of up to four `StatTile`s |
| A compact list (recents, results, related) | `List` of `ListRow` |
| A grid of things with images or avatars | `EntityCard`; without imagery it is a `DataTable` |
| Nothing to show / something failed | `EmptyState` with one action / `ErrorState` with retry |
| Row or overflow actions | `ActionMenu` |
| App-wide navigation and actions | `CommandMenu` (⌘K), mounted once in `AppShell` |
| The frame around everything | `AppShell` with `Sidebar`; one per app |

## Rules (the lint enforces most of these)

- **Text:** headings, data values and control labels only. No eyebrows, kickers, subtitles, helper lines,
  hint text, footers, corner text or decorative counts. The only text under a control is a `Field` error.
- **No progress bars.** Not determinate bars, not phase bars, not step dots, not rings. State is a word,
  a count or a `StatusBadge`. Spinners and skeletons for loading are fine.
- **Colour:** semantic tokens only (`surface`, `line`, `fg`, `accent`, status tones). Accent marks primary
  actions, selection and focus; status tones mark status. Nothing is coloured for decoration.
  Never stock Tailwind hues, never hex in a class, never `white`/`black`.
- **Shape and depth:** `rounded-sm|md|lg|xl|full`; `shadow-ls-1|2|3`. Nothing else. No coloured left
  borders, no zero-offset halos, no gradient text.
- **Containers:** sections, not cards. A card is `rounded-lg border border-line bg-surface shadow-ls-1`
  and is never nested in another card. Pages are not grids of same-size cards.
- **Overlays:** `Dialog` interrupts, `Sheet` works beside the list, `Popover` edits in place. Try inline
  first, then `Sheet`, then `Dialog`. Overlays always come from the kit (they portal and manage focus).
- **Type:** UI is `text-sm` Inter Tight. Page titles are the only display-font element. Numbers in tables
  are tabular (`Table`/`DataTable` do this; add `data-numeric` elsewhere).
- **Icons:** lucide only, `size-4` in controls. No emoji, no unicode glyphs as icons.
- **Motion:** 150–200 ms feedback, 320 ms entrances, `ease-ls-out`. Nothing animates on page load.
- **Copy:** buttons name the action ("Delete coil", not "OK"). Errors name the problem and the fix.
- **States:** every list, table and panel ships loading (skeleton), empty and error states. Every control
  has hover, focus-visible, disabled and invalid.

## Customising a component (in order of preference)

1. **Props and variants** — `variant`, `size`, `tone`, slots (`actions`, `leading`, `trailing`).
2. **`className`** — merged last with `cn()`, so Tailwind overrides win without `!important`.
3. **Composition** — wrap or combine kit components; patterns are built from primitives, so can you.
4. **Extend the kit** — see next section. Forking the file into the app is never an option.

## Extending the kit

Edit `packages/kit/src/...` in place while you build the screen, then push it upstream:

```bash
node packages/kit/scripts/sync.mjs push      # opens a PR on LineSight-Technologies/kit
# after it merges:
node packages/kit/scripts/sync.mjs pull      # updates KIT_VERSION; CI's `check` passes again
```

Order of operations when something is missing: add a **variant** (one `cva` branch) → add a **slot** or
prop → compose a new **pattern** from existing primitives → only then a **new component** (folder + test +
entry + manifest row + `src/index.ts` export). Every change ships with its catalog entry and tests, and
must keep `node scripts/lint-classes.mjs` clean — that lint is what keeps Tailwind v3 and v4 builds identical.

`sync.mjs check` runs in every consumer's CI and fails if `packages/kit` differs from the pinned upstream
commit, so a local-only edit cannot ship.

## Tokens at a glance

| Need | Class |
|---|---|
| Page / panel / inset background | `bg-surface` / `bg-surface-2` / `bg-surface-3` |
| Border | `border-line` (emphasis: `border-line-strong`) |
| Text / secondary / meta | `text-fg` / `text-fg-2` / `text-fg-3` |
| Primary action, selection, focus | `bg-accent text-accent-fg`, `bg-accent-soft`, `ring-focus` |
| Status | `text-success|warn|danger|info`, `bg-*-soft` (use `Badge`/`StatusBadge` instead where possible) |
| Radius | `rounded-sm` 4 · `rounded-md` 6 (controls) · `rounded-lg` 10 (cards, menus) · `rounded-xl` 16 (dialogs, sheets) |
| Shadow | `shadow-ls-1` resting · `shadow-ls-2` popovers · `shadow-ls-3` dialogs |
| Control heights | `h-control-sm` 32 · `h-control` 36 · `h-control-lg` 40 |
| Motion | `animate-ls-fade-in|scale-in|slide-in-right|slide-in-up`, `duration-1|2|3`, `ease-ls-out` |
| Layers | `z-sticky` · `z-dropdown` · `z-sheet` · `z-dialog` · `z-toast` · `z-tooltip` |

Raw values live in `src/tokens/tokens.css`. Tailwind v3 apps use `src/tokens/tailwind.preset.ts`; Tailwind v4
apps import `src/tokens/theme.v4.css`. Both import `tokens.css` and `base.css`.

## Catalog

<!-- catalog:start -->
<!-- catalog:end -->
