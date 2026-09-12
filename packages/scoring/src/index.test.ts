import { describe, expect, it } from "vitest";
import { PACKAGE_NAME } from "./index.js";

describe("@shipcheck/scoring", () => {
  it("builds and is importable", () => {
    expect(PACKAGE_NAME).toBe("@shipcheck/scoring");
  });
});
