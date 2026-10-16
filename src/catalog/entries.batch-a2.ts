import type { KitEntry } from "./types";
import { inputEntry } from "../primitives/input/input.entry";
import { textareaEntry } from "../primitives/textarea/textarea.entry";
import { selectEntry } from "../primitives/select/select.entry";
import { comboboxEntry } from "../primitives/combobox/combobox.entry";
import { checkboxEntry } from "../primitives/checkbox/checkbox.entry";
import { switchEntry } from "../primitives/switch/switch.entry";
import { radioGroupEntry } from "../primitives/radio-group/radio-group.entry";
import { fieldEntry } from "../primitives/field/field.entry";

/** Manifest order: input, textarea, select, combobox, checkbox, switch, radio-group, field. */
export const entries: KitEntry[] = [
  inputEntry,
  textareaEntry,
  selectEntry,
  comboboxEntry,
  checkboxEntry,
  switchEntry,
  radioGroupEntry,
  fieldEntry,
];
