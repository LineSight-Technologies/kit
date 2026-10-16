# @linesight/kit

LineSight's design kit: tokens, primitives and screen patterns shared by every LineSight React app
(platform, ERP, catalog, Carbon). **Read `KIT.md`** — it is the contract for building any screen.

```bash
npm install
npm run dev            # catalog on http://127.0.0.1:5190
npm run check          # typecheck + lint (incl. Tailwind v3/v4 class subset) + unit tests + docs check
npm run test:visual:docker   # Playwright snapshots, in the same image CI uses
```

Consumers vendor this repo at `packages/kit` with `node packages/kit/scripts/sync.mjs pull|push|check`.
Design spec: `docs/superpowers/specs/2026-10-16-design-kit-design.md`. Code conventions: `docs/CONVENTIONS.md`.
