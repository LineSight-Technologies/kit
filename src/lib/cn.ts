import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes; later classes win on conflicts. Every kit component applies `className` last through this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
