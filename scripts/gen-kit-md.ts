#!/usr/bin/env -S npx tsx
/**
 * Regenerates the catalog table in KIT.md from src/catalog/manifest.ts.
 *
 *   npx tsx scripts/gen-kit-md.ts            rewrite the block between the markers
 *   npx tsx scripts/gen-kit-md.ts --check    exit 1 if the file would change (CI)
 *
 * Only the section between `<!-- catalog:start -->` and `<!-- catalog:end -->` is touched; the prose
 * around it is hand-written. If KIT.md does not exist it is created with just the markers.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { MANIFEST } from "../src/catalog/manifest";
import type { KitGroup, KitMeta } from "../src/catalog/types";

const START = "<!-- catalog:start -->";
const END = "<!-- catalog:end -->";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const kitMd = resolve(root, "KIT.md");
const check = process.argv.includes("--check");

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\r?\n/g, " ").trim();

function renderTable(rows: readonly KitMeta[]): string {
  const lines = ["| Component | Use it for | When |", "|---|---|---|"];
  for (const m of rows) lines.push(`| ${cell(m.name)} | ${cell(m.summary)} | ${cell(m.when)} |`);
  return lines.join("\n");
}

function renderCatalog(manifest: readonly KitMeta[]): string {
  const groups: KitGroup[] = [];
  for (const m of manifest) if (!groups.includes(m.group)) groups.push(m.group);
  const parts = groups.map((g) => `### ${g}\n\n${renderTable(manifest.filter((m) => m.group === g))}`);
  return `${START}\n\n${parts.join("\n\n")}\n\n${END}`;
}

function splice(current: string, block: string): string {
  const a = current.indexOf(START);
  const b = current.indexOf(END);
  if (a === -1 || b === -1 || b < a) {
    throw new Error(`KIT.md is missing the ${START} / ${END} markers`);
  }
  return current.slice(0, a) + block + current.slice(b + END.length);
}

const block = renderCatalog(MANIFEST);
const existed = existsSync(kitMd);
const current = existed ? readFileSync(kitMd, "utf8") : `${START}\n${END}\n`;
const next = splice(current, block);

if (check) {
  if (!existed || next !== current) {
    console.error("KIT.md catalog table is out of date. Run: npx tsx scripts/gen-kit-md.ts");
    process.exit(1);
  }
  console.log("KIT.md catalog table is up to date.");
} else if (next !== current || !existed) {
  writeFileSync(kitMd, next);
  console.log(`${existed ? "Updated" : "Created"} KIT.md (${MANIFEST.length} entries).`);
} else {
  console.log("KIT.md already up to date.");
}
