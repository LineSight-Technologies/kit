import type { KitEntry } from "./types";
import { buttonEntry } from "../primitives/button/button.entry";
import { iconButtonEntry } from "../primitives/icon-button/icon-button.entry";
import { badgeEntry } from "../primitives/badge/badge.entry";
import { avatarEntry } from "../primitives/avatar/avatar.entry";
import { tooltipEntry } from "../primitives/tooltip/tooltip.entry";
import { separatorEntry } from "../primitives/separator/separator.entry";
import { skeletonEntry } from "../primitives/skeleton/skeleton.entry";
import { spinnerEntry } from "../primitives/spinner/spinner.entry";
import { kbdEntry } from "../primitives/kbd/kbd.entry";

/** Batch A1 entries, in manifest order. */
export const entries: KitEntry[] = [
  buttonEntry,
  iconButtonEntry,
  badgeEntry,
  avatarEntry,
  tooltipEntry,
  separatorEntry,
  skeletonEntry,
  spinnerEntry,
  kbdEntry,
];
