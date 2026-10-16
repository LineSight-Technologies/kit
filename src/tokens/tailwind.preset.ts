/**
 * Tailwind v3 preset. Every name here also exists in theme.v4.css, so kit components compile
 * identically under v3 (platform, ERP, catalog) and v4 (Carbon).
 *
 *   // tailwind.config.ts
 *   import kit from "../../packages/kit/src/tokens/tailwind.preset";
 *   export default { presets: [kit], content: [..., "../../packages/kit/src/**\/*.{ts,tsx}"] }
 *
 * Values are CSS variables from tokens.css, so an app can retune a token without touching Tailwind.
 * Consequence: opacity modifiers (`bg-accent/50`) do not work on these colours in v3 — use the `-soft`
 * tints instead. The kit's class lint enforces this.
 */
const v = (name: string) => `var(--ls-${name})`;

const scale = (name: string, steps: number, extra: Record<string, string> = {}) => {
  const out: Record<string, string> = { DEFAULT: v(name), ...extra };
  for (let i = 2; i <= steps; i++) out[String(i)] = v(`${name}-${i}`);
  return out;
};

const hsl = (name: string) => `hsl(var(--${name}))`;

export const kitTheme = {
  fontFamily: {
    sans: [v("font-sans")],
    display: [v("font-display")],
    mono: [v("font-mono")],
  },
  colors: {
    // Semantic (components use these)
    surface: { DEFAULT: v("surface"), 2: v("surface-2"), 3: v("surface-3"), inverse: v("surface-inverse") },
    line: { DEFAULT: v("line"), strong: v("line-strong") },
    fg: { DEFAULT: v("fg"), 2: v("fg-2"), 3: v("fg-3"), disabled: v("fg-disabled"), inverse: v("fg-inverse") },
    accent: { DEFAULT: v("accent"), hover: v("accent-hover"), fg: v("accent-fg"), soft: v("accent-soft"), foreground: hsl("accent-foreground") },
    focus: v("focus"),
    success: { DEFAULT: v("success"), soft: v("success-soft") },
    warn: { DEFAULT: v("warn"), soft: v("warn-soft") },
    danger: { DEFAULT: v("danger"), soft: v("danger-soft") },
    info: { DEFAULT: v("info"), soft: v("info-soft") },
    neutral: { soft: v("neutral-soft") },

    // Brand primitives (direct access: bg-ink, text-flame-2)
    ink: scale("ink", 6),
    paper: scale("paper", 6),
    flame: scale("flame", 6),
    ember: { DEFAULT: v("ember"), deep: v("ember-deep") },

    // Platform legacy names — keep existing classes rendering
    "ls-success": v("success"),
    "ls-warn": v("warn"),
    "ls-danger": v("danger"),
    "ls-info": v("info"),
    "steel-grey": v("paper-5"),
    "waste-red": v("danger"),
    "kpi-green": v("success"),
    "kpi-yellow": v("warn"),
    "kpi-red": v("danger"),

    // shadcn vocabulary (platform legacy)
    border: hsl("border"),
    input: hsl("input"),
    ring: hsl("ring"),
    background: hsl("background"),
    foreground: hsl("foreground"),
    primary: { DEFAULT: hsl("primary"), foreground: hsl("primary-foreground"), bg: v("paper-2") },
    secondary: { DEFAULT: hsl("secondary"), foreground: hsl("secondary-foreground") },
    destructive: { DEFAULT: hsl("destructive"), foreground: hsl("destructive-foreground") },
    muted: { DEFAULT: hsl("muted"), foreground: hsl("muted-foreground") },
    popover: { DEFAULT: hsl("popover"), foreground: hsl("popover-foreground") },
    card: { DEFAULT: hsl("card"), foreground: hsl("card-foreground") },
  },
  borderRadius: {
    sm: v("radius-sm"),
    md: v("radius-md"),
    lg: v("radius-lg"),
    xl: v("radius-xl"),
  },
  boxShadow: {
    "ls-1": v("shadow-1"),
    "ls-2": v("shadow-2"),
    "ls-3": v("shadow-3"),
    "ls-flame": v("shadow-flame"),
  },
  letterSpacing: {
    "ls-display": v("tracking-display"),
    "ls-tight": v("tracking-tight"),
    "ls-overline": "0.14em",
  },
  height: { control: v("control-md"), "control-sm": v("control-sm"), "control-lg": v("control-lg") },
  minHeight: { control: v("control-md") },
  width: { sidebar: v("sidebar"), rail: v("sidebar-rail") },
  maxWidth: { page: v("page-max") },
  zIndex: {
    sticky: v("z-sticky"),
    dropdown: v("z-dropdown"),
    sheet: v("z-sheet"),
    dialog: v("z-dialog"),
    toast: v("z-toast"),
    tooltip: v("z-tooltip"),
  },
  transitionTimingFunction: { "ls-out": v("ease-out"), "ls-inout": v("ease-inout") },
  transitionDuration: { 1: "150ms", 2: "200ms", 3: "320ms" },
  keyframes: {
    "ls-fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
    "ls-fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
    "ls-scale-in": { from: { opacity: "0", transform: "scale(0.97)" }, to: { opacity: "1", transform: "scale(1)" } },
    "ls-scale-out": { from: { opacity: "1", transform: "scale(1)" }, to: { opacity: "0", transform: "scale(0.97)" } },
    "ls-slide-in-right": { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
    "ls-slide-out-right": { from: { transform: "translateX(0)" }, to: { transform: "translateX(100%)" } },
    "ls-slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
    "ls-slide-out-left": { from: { transform: "translateX(0)" }, to: { transform: "translateX(-100%)" } },
    "ls-slide-in-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
    "ls-shimmer": { "0%": { transform: "translateX(-100%)" }, "100%": { transform: "translateX(100%)" } },
    "ls-spin": { to: { transform: "rotate(360deg)" } },
    "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
    "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
  },
  animation: {
    "ls-fade-in": "ls-fade-in 320ms var(--ls-ease-out)",
    "ls-fade-out": "ls-fade-out 150ms var(--ls-ease-inout)",
    "ls-scale-in": "ls-scale-in 200ms var(--ls-ease-out)",
    "ls-scale-out": "ls-scale-out 150ms var(--ls-ease-inout)",
    "ls-slide-in-right": "ls-slide-in-right 320ms var(--ls-ease-out)",
    "ls-slide-out-right": "ls-slide-out-right 200ms var(--ls-ease-inout)",
    "ls-slide-in-left": "ls-slide-in-left 320ms var(--ls-ease-out)",
    "ls-slide-out-left": "ls-slide-out-left 200ms var(--ls-ease-inout)",
    "ls-slide-in-up": "ls-slide-in-up 200ms var(--ls-ease-out)",
    "ls-shimmer": "ls-shimmer 1.6s linear infinite",
    "ls-spin": "ls-spin 0.8s linear infinite",
    "accordion-down": "accordion-down 0.2s ease-out",
    "accordion-up": "accordion-up 0.2s ease-out",
  },
  backgroundImage: {
    "waste-pattern": "repeating-linear-gradient(135deg, var(--ls-danger) 0px, var(--ls-danger) 2px, transparent 2px, transparent 6px)",
    "ls-wash": "radial-gradient(120% 140% at 50% -10%, #E26A2C 0%, #B94A17 28%, #6B2A10 62%, var(--ls-ember) 88%, var(--ls-ember-deep) 100%)",
  },
  backgroundSize: { "waste-size": "6px 6px" },
} as const;

// Typed loosely on purpose: this file is consumed by Tailwind v3 but typechecked here against v4's types.
const preset = {
  darkMode: "class",
  content: [] as string[],
  theme: { extend: kitTheme },
  plugins: [] as unknown[],
};

export default preset;
