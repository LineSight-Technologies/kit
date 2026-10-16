#!/usr/bin/env node
/**
 * kit sync — keeps a consumer's vendored copy of @linesight/kit (packages/kit) in step with the
 * source of truth, github.com/LineSight-Technologies/kit.
 *
 *   node packages/kit/scripts/sync.mjs pull [ref]     replace the vendored copy with upstream <ref> (default main)
 *   node packages/kit/scripts/sync.mjs check [--strict]  fail if the vendored copy differs from the pinned commit;
 *                                                     warn (or fail with --strict) if upstream main moved on
 *   node packages/kit/scripts/sync.mjs push [branch]  open a PR on the kit repo with the vendored copy's changes
 *
 * Why vendoring: no npm registry login exists, and a private registry would need a token in every Vercel
 * build and on every laptop. Source vendoring also lets Claude extend the kit in place while building a
 * screen, then `push` the change upstream. `check` in CI is what stops local-only edits from shipping.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const UPSTREAM = "https://github.com/LineSight-Technologies/kit.git";
/** Paths (relative to the kit root) that are vendored. Everything else in the kit repo stays upstream. */
const VENDORED = ["src", "scripts/sync.mjs", "scripts/lint-classes.mjs", "docs/CONVENTIONS.md", "KIT.md", "package.json", ".claude/skills/design-kit"];
const VERSION_FILE = "KIT_VERSION";

const here = dirname(fileURLToPath(import.meta.url));
const kitDir = resolve(here, "..");
const repoRoot = sh("git", ["rev-parse", "--show-toplevel"], { cwd: kitDir }).trim();
const repoName = basename(repoRoot);
const [cmd = "help", ...args] = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const positional = args.filter((a) => !a.startsWith("--"));

