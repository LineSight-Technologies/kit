import type { ReactNode } from "react";

export type KitGroup = "Foundations" | "Primitives" | "Patterns";

/** Metadata only (no JSX) so scripts can import it under plain Node. Lives in manifest.ts. */
export interface KitMeta {
  /** kebab-case, equals the folder name */
  id: string;
  name: string;
  group: KitGroup;
  /** One line. Goes into KIT.md's catalog table. */
  summary: string;
  /** When to use it and when not to, plain language, 1–3 sentences. */
  when: string;
}

export interface KitExample {
  title: string;
  render: () => ReactNode;
  /** Source snippet shown under the example. Keep it to the lines a builder would copy. */
  code?: string;
  /** Minimum width hint for the example frame. */
  wide?: boolean;
}

export interface KitProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface KitEntry extends KitMeta {
  examples: KitExample[];
  props?: KitProp[];
}
