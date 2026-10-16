/**
 * Date display shared by DataTable's date column and Timeline. Intl-based, en-US, no dependency.
 * Every formatter returns "" for an invalid date so callers can fall back to a dash.
 */
export type DateInput = Date | string | number;

export function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function valid(d: Date): boolean {
  return !Number.isNaN(d.getTime());
}

const dateFormat = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });
const dateTimeFormat = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** `Mar 4, 2026` */
export function formatDate(value: DateInput): string {
  const d = toDate(value);
  return valid(d) ? dateFormat.format(d) : "";
}

/** `Mar 4, 2026, 2:15 PM` */
export function formatDateTime(value: DateInput): string {
  const d = toDate(value);
  return valid(d) ? dateTimeFormat.format(d) : "";
}

const relativeFormat = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** `just now`, `12 minutes ago`, `yesterday`, `in 3 days`. Pass `now` to pin the reference point. */
export function formatRelative(value: DateInput, now: DateInput = Date.now()): string {
  const d = toDate(value);
  const ref = toDate(now);
  if (!valid(d) || !valid(ref)) return "";
  const diff = (d.getTime() - ref.getTime()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 45) return "just now";
  for (const [unit, seconds] of UNITS) {
    if (abs >= seconds) return relativeFormat.format(Math.round(diff / seconds), unit);
  }
  return relativeFormat.format(Math.round(diff), "second");
}
