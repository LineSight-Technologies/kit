"use client";

import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Check, Copy, Search } from "lucide-react";
import { MANIFEST } from "./manifest";
import { ENTRIES } from "./entries";
import { entries as FOUNDATION_ENTRIES } from "./entries.foundations";
import type { KitEntry, KitExample, KitGroup, KitMeta } from "./types";

/**
 * The living catalog. Rendered by the playground (Vite) and inside Carbon (Next.js app router), so:
 * no router, no import.meta.glob, window guarded for SSR. Navigation lives in the URL hash
 * (`#button`, or `#button?bare` for the chrome-less view that visual snapshots capture); a host that
 * wants to own navigation passes `entryId` + `onNavigate` instead.
 */
export interface CatalogProps {
  /** Extra or replacement entries. Merged over the kit's own list by id (later wins). */
  entries?: KitEntry[];
  /** Controlled selection. When set, the hash is ignored for selection. */
  entryId?: string;
  /** Called with the id when the user picks an entry. */
  onNavigate?: (id: string) => void;
  /** Examples only, stacked, no chrome. Also triggered by `#<id>?bare`. */
  bare?: boolean;
  className?: string;
}

/* ---------------------------------------------------------------- hash state */

interface HashState {
  id: string | null;
  bare: boolean;
}

export function parseHash(hash: string): HashState {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return { id: null, bare: false };
  const [idPart = "", query = ""] = raw.split("?");
  let id: string | null = null;
  try {
    id = decodeURIComponent(idPart) || null;
  } catch {
    id = idPart || null;
  }
  const bare = query
    .split("&")
    .map((p) => p.split("=")[0])
    .includes("bare");
  return { id, bare };
}

const noop = () => {};
function subscribeHash(onChange: () => void) {
  if (typeof window === "undefined") return noop;
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
const getHash = () => (typeof window === "undefined" ? "" : window.location.hash);
const getServerHash = () => "";

/* ---------------------------------------------------------------- helpers */

function groupsInOrder(meta: readonly KitMeta[]): KitGroup[] {
  const out: KitGroup[] = [];
  for (const m of meta) if (!out.includes(m.group)) out.push(m.group);
  return out;
}

function mergeEntries(lists: KitEntry[][]): Map<string, KitEntry> {
  const map = new Map<string, KitEntry>();
  for (const list of lists) for (const e of list) map.set(e.id, e);
  return map;
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

const STAGE = "rounded-lg border border-line bg-surface p-6";
const CODE = "overflow-auto rounded-md bg-surface-2 p-3 pr-12 font-mono text-xs leading-relaxed text-fg"; // lint-classes-ignore
const MONO = "font-mono text-xs"; // lint-classes-ignore

/* ---------------------------------------------------------------- pieces */

interface BoundaryProps {
  children: ReactNode;
  resetKey: string;
}
interface BoundaryState {
  failed: boolean;
}

/** An example that throws must not take the catalog down with it. */
class ExampleBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };
  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }
  componentDidUpdate(prev: BoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed) return <div className="text-sm text-danger">Failed to render</div>;
    return this.props.children;
  }
}

function Stage({ example, entryId }: { example: KitExample; entryId: string }) {
  return (
    <div data-stage={example.title} className={example.wide ? `${STAGE} overflow-x-auto` : STAGE}>
      <ExampleBoundary resetKey={`${entryId}:${example.title}`}>{example.render()}</ExampleBoundary>
    </div>
  );
}

