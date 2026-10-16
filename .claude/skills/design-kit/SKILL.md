---
name: design-kit
description: Use before building, changing or reviewing ANY user interface in a LineSight app (platform, ERP, catalog, Carbon, or the kit itself) — a page, screen, modal, table, form, card, badge, sidebar, settings panel, empty state. Also when asked to "make it look like the rest of the app", to fix inconsistent UI, or to add a design variant. Routes all UI work through the shared design kit (@linesight/kit) so screens are assembled from one component library instead of designed from scratch.
---

# Design kit

LineSight screens are **assembled** from `@linesight/kit`, vendored at `packages/kit/`. The kit is the
design; you do not invent one per screen.

## Do this, in order

1. Read `packages/kit/KIT.md` (short). Find the screen in its decision table.
2. Open the catalog entries for those components (`packages/kit/src/**/<id>.entry.tsx`, or run
   `npm run dev` in `packages/kit` and open the catalog) and start from the composition example.
3. Build the screen with kit components only. Change props, `className`, slot content.
4. Missing something? Extend the kit **in `packages/kit/src`**, in this order: variant → slot/prop →
   composed pattern → new component. Ship the change with its test and catalog entry, keep
   `node packages/kit/scripts/lint-classes.mjs` clean, then `node packages/kit/scripts/sync.mjs push`.
   Never copy a kit file into the app and edit it there.
5. Before claiming done: no raw `<table>`, no `fixed inset-0` overlays, no hex or stock hues in
   classes, no eyebrows/subtitles/hint text/footers, no progress bars; loading, empty and error states
   exist; every control has hover/focus/disabled/invalid.

## Red flags that you are about to re-invent

| Thought | Do instead |
|---|---|
| "A quick card grid will do here" | `DataTable` or `List`; cards only with imagery (`EntityCard`) |
| "I'll just write a little modal" | `Dialog` / `Sheet` / `ConfirmDialog` |
| "This badge needs a new colour" | `registerStatus()` in `badge/`; tones are fixed |
| "The header on this page is special" | `PageHeader` has `status`, `actions`, `back`, `tabs` slots |
| "I'll add a subtitle to explain" | Delete it. Headings carry their own weight |
| "Legacy `components/ui/button` is right there" | Frozen. New work imports from `@linesight/kit` |

## Where things are

- Contract and catalog table: `packages/kit/KIT.md`
- Tokens: `packages/kit/src/tokens/tokens.css`; classes in `tailwind.preset.ts` / `theme.v4.css`
- Primitives: `packages/kit/src/primitives/<id>/`; patterns: `packages/kit/src/patterns/<id>/`
- Conventions for kit code: `packages/kit/docs/CONVENTIONS.md`
- Sync: `node packages/kit/scripts/sync.mjs pull | push | check`
