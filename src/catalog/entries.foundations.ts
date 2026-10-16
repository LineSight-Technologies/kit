import type { KitEntry } from "./types";
import { colorsEntry } from "./foundations/colors.entry";
import { typographyEntry } from "./foundations/typography.entry";
import { shapeDepthEntry } from "./foundations/shape-depth.entry";
import { motionEntry } from "./foundations/motion.entry";
import { spacingLayoutEntry } from "./foundations/spacing-layout.entry";

/** Foundations pages. `Catalog` includes these by default; listing them again in entries.ts is harmless (deduped by id). */
export const entries: KitEntry[] = [colorsEntry, typographyEntry, shapeDepthEntry, motionEntry, spacingLayoutEntry];
