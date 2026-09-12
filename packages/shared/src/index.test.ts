import { describe, expect, it } from "vitest";
import { CATEGORIES, SEVERITIES } from "./index.js";

describe("@shipcheck/shared", () => {
  it("exposes the six audit categories", () => {
    expect(CATEGORIES).toEqual([
      "performance",
      "seo",
      "accessibility",
      "security",
      "ux",
      "technical",
    ]);
  });

  it("exposes the three severity levels", () => {
    expect(SEVERITIES).toEqual(["critical", "warning", "info"]);
  });
});
