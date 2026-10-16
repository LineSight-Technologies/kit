#!/usr/bin/env node
/**
 * Tailwind v3 ↔ v4 compatibility lint for kit components.
 * Kit source is compiled by each consumer's own Tailwind (v3 in the platform/ERP/catalog, v4 in Carbon),
 * so every class must mean the same thing in both. This bans the ones that do not, plus the design rules
 * the kit exists to enforce (no stock hues, no raw hex, no progress bars).
 *
 * Usage: node scripts/lint-classes.mjs [dir...]   (default: src)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const roots = process.argv.slice(2).length ? process.argv.slice(2) : ["src"];

const RULES = [
  // v3/v4 divergence
  { re: /(?<![\w-])shadow(?:-(?:sm|md|lg|xl|2xl|inner|none))?(?![\w-])/g, msg: "bare shadow scale differs between v3 and v4 — use shadow-ls-1|2|3|flame" },
  { re: /(?<![\w-])rounded(?:-(?:[tblr]|[tb][lr]|[se]|ss|se|es|ee))?(?![\w-])/g, msg: "bare `rounded` differs between v3 and v4 — give a size: rounded-sm|md|lg|xl|full" },
  { re: /(?<![\w-])rounded(?:-(?:[tblr]|[tb][lr]|[se]|ss|se|es|ee))?-(?:none|xs|2xl|3xl|4xl)(?![\w-])/g, msg: "un-themed radius — use rounded-sm|md|lg|xl|full" },
  { re: /(?<![\w-])(?:space|divide)-[xy](?:-[\w.]+)?(?![\w-])/g, msg: "space-*/divide-* selectors changed in v4 — use gap and explicit borders" },
  { re: /(?<![\w-])(?:bg|text|border|ring|placeholder)-opacity-\d+/g, msg: "*-opacity-* utilities were removed in v4" },
  { re: /(?<![\w-])flex-(?:shrink|grow)(?:-\d+)?(?![\w-])/g, msg: "use shrink-*/grow-*" },
  { re: /(?<![\w-])ring(?![\w-])/g, msg: "bare `ring` width differs (3px v3, 1px v4) — use ring-1|2 with an explicit colour" },
  { re: /(?<![\w-])(?:blur|drop-shadow|backdrop-blur)(?:-(?:sm|md|lg|xl|2xl|3xl))?(?![\w-])/g, msg: "blur/drop-shadow scale renamed in v4 — use an arbitrary value, e.g. blur-[4px]" },
  { re: /(?<![\w-])(?:inset-shadow|text-shadow|inset-ring)-/g, msg: "v4-only utility" },
  { re: /(?<![\w-])container(?![\w-])/g, msg: "`container` differs — use max-w-page mx-auto" },
  { re: /(?<![\w-])!(?=[a-z])/g, msg: "important modifier position changed in v4 — restructure instead" },
  { re: /(?<![\w-])\*\*?:/g, msg: "`*:`/`**:` variants are v4-only" },
  { re: /(?<![\w-])(?:first|last|odd|even):(?:[a-z-]+):/g, msg: "stacked variants apply in the opposite order in v4" },
  { re: /theme\(/g, msg: "theme() is not available in v4 — use var(--ls-*)" },
  { re: /\[--[\w-]+\]/g, msg: "`[--var]` shorthand changed in v4 — write [var(--x)]" },
  { re: /(?<![\w-])animate-(?:in|out|spin|ping|pulse|bounce)(?![\w-])/g, msg: "plugin/default animations — use animate-ls-*" },
  { re: /(?<![\w-])(?:fade|zoom|slide)-(?:in|out)-/g, msg: "tailwindcss-animate classes — use animate-ls-*" },
  { re: /(?<![\w-])(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|accent|caret|shadow)-(?:surface|line|fg|accent|focus|success|warn|danger|info|neutral|ink|paper|flame|ember)(?:-[\w]+)?\/\d+/g, msg: "prefer the -soft tint over an opacity modifier on a token colour", warnOnly: true },
  { re: /(?<![\w-])(?:sm|md|lg|xl|2xl):hover:/g, msg: "responsive+hover stacking reads differently in v4 — split the classes" },
  // design rules
  { re: /(?<![\w-])(?:bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|divide|placeholder|shadow)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?![\w-])/g, msg: "stock Tailwind hue — use a semantic token (surface/line/fg/accent/status)" },
  { re: /(?<![\w-])(?:bg|text|border|ring|from|to|via|fill|stroke|outline|shadow)-\[#[0-9a-fA-F]{3,8}\]/g, msg: "raw hex in a class — add a token" },
  { re: /(?<![\w-])(?:bg|text|border)-(?:white|black)(?![\w-])/g, msg: "white/black are not brand colours — use surface/fg/ink/paper" },
  { re: /<progress\b/g, msg: "progress bars are banned in LineSight UI" },
  { re: /role=["']progressbar["']/g, msg: "progress bars are banned in LineSight UI" },
  { re: /(?<![\w-])font-(?:serif|mono)(?![\w-])/g, msg: "no serif; monospace only for code/measurements via font-mono in app code, not kit chrome", warnOnly: true },
];

const SKIP_DIRS = new Set(["node_modules", "dist", "__snapshots__"]);
const EXT = /\.(tsx|ts|css)$/;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (EXT.test(name) && !/\.test\.tsx?$/.test(name)) yield p;
  }
}

let errors = 0;
let warnings = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    // tokens files legitimately contain hex and v4-only syntax
    if (/src[\\/]tokens[\\/]/.test(file) || /manifest\.ts$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    const lines = text.split("\n");
    lines.forEach((line, i) => {
      if (/lint-classes-ignore/.test(line)) return;
      // only inspect string literals and template literals, where classes live
      const strings = line.match(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g);
      if (!strings) return;
      for (const s of strings) {
        for (const rule of RULES) {
          rule.re.lastIndex = 0;
          const m = rule.re.exec(s);
          if (m) {
            const rel = relative(process.cwd(), file);
            const level = rule.warnOnly ? "warn" : "error";
            console.log(`${rel}:${i + 1}: ${level}: \`${m[0]}\` — ${rule.msg}`);
            if (rule.warnOnly) warnings++;
            else errors++;
          }
        }
      }
    });
  }
}

if (errors) {
  console.error(`\nlint-classes: ${errors} error(s), ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`lint-classes: clean (${warnings} warning(s))`);
}
