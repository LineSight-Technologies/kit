// Batch C catalog entries, in manifest order.
import type { KitEntry } from "./types";
import { appShellEntry } from "../patterns/app-shell/app-shell.entry";
import { pageEntry } from "../patterns/page/page.entry";
import { toolbarEntry } from "../patterns/toolbar/toolbar.entry";
import { statEntry } from "../patterns/stat/stat.entry";
import { emptyStateEntry } from "../patterns/empty-state/empty-state.entry";

export const entries: KitEntry[] = [appShellEntry, pageEntry, toolbarEntry, statEntry, emptyStateEntry];
