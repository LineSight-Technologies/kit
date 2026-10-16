import type { KitEntry } from "./types";

/**
 * Explicit list (no import.meta.glob — Carbon is Next, not Vite). Order follows manifest.ts.
 * Each agent adding a component appends its `<id>.entry.tsx` import here.
 */
export const ENTRIES: KitEntry[] = [];
