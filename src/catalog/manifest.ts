import type { KitMeta } from "./types";

/**
 * Every kit component, in catalog order. Metadata only — no JSX — so `scripts/gen-kit-md.ts` can
 * read it under Node. Each `<id>.entry.tsx` imports its row from here; a test checks they match.
 */
export const MANIFEST: readonly KitMeta[] = [
  // ---- Foundations ----
  { id: "colors", name: "Colors", group: "Foundations", summary: "Brand primitives and the semantic tokens components actually use.", when: "Use semantic names (surface, line, fg, accent, status tones) in app code. Reach for ink/paper/flame scales only in illustrations or marketing-style moments." },
  { id: "typography", name: "Typography", group: "Foundations", summary: "Inter Tight for all UI, Lexend only for page titles; fixed rem scale.", when: "Body and controls are text-sm (14px). Page titles are the only display-font element." },
  { id: "shape-depth", name: "Shape & depth", group: "Foundations", summary: "Radius sm/md/lg/xl and shadows ls-1/2/3; nothing else.", when: "Controls md, cards and panels lg, sheets and dialogs xl. Shadow 1 for resting cards, 2 for popovers, 3 for dialogs." },
  { id: "motion", name: "Motion", group: "Foundations", summary: "Two easings, three durations, named keyframes.", when: "Motion conveys state change only. 150–200ms for feedback, 320ms for entrances. Never orchestrate page loads." },
  { id: "spacing-layout", name: "Spacing & layout", group: "Foundations", summary: "Control heights, sidebar widths, page max width, z-index layers.", when: "Use gap not margins between siblings. Page content maxes at 1280px except tables, which may run full width." },

  // ---- Primitives ----
  { id: "button", name: "Button", group: "Primitives", summary: "Primary, secondary, outline, ghost, danger, link; sm/md/lg; loading; icons; asChild.", when: "One primary per view. Secondary for the rest. Danger only for destructive actions. Link for inline navigation." },
  { id: "icon-button", name: "IconButton", group: "Primitives", summary: "Square button for a single icon, with a required accessible label and built-in tooltip.", when: "Row actions, toolbar actions, close buttons. Always pass `label`." },
  { id: "input", name: "Input", group: "Primitives", summary: "Text input with sizes, leading/trailing icons or addons, invalid state.", when: "Inside a Field. Use SearchInput in toolbars, Textarea for multi-line." },
  { id: "textarea", name: "Textarea", group: "Primitives", summary: "Multi-line input that grows with content up to a cap.", when: "Notes, descriptions, messages. Inside a Field." },
  { id: "select", name: "Select", group: "Primitives", summary: "Single choice from a short list (Radix).", when: "Up to ~12 known options. More, or searchable: Combobox." },
  { id: "combobox", name: "Combobox", group: "Primitives", summary: "Searchable single or multi select with async options.", when: "Long or remote lists (customers, products, coils). Supports create-new and multi-select chips." },
  { id: "checkbox", name: "Checkbox", group: "Primitives", summary: "Checkbox with label and indeterminate state.", when: "Multiple independent choices, row selection." },
  { id: "switch", name: "Switch", group: "Primitives", summary: "On/off that applies immediately.", when: "Settings that take effect on toggle. If a Save button follows, use Checkbox." },
  { id: "radio-group", name: "RadioGroup", group: "Primitives", summary: "One of a few visible options, optionally as cards.", when: "2–5 mutually exclusive options that should all be visible. Otherwise Select." },
  { id: "field", name: "Field & Label", group: "Primitives", summary: "Label + control + error wiring (ids, aria-describedby, required mark).", when: "Wrap every form control. The error slot is the only text allowed under a control." },
  { id: "badge", name: "Badge & StatusBadge", group: "Primitives", summary: "Tone-coloured pill; StatusBadge maps a status string to a tone through one shared map.", when: "Status, category, count. Never for decoration. Register new statuses in the status map, not inline." },
  { id: "avatar", name: "Avatar", group: "Primitives", summary: "Person or company mark with initials fallback and stack.", when: "People, owners, assignees. Companies use the square variant." },
  { id: "tooltip", name: "Tooltip", group: "Primitives", summary: "Short label on hover/focus.", when: "Icon-only controls and truncated text. Never for essential information." },
  { id: "popover", name: "Popover", group: "Primitives", summary: "Anchored floating panel for small forms and pickers.", when: "Filters, date pickers, quick edits. Not for confirmations (ConfirmDialog) or long forms (Sheet)." },
  { id: "dropdown-menu", name: "DropdownMenu", group: "Primitives", summary: "Action menu with groups, shortcuts, checkbox and radio items, danger items.", when: "Row actions and overflow actions. Put the destructive item last, in the danger tone." },
  { id: "dialog", name: "Dialog", group: "Primitives", summary: "Centered modal with header, body, footer; sizes sm/md/lg.", when: "A focused task that must interrupt. Exhaust inline and Sheet first. Destructive confirmation uses ConfirmDialog." },
  { id: "confirm-dialog", name: "ConfirmDialog", group: "Primitives", summary: "Destructive or irreversible confirmation with optional type-to-confirm.", when: "Delete, cancel, overwrite, send. Names the thing and the consequence; the confirm button names the action." },
  { id: "sheet", name: "Sheet", group: "Primitives", summary: "Side panel (right by default) with header, scrollable body, sticky footer; sizes sm/md/lg/xl.", when: "Peek at a record, create or edit without leaving the list. The default home for forms." },
  { id: "tabs", name: "Tabs", group: "Primitives", summary: "Underline tabs (page level) and pill tabs (inside panels), with counts.", when: "Sections of one record or one page. Not for navigation between pages." },
  { id: "separator", name: "Separator", group: "Primitives", summary: "Hairline, horizontal or vertical, optional centred label.", when: "Between groups in menus and toolbars. Use gap or a PageSection before reaching for it." },
  { id: "skeleton", name: "Skeleton", group: "Primitives", summary: "Shimmering placeholder blocks and prebuilt shapes (text lines, row, tile).", when: "Any loading state that lasts longer than ~300ms. Match the shape of the content that will appear." },
  { id: "spinner", name: "Spinner", group: "Primitives", summary: "Indeterminate activity ring, sm/md/lg.", when: "Inside buttons and inline. Loading content areas use Skeleton." },
  { id: "kbd", name: "Kbd", group: "Primitives", summary: "Keyboard shortcut chip.", when: "Menus, tooltips, the command menu." },
  { id: "toast", name: "Toast", group: "Primitives", summary: "Transient notifications (sonner) with success/error/loading and an action.", when: "Confirm an action completed or failed. Never for errors the user must act on in place." },
  { id: "command-menu", name: "CommandMenu", group: "Primitives", summary: "⌘K palette with groups, async items, shortcuts and recent items.", when: "App-wide navigation and actions. One per app, mounted in the shell." },
  { id: "table", name: "Table", group: "Primitives", summary: "Styled table elements for small static tables.", when: "Up to ~20 rows with no sorting or selection. Anything else is DataTable." },
  { id: "pagination", name: "Pagination", group: "Primitives", summary: "Page controls with range text and page size.", when: "Under DataTable or any paged list." },

  // ---- Patterns ----
  { id: "app-shell", name: "AppShell & Sidebar", group: "Patterns", summary: "Sidebar (260px, collapsible to a 64px rail) + content frame + mobile drawer; nav items, groups, footer slot.", when: "The one layout per app. Nav items take an icon, label, href and optional count; groups collapse and remember state." },
  { id: "page", name: "Page, PageHeader & PageSection", group: "Patterns", summary: "Content frame with max width, header (title, status, actions, back, tabs slot) and titled sections.", when: "Every screen starts with Page + PageHeader. Sections group content; they are not cards." },
  { id: "toolbar", name: "Toolbar", group: "Patterns", summary: "Search + filter chips + view toggle + primary action, with an active-filter row.", when: "Above every list and table. Filters are chips that open a Popover; applied filters show as removable chips." },
  { id: "data-table", name: "DataTable", group: "Patterns", summary: "TanStack-based table: sorting, selection, row actions, sticky header, density, column visibility, loading/empty/error, pagination, row click.", when: "Any list of records. Columns are declared, not rendered by hand. Bulk actions appear when rows are selected." },
  { id: "detail-panel", name: "DetailPanel, PropertyList & Timeline", group: "Patterns", summary: "Record view: header strip, key/value grid in columns, activity timeline with tones.", when: "One record, in a Page or a Sheet. PropertyList for facts, Timeline for what happened." },
  { id: "form", name: "FormSection, FormRow & FormActions", group: "Patterns", summary: "Form layout: titled sections, 1–3 column rows of Fields, sticky action bar.", when: "Every create/edit form. Actions are Cancel + one primary; destructive actions go in the header menu, not the footer." },
  { id: "stat", name: "StatTile & StatRow", group: "Patterns", summary: "A number with a label and an optional tone-coloured delta; rows of up to four.", when: "Top of a dashboard or record. Max four. No sparklines, no progress bars." },
  { id: "list", name: "List & ListRow", group: "Patterns", summary: "Compact rows with leading mark, title, meta, trailing actions; link or button rows.", when: "Recents, search results, related records, any list too small for a DataTable." },
  { id: "entity-card", name: "EntityCard", group: "Patterns", summary: "Card for a record where the image or avatar matters; title, meta, badges, actions.", when: "Grids of people, companies, or anything visual. If the grid has no imagery, use DataTable." },
  { id: "empty-state", name: "EmptyState & ErrorState", group: "Patterns", summary: "Nothing-here and something-broke states with one action.", when: "Every list, table and panel has both. EmptyState teaches the next action; ErrorState offers retry." },
];

export const MANIFEST_IDS = MANIFEST.map((m) => m.id);
