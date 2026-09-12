/**
 * Categories a ShipCheck finding can belong to.
 * Referenced by future check/scoring/reporter packages — kept here so every
 * package agrees on the same set of values.
 */
export const CATEGORIES = [
  "performance",
  "seo",
  "accessibility",
  "security",
  "ux",
  "technical",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SEVERITIES = ["critical", "warning", "info"] as const;

export type Severity = (typeof SEVERITIES)[number];