function sh(bin, argv, opts = {}) {
  return execFileSync(bin, argv, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], ...opts });
}
function run(bin, argv, opts = {}) {
  const r = spawnSync(bin, argv, { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`${bin} ${argv.join(" ")} failed (${r.status})`);
}
function cloneUpstream(ref) {
  const dir = mkdtempSync(join(tmpdir(), "linesight-kit-"));
  if (/^[0-9a-f]{40}$/.test(ref)) {
    sh("git", ["init", "-q"], { cwd: dir });
    sh("git", ["remote", "add", "origin", UPSTREAM], { cwd: dir });
    sh("git", ["fetch", "-q", "--depth", "1", "origin", ref], { cwd: dir });
    sh("git", ["checkout", "-q", "FETCH_HEAD"], { cwd: dir });
  } else {
    sh("git", ["clone", "-q", "--depth", "1", "--branch", ref, UPSTREAM, dir]);
  }
  return dir;
}
function headOf(dir) {
  return sh("git", ["rev-parse", "HEAD"], { cwd: dir }).trim();
}
function upstreamMainSha() {
  return sh("git", ["ls-remote", UPSTREAM, "refs/heads/main"]).split("\t")[0].trim();
}
function copyVendored(from, to) {
  for (const p of VENDORED) {
    const src = join(from, p);
    const dst = join(to, p);
    rmSync(dst, { recursive: true, force: true });
    if (existsSync(src)) cpSync(src, dst, { recursive: true });
  }
}
function listFiles(root, rel = "") {
  const out = [];
  const abs = join(root, rel);
  if (!existsSync(abs)) return out;
  if (statSync(abs).isFile()) return [rel];
  for (const name of readdirSync(abs)) {
    if (name === "node_modules" || name === "__snapshots__") continue;
    out.push(...listFiles(root, join(rel, name)));
  }
  return out;
}
function diffVendored(a, b) {
  const files = new Set();
  for (const p of VENDORED) for (const f of [...listFiles(a, p), ...listFiles(b, p)]) files.add(f);
  const changed = [];
  for (const f of [...files].sort()) {
    const fa = join(a, f);
    const fb = join(b, f);
    if (!existsSync(fa) || !existsSync(fb)) changed.push(f);
    else if (!readFileSync(fa).equals(readFileSync(fb))) changed.push(f);
  }
  return changed;
}
function pinned() {
  const f = join(kitDir, VERSION_FILE);
  return existsSync(f) ? readFileSync(f, "utf8").trim() : null;
}
function installSkill() {
  const src = join(kitDir, ".claude/skills/design-kit");
  const dst = join(repoRoot, ".claude/skills/design-kit");
  if (!existsSync(src)) return;
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
  console.log(`skill installed → ${relative(repoRoot, dst)}`);
}
function checkDeps() {
  const cfgPath = join(repoRoot, "kit.config.json");
  if (!existsSync(cfgPath)) return;
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  const kitPkg = JSON.parse(readFileSync(join(kitDir, "package.json"), "utf8"));
  const wanted = { ...kitPkg.dependencies };
  for (const app of cfg.apps ?? []) {
    const appDir = join(repoRoot, app);
    const pkgPath = join(appDir, "package.json");
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    const have = { ...pkg.dependencies, ...pkg.devDependencies };
    const missing = Object.entries(wanted).filter(([name]) => !have[name]);
    if (missing.length) {
      console.log(`\n${app}: missing kit dependencies — run:`);
      console.log(`  npm --prefix ${app} i ${missing.map(([n, v]) => `${n}@"${v}"`).join(" ")}`);
    }
  }
}

function pull() {
  const ref = positional[0] ?? "main";
  const clone = cloneUpstream(ref);
  try {
    const sha = headOf(clone);
    copyVendored(clone, kitDir);
    writeFileSync(join(kitDir, VERSION_FILE), sha + "\n");
    console.log(`pulled ${UPSTREAM} @ ${sha.slice(0, 12)} into ${relative(repoRoot, kitDir)}`);
    installSkill();
    checkDeps();
  } finally {
    rmSync(clone, { recursive: true, force: true });
  }
}

function check() {
  const sha = pinned();
  if (!sha) {
    console.error(`${VERSION_FILE} missing — run \`sync.mjs pull\` first`);
    process.exit(1);
  }
  const clone = cloneUpstream(sha);
  try {
    const changed = diffVendored(clone, kitDir);
    if (changed.length) {
      console.error(`vendored kit differs from upstream ${sha.slice(0, 12)}:`);
      for (const f of changed) console.error(`  ${f}`);
      console.error(`\nEither \`sync.mjs push\` these changes upstream, or \`sync.mjs pull\` to discard them.`);
      process.exit(1);
    }
    console.log(`vendored kit matches upstream ${sha.slice(0, 12)}`);
  } finally {
    rmSync(clone, { recursive: true, force: true });
  }
  const main = upstreamMainSha();
  if (main && main !== sha) {
    const msg = `upstream main is at ${main.slice(0, 12)}; run \`sync.mjs pull\` to update`;
    if (flags.has("--strict")) {
      console.error(msg);
      process.exit(1);
    }
    console.log(msg);
  }
}

function push() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13).replace("T", "-");
  const branch = positional[0] ?? `sync/${repoName}-${stamp}`;
  const clone = cloneUpstream("main");
  try {
    copyVendored(kitDir, clone);
    const status = sh("git", ["status", "--porcelain"], { cwd: clone }).trim();
    if (!status) {
      console.log("nothing to push — vendored kit equals upstream main");
      return;
    }
    const files = status.split("\n").map((l) => l.slice(3)).join("\n  ");
    run("git", ["checkout", "-q", "-b", branch], { cwd: clone });
    run("git", ["add", "-A"], { cwd: clone });
    run("git", ["commit", "-q", "-m", `kit: changes from ${repoName}\n\nFiles:\n  ${files}`], { cwd: clone });
    run("git", ["push", "-q", "-u", "origin", branch], { cwd: clone });
    const title = `kit: changes from ${repoName}`;
    const body = `Pushed from \`${repoName}\` via \`sync.mjs push\`.\n\nFiles:\n\`\`\`\n${files}\n\`\`\`\n\nAfter merge, run \`node packages/kit/scripts/sync.mjs pull\` in every consumer.`;
    const r = spawnSync("gh", ["pr", "create", "--repo", "LineSight-Technologies/kit", "--head", branch, "--title", title, "--body", body], { encoding: "utf8" });
    if (r.status === 0) console.log(r.stdout.trim());
    else console.log(`branch ${branch} pushed; open the PR manually (gh pr create failed):\n${r.stderr}`);
  } finally {
    rmSync(clone, { recursive: true, force: true });
  }
}

const commands = { pull, check, push };
if (!commands[cmd]) {
  console.log(readFileSync(fileURLToPath(import.meta.url), "utf8").split("*/")[0].split("\n").slice(1).map((l) => l.replace(/^ \* ?/, "")).join("\n"));
  process.exit(cmd === "help" ? 0 : 1);
}
commands[cmd]();
