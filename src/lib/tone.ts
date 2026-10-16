/**
 * One tone vocabulary for every status-coloured thing (Badge, StatusBadge, Alert, StatTile delta,
 * Timeline dot, DataTable row marker). Add a tone here, never a one-off colour in a component.
 */
export const TONES = ["neutral", "accent", "success", "warn", "danger", "info"] as const;
export type Tone = (typeof TONES)[number];

/** Soft fill + strong text: the default badge / alert look. */
export const toneSoft: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-fg-2",
  accent: "bg-accent-soft text-ember",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
};

/** Solid fill: used sparingly (counts on a dark surface, selected chips). */
export const toneSolid: Record<Tone, string> = {
  neutral: "bg-ink text-fg-inverse",
  accent: "bg-accent text-accent-fg",
  success: "bg-success text-fg-inverse",
  warn: "bg-warn text-fg-inverse",
  danger: "bg-danger text-fg-inverse",
  info: "bg-info text-fg-inverse",
};

/** Text only: inline status words, deltas. */
export const toneText: Record<Tone, string> = {
  neutral: "text-fg-2",
  accent: "text-accent",
  success: "text-success",
  warn: "text-warn",
  danger: "text-danger",
  info: "text-info",
};

/** Dot / marker fill. */
export const toneDot: Record<Tone, string> = {
  neutral: "bg-paper-6",
  accent: "bg-accent",
  success: "bg-success",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
};
