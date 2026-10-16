// Batch B catalog entries, in manifest order.
import type { KitEntry } from "./types";
import { popoverEntry } from "../primitives/popover/popover.entry";
import { dropdownMenuEntry } from "../primitives/dropdown-menu/dropdown-menu.entry";
import { dialogEntry } from "../primitives/dialog/dialog.entry";
import { confirmDialogEntry } from "../primitives/confirm-dialog/confirm-dialog.entry";
import { sheetEntry } from "../primitives/sheet/sheet.entry";
import { tabsEntry } from "../primitives/tabs/tabs.entry";
import { toastEntry } from "../primitives/toast/toast.entry";
import { commandMenuEntry } from "../primitives/command-menu/command-menu.entry";
import { tableEntry } from "../primitives/table/table.entry";
import { paginationEntry } from "../primitives/pagination/pagination.entry";

export const entries: KitEntry[] = [
  popoverEntry,
  dropdownMenuEntry,
  dialogEntry,
  confirmDialogEntry,
  sheetEntry,
  tabsEntry,
  toastEntry,
  commandMenuEntry,
  tableEntry,
  paginationEntry,
];
