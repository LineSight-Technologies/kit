import type { KitEntry } from "./types";
import { entries as foundations } from "./entries.foundations";
import { entries as a1 } from "./entries.batch-a1";
import { entries as a2 } from "./entries.batch-a2";
import { entries as b } from "./entries.batch-b";

/** Explicit list (no import.meta.glob — Carbon is Next, not Vite). Catalog sorts by manifest order. */
export const ENTRIES: KitEntry[] = [...foundations, ...a1, ...a2, ...b];
