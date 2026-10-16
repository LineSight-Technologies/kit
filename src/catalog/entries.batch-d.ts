// Batch D catalog entries, in manifest order.
import type { KitEntry } from "./types";
import { dataTableEntry } from "../patterns/data-table/data-table.entry";
import { detailPanelEntry } from "../patterns/detail-panel/detail-panel.entry";
import { formEntry } from "../patterns/form/form.entry";
import { listEntry } from "../patterns/list/list.entry";
import { entityCardEntry } from "../patterns/entity-card/entity-card.entry";

export const entries: KitEntry[] = [dataTableEntry, detailPanelEntry, formEntry, listEntry, entityCardEntry];
