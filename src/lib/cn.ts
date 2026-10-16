import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge configured for the kit's custom scales, so `className="h-12"` on a Button replaces
 * `h-control` instead of leaving both, and `shadow-ls-2` replaces `shadow-ls-1`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      h: [{ h: ["control", "control-sm", "control-lg"] }],
      "min-h": [{ "min-h": ["control"] }],
      w: [{ w: ["sidebar", "rail"] }],
      "max-w": [{ "max-w": ["page"] }],
      shadow: [{ shadow: ["ls-1", "ls-2", "ls-3", "ls-flame"] }],
      z: [{ z: ["sticky", "dropdown", "sheet", "dialog", "toast", "tooltip"] }],
      rounded: [{ rounded: ["sm", "md", "lg", "xl", "full"] }],
    },
  },
});

/** Merge Tailwind classes; later classes win on conflicts. Every kit component applies `className` last through this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
