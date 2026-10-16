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
| Motion | `animate-ls-fade-in|scale-in|slide-in-right|slide-in-up`, `duration-150|200|300`, `ease-ls-out` |
| Layers | `z-sticky` · `z-dropdown` · `z-sheet` · `z-dialog` · `z-toast` · `z-tooltip` |

Raw values live in `src/tokens/tokens.css`. Tailwind v3 apps use `src/tokens/tailwind.preset.ts`; Tailwind v4
apps import `src/tokens/theme.v4.css`. Both import `tokens.css` and `base.css`.

## Catalog

<!-- catalog:start -->

### Foundations

| Component | Use it for | When |
|---|---|---|
| Colors | Brand primitives and the semantic tokens components actually use. | Use semantic names (surface, line, fg, accent, status tones) in app code. Reach for ink/paper/flame scales only in illustrations or marketing-style moments. |
| Typography | Inter Tight for all UI, Lexend only for page titles; fixed rem scale. | Body and controls are text-sm (14px). Page titles are the only display-font element. |
| Shape & depth | Radius sm/md/lg/xl and shadows ls-1/2/3; nothing else. | Controls md, cards and panels lg, sheets and dialogs xl. Shadow 1 for resting cards, 2 for popovers, 3 for dialogs. |
| Motion | Two easings, three durations, named keyframes. | Motion conveys state change only. 150–200ms for feedback, 320ms for entrances. Never orchestrate page loads. |
| Spacing & layout | Control heights, sidebar widths, page max width, z-index layers. | Use gap not margins between siblings. Page content maxes at 1280px except tables, which may run full width. |

### Primitives

| Component | Use it for | When |
|---|---|---|
| Button | Primary, secondary, outline, ghost, danger, link; sm/md/lg; loading; icons; asChild. | One primary per view. Secondary for the rest. Danger only for destructive actions. Link for inline navigation. |
| IconButton | Square button for a single icon, with a required accessible label and built-in tooltip. | Row actions, toolbar actions, close buttons. Always pass `label`. |
| Input | Text input with sizes, leading/trailing icons or addons, invalid state. | Inside a Field. Use SearchInput in toolbars, Textarea for multi-line. |
| Textarea | Multi-line input that grows with content up to a cap. | Notes, descriptions, messages. Inside a Field. |
| Select | Single choice from a short list (Radix). | Up to ~12 known options. More, or searchable: Combobox. |
| Combobox | Searchable single or multi select with async options. | Long or remote lists (customers, products, coils). Supports create-new and multi-select chips. |
| Checkbox | Checkbox with label and indeterminate state. | Multiple independent choices, row selection. |
| Switch | On/off that applies immediately. | Settings that take effect on toggle. If a Save button follows, use Checkbox. |
| RadioGroup | One of a few visible options, optionally as cards. | 2–5 mutually exclusive options that should all be visible. Otherwise Select. |
| Field & Label | Label + control + error wiring (ids, aria-describedby, required mark). | Wrap every form control. The error slot is the only text allowed under a control. |
| Badge & StatusBadge | Tone-coloured pill; StatusBadge maps a status string to a tone through one shared map. | Status, category, count. Never for decoration. Register new statuses in the status map, not inline. |
| Avatar | Person or company mark with initials fallback and stack. | People, owners, assignees. Companies use the square variant. |
| Tooltip | Short label on hover/focus. | Icon-only controls and truncated text. Never for essential information. |
| Popover | Anchored floating panel for small forms and pickers. | Filters, date pickers, quick edits. Not for confirmations (ConfirmDialog) or long forms (Sheet). |
| DropdownMenu | Action menu with groups, shortcuts, checkbox and radio items, danger items. | Row actions and overflow actions. Put the destructive item last, in the danger tone. |
| Dialog | Centered modal with header, body, footer; sizes sm/md/lg. | A focused task that must interrupt. Exhaust inline and Sheet first. Destructive confirmation uses ConfirmDialog. |
| ConfirmDialog | Destructive or irreversible confirmation with optional type-to-confirm. | Delete, cancel, overwrite, send. Names the thing and the consequence; the confirm button names the action. |
| Sheet | Side panel (right by default) with header, scrollable body, sticky footer; sizes sm/md/lg/xl. | Peek at a record, create or edit without leaving the list. The default home for forms. |
| Tabs | Underline tabs (page level) and pill tabs (inside panels), with counts. | Sections of one record or one page. Not for navigation between pages. |
| Separator | Hairline, horizontal or vertical, optional centred label. | Between groups in menus and toolbars. Use gap or a PageSection before reaching for it. |
| Skeleton | Shimmering placeholder blocks and prebuilt shapes (text lines, row, tile). | Any loading state that lasts longer than ~300ms. Match the shape of the content that will appear. |
| Spinner | Indeterminate activity indicator, sm/md/lg. | Inside buttons and inline. Loading content areas use Skeleton. |
| Kbd | Keyboard shortcut chip. | Menus, tooltips, the command menu. |
| Toast | Transient notifications (sonner) with success/error/loading and an action. | Confirm an action completed or failed. Never for errors the user must act on in place. |
| CommandMenu | ⌘K palette with groups, async items, shortcuts and recent items. | App-wide navigation and actions. One per app, mounted in the shell. |
| Table | Styled table elements for small static tables. | Up to ~20 rows with no sorting or selection. Anything else is DataTable. |
| Pagination | Page controls with range text and page size. | Under DataTable or any paged list. |

### Patterns

| Component | Use it for | When |
|---|---|---|
| AppShell & Sidebar | Sidebar (260px, collapsible to a 64px rail) + content frame + mobile drawer; nav items, groups, footer slot. | The one layout per app. Nav items take an icon, label, href and optional count; groups collapse and remember state. |
| Page, PageHeader & PageSection | Content frame with max width, header (title, status, actions, back, tabs slot) and titled sections. | Every screen starts with Page + PageHeader. Sections group content; they are not cards. |
| Toolbar | Search + filter chips + view toggle + primary action, with an active-filter row. | Above every list and table. Filters are chips that open a Popover; applied filters show as removable chips. |
| DataTable | TanStack-based table: sorting, selection, row actions, sticky header, density, column visibility, loading/empty/error, pagination, row click. | Any list of records. Columns are declared, not rendered by hand. Bulk actions appear when rows are selected. |
| DetailPanel, PropertyList & Timeline | Record view: header strip, key/value grid in columns, activity timeline with tones. | One record, in a Page or a Sheet. PropertyList for facts, Timeline for what happened. |
| FormSection, FormRow & FormActions | Form layout: titled sections, 1–3 column rows of Fields, sticky action bar. | Every create/edit form. Actions are Cancel + one primary; destructive actions go in the header menu, not the footer. |
| StatTile & StatRow | A number with a label and an optional tone-coloured delta; rows of up to four. | Top of a dashboard or record. Max four. No sparklines, no progress bars. |
| List & ListRow | Compact rows with leading mark, title, meta, trailing actions; link or button rows. | Recents, search results, related records, any list too small for a DataTable. |
| EntityCard | Card for a record where the image or avatar matters; title, meta, badges, actions. | Grids of people, companies, or anything visual. If the grid has no imagery, use DataTable. |
| EmptyState & ErrorState | Nothing-here and something-broke states with one action. | Every list, table and panel has both. EmptyState teaches the next action; ErrorState offers retry. |

<!-- catalog:end -->
