# PROGRESS — LineSight Design Kit (session ledger)

Started 2026-10-16. Bilal: "analyze, figure out the best way to do this, and ship it." Full autonomy; no questions.
Notion ticket: https://app.notion.com/p/3fbbb0009dd88191a220c25a018cc4c6 (In Progress; no Sprint option covers today).
NOTE: /Users/bilalyousuf/Desktop/LineSight/PROGRESS.md belongs to the concurrent Carbon session — do not edit it.

## Task
One standardized, extensible design kit (tokens + primitives + screen patterns + living catalog + Claude
instruction layer) that every LineSight React app and Carbon consume, with one-command propagation.
Spec: docs/superpowers/specs/2026-10-16-design-kit-design.md. Conventions: docs/CONVENTIONS.md.

## Acceptance
1. Kit repo builds, typechecks, lints (class subset), unit tests + visual snapshots green; pushed to
   github.com/LineSight-Technologies/kit with CI.
2. All 45 manifest entries built with tests + catalog entries.
3. KIT.md + .claude/skills/design-kit + scripts/sync.mjs (pull/push/check).
4. LineSight PR (off dev): packages/kit vendored, 3 apps aliased + Tailwind content, platform preset swap,
   ESLint warns, CI `kit check`, CLAUDE.md section. PR opened, NOT merged.
5. Carbon: vendored, /design route with <Catalog/>, shell on AppShell. Only after the Phase 0 agent commits.
6. Memory updated.

## State
- [x] Recon (3 agents) — findings folded into spec
- [x] Repo scaffold + tokens (tokens.css, preset v3, theme v4, base.css) + tone map + manifest + class lint — committed
- [ ] Batch A1 core primitives — agent running (barrels _batch-a1.ts / entries.batch-a1.ts)
- [ ] Batch A2 form primitives — agent running (_batch-a2 / entries.batch-a2)
- [ ] Batch B overlays — agent running (_batch-b / entries.batch-b)
- [ ] Batch E catalog renderer + foundations + gen-kit-md + visual tests — agent running
- [ ] Batch C patterns: app-shell, page, toolbar, empty-state, stat — AFTER A1/A2/B
- [ ] Batch D patterns: data-table, detail-panel, form, list, entity-card — AFTER A1/A2/B
- [ ] KIT.md prose, skill, sync.mjs, CI workflow — me, now
- [ ] Merge barrels into src/index.ts + entries.ts; regenerate snapshots; full `npm run check`
- [ ] Create GitHub repo LineSight-Technologies/kit (private), push, CI green
- [ ] LineSight integration PR
- [ ] Carbon integration
- [ ] Memory + Notion → PR

## Decisions
- Own repo + source vendoring via sync script (no npm registry: no npm login; private registry = token in
  every Vercel build and laptop). `kit check` in consumer CI blocks local-only edits.
- Canonical tokens = platform brand values; ERP's warm-shifted palette not adopted (override allowed).
- Tailwind v3/v4 compatible class subset enforced by scripts/lint-classes.mjs.
- No Storybook; in-house Catalog component rendered by playground and by Carbon /design.
- Legacy components/ui folders frozen, not migrated; new work uses the kit.

## Files (kit repo) — all mine unless noted
package.json, tsconfig.json, eslint.config.js, vitest.config.ts, playwright.config.ts, tests/setup.ts,
playground/{index.html,main.tsx,styles.css,vite.config.ts,public/fonts}, src/tokens/*, src/lib/{cn,tone}.ts,
src/catalog/{types,manifest,entries,index}.ts, src/catalog/Catalog.tsx (placeholder → batch E),
scripts/lint-classes.mjs, docs/CONVENTIONS.md, docs/superpowers/specs/…design.md