function NotBuilt() {
  return (
    <div data-stage="not-built" className={`${STAGE} text-sm text-fg-3`}>
      Not built yet
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const onCopy = useCallback(async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable: nothing to do */
    }
  }, [text]);
  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md text-fg-3 outline-none transition-colors duration-1 hover:bg-surface-3 hover:text-fg focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <pre className={CODE}>
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function PropsTable({ entry }: { entry: KitEntry }) {
  if (!entry.props || entry.props.length === 0) return null;
  return (
    <section aria-label="Props" className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Props</h2>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-2 text-xs font-medium text-fg-2">
            <tr>
              <th scope="col" className="px-3 py-2">Name</th>
              <th scope="col" className="px-3 py-2">Type</th>
              <th scope="col" className="px-3 py-2">Default</th>
              <th scope="col" className="px-3 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name} className="border-t border-line align-top">
                <td className={`px-3 py-2 ${MONO} text-fg`}>{p.name}</td>
                <td className={`px-3 py-2 ${MONO} text-fg-2`}>{p.type}</td>
                <td className={`px-3 py-2 ${MONO} text-fg-3`}>{p.default ?? ""}</td>
                <td className="px-3 py-2 text-fg-2">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EntryView({ meta, entry }: { meta: KitMeta; entry: KitEntry | undefined }) {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-2xl tracking-ls-display">{meta.name}</h1>
        <p className="max-w-prose text-fg-2">{meta.when}</p>
      </header>
      {entry ? (
        entry.examples.map((ex) => (
          <section key={ex.title} aria-label={ex.title} className="flex flex-col gap-3">
            <h2 className="text-sm font-medium">{ex.title}</h2>
            <Stage example={ex} entryId={entry.id} />
            {ex.code ? <CodeBlock code={ex.code} /> : null}
          </section>
        ))
      ) : (
        <NotBuilt />
      )}
      {entry ? <PropsTable entry={entry} /> : null}
    </article>
  );
}

function BareView({ meta, entry }: { meta: KitMeta; entry: KitEntry | undefined }) {
  return (
    <div data-bare={meta.id} className="flex flex-col gap-6 bg-surface p-6 text-fg">
      {entry ? entry.examples.map((ex) => <Stage key={ex.title} example={ex} entryId={entry.id} />) : <NotBuilt />}
    </div>
  );
}

/* ---------------------------------------------------------------- catalog */

export function Catalog({ entries: extraEntries, entryId, onNavigate, bare: bareProp, className }: CatalogProps) {
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const parsed = useMemo(() => parseHash(hash), [hash]);

  const entryMap = useMemo(() => mergeEntries([FOUNDATION_ENTRIES, ENTRIES, extraEntries ?? []]), [extraEntries]);
  const groups = useMemo(() => groupsInOrder(MANIFEST), []);

  const firstId = MANIFEST[0]?.id ?? null;
  const requestedId = entryId ?? parsed.id ?? firstId;
  const meta = MANIFEST.find((m) => m.id === requestedId) ?? MANIFEST[0];
  const activeId = meta?.id ?? null;
  const entry = activeId ? entryMap.get(activeId) : undefined;
  const bare = bareProp ?? parsed.bare;

  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bare) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bare]);

  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      needle
        ? MANIFEST.filter((m) => `${m.name} ${m.id} ${m.summary}`.toLowerCase().includes(needle))
        : [...MANIFEST],
    [needle],
  );

  if (!meta) return null;

  if (bare) return <BareView meta={meta} entry={entry} />;

  const handleNav = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(id);
    }
  };

  return (
    <div className={["flex min-h-screen bg-surface text-fg", className].filter(Boolean).join(" ")}>
      <aside className="sticky top-0 flex max-h-screen w-sidebar shrink-0 flex-col self-start overflow-y-auto border-r border-line bg-surface-2">
        <div className="p-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setQuery("");
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Search"
              aria-label="Search components"
              className="h-control-sm w-full rounded-md border border-line bg-surface pl-8 pr-2.5 text-sm text-fg outline-none transition-colors duration-1 placeholder:text-fg-3 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2"
            />
          </label>
        </div>
        <nav aria-label="Catalog" className="flex flex-col gap-4 px-3 pb-6">
          {groups.map((group) => {
            const items = visible.filter((m) => m.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group} className="flex flex-col gap-0.5">
                <div className="px-2 pb-1 text-xs font-medium text-fg-3">{group}</div>
                {items.map((m) => {
                  const active = m.id === activeId;
                  const built = entryMap.has(m.id);
                  return (
                    <a
                      key={m.id}
                      href={`#${m.id}`}
                      onClick={handleNav(m.id)}
                      aria-current={active ? "page" : undefined}
                      data-built={built ? "true" : "false"}
                      className={[
                        "flex h-control-sm items-center rounded-md px-2 text-sm outline-none transition-colors duration-1 focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
                        active ? "bg-surface-3 font-medium text-fg" : built ? "text-fg-2 hover:bg-surface-3 hover:text-fg" : "text-fg-3 hover:bg-surface-3 hover:text-fg-2",
                      ].join(" ")}
                    >
                      {m.name}
                    </a>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="max-w-page px-8 py-6">
          <EntryView key={meta.id} meta={meta} entry={entry} />
        </div>
      </main>
    </div>
  );
}

Catalog.displayName = "Catalog";
